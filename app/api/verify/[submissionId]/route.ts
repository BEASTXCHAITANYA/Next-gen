import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export const maxDuration = 60;

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function POST(
  request: Request,
  { params }: { params: { submissionId: string } }
) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const { submissionId } = params;

    if (!submissionId) {
      return NextResponse.json(
        { error: "Validation failed: 'submissionId' path parameter is required." },
        { status: 400, headers }
      );
    }

    // 1. Load Submission from Postgres
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: `Submission '${submissionId}' not found.` },
        { status: 404, headers }
      );
    }

    // 2. SATELLITE CHECK (Sentinel Hub Statistical API)
    let ndvi_score: number | null = null;
    try {
      const clientId = process.env.SENTINELHUB_CLIENT_ID;
      const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.warn("[Satellite Check] SENTINELHUB_CLIENT_ID or SENTINELHUB_CLIENT_SECRET is missing.");
      } else {
        // Step 2a: OAuth2 Token Request
        const tokenRes = await fetch("https://services.sentinel-hub.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });

        if (!tokenRes.ok) {
          const tokenErrText = await tokenRes.text();
          console.warn(`[Satellite Check] OAuth token request failed (${tokenRes.status}): ${tokenErrText}`);
        } else {
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;

          // Step 2b: Bounding box calculation (~50m buffer)
          const lat = submission.latitude;
          const lng = submission.longitude;
          const bufferDegLat = 0.00045; // ~50m
          const bufferDegLng = 0.00045 / Math.max(0.01, Math.cos((lat * Math.PI) / 180));

          const minLng = Number((lng - bufferDegLng).toFixed(6));
          const minLat = Number((lat - bufferDegLat).toFixed(6));
          const maxLng = Number((lng + bufferDegLng).toFixed(6));
          const maxLat = Number((lat + bufferDegLat).toFixed(6));

          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "default", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(samples) {
  let denominator = samples.B08 + samples.B04;
  let ndvi = denominator === 0 ? 0 : (samples.B08 - samples.B04) / denominator;
  return {
    default: [ndvi],
    dataMask: [samples.dataMask]
  };
}`;

          const statsRequestBody = {
            input: {
              bounds: {
                bbox: [minLng, minLat, maxLng, maxLat],
                properties: {
                  crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
                },
              },
              data: [
                {
                  type: "sentinel-2-l2a",
                  dataFilter: {
                    maxCloudCoverage: 80,
                  },
                },
              ],
            },
            aggregation: {
              timeRange: {
                from: thirtyDaysAgo.toISOString(),
                to: now.toISOString(),
              },
              aggregationInterval: {
                of: "P30D",
              },
              evalscript,
            },
          };

          const statsRes = await fetch("https://services.sentinel-hub.com/api/v1/statistics", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(statsRequestBody),
          });

          if (!statsRes.ok) {
            const statsErrText = await statsRes.text();
            console.warn(`[Satellite Check] Statistical API request failed (${statsRes.status}): ${statsErrText}`);
          } else {
            const statsData = await statsRes.json();
            const intervalData = statsData?.data?.[0];
            const bandStats =
              intervalData?.outputs?.default?.bands?.B0?.stats ||
              intervalData?.outputs?.default?.bands?.["0"]?.stats;

            if (bandStats && typeof bandStats.mean === "number" && !isNaN(bandStats.mean)) {
              ndvi_score = Number(bandStats.mean.toFixed(4));
              console.log(`[Satellite Check] NDVI score retrieved: ${ndvi_score}`);
            } else {
              console.warn("[Satellite Check] No valid mean NDVI found in Statistical API response.");
            }
          }
        }
      }
    } catch (satErr: any) {
      console.warn(`[Satellite Check] Failed with error: ${satErr.message || String(satErr)}`);
      ndvi_score = null;
    }

    // 3. PHOTO CHECK (OpenAI gpt-4o-mini vision)
    let photo_confidence: number | null = null;
    let reasoning: string | null = null;

    try {
      const openAiApiKey = process.env.OPENAI_API_KEY;

      if (!openAiApiKey) {
        console.warn("[Photo Check] OPENAI_API_KEY is missing in environment.");
        reasoning = "OpenAI API key missing in server configuration.";
      } else {
        let imagePayloadUrl = submission.photo_url;

        // Fetch image and convert to base64 for fast and reliable OpenAI Vision processing
        try {
          const pinataJwt = process.env.PINATA_JWT;
          const fetchHeaders: HeadersInit = { "User-Agent": "Mozilla/5.0" };
          if (pinataJwt && submission.photo_url.includes("pinata")) {
            fetchHeaders["Authorization"] = `Bearer ${pinataJwt}`;
          }
          const imgFetchRes = await fetch(submission.photo_url, {
            headers: fetchHeaders,
            signal: AbortSignal.timeout(10000),
          });
          if (imgFetchRes.ok) {
            const arrayBuffer = await imgFetchRes.arrayBuffer();
            const base64Str = Buffer.from(arrayBuffer).toString("base64");
            let contentType = imgFetchRes.headers.get("content-type") || "image/jpeg";
            if (!contentType.startsWith("image/")) {
              contentType = "image/jpeg";
            }
            imagePayloadUrl = `data:${contentType};base64,${base64Str}`;
          }
        } catch (fetchErr) {
          console.warn("[Photo Check] Direct image fetch for base64 conversion failed, falling back to photo_url");
        }

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Does this photo clearly show mangrove or coastal vegetation? Respond only with JSON: {\"confidence\": 0-100, \"reasoning\": string}",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imagePayloadUrl,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
          }),
        });

        if (!openAiRes.ok) {
          const openAiErrText = await openAiRes.text();
          console.warn(`[Photo Check] OpenAI Vision API call failed (${openAiRes.status}): ${openAiErrText}`);
          reasoning = `OpenAI API returned error status ${openAiRes.status}.`;
        } else {
          const openAiData = await openAiRes.json();
          const rawContent = openAiData?.choices?.[0]?.message?.content;

          if (rawContent) {
            const parsed = JSON.parse(rawContent);
            if (typeof parsed.confidence === "number") {
              photo_confidence = Math.max(0, Math.min(100, parsed.confidence));
            }
            if (typeof parsed.reasoning === "string") {
              reasoning = parsed.reasoning;
            }
            console.log(`[Photo Check] Photo confidence: ${photo_confidence}, Reasoning: ${reasoning}`);
          }
        }
      }
    } catch (visionErr: any) {
      console.warn(`[Photo Check] Failed with error: ${visionErr.message || String(visionErr)}`);
      photo_confidence = null;
      reasoning = reasoning || `Photo classification failed: ${visionErr.message || String(visionErr)}`;
    }

    // 4. DECISION LOGIC
    // verified if photo_confidence > 60 AND (ndvi_score > 0.3 OR ndvi_score is null/unavailable)
    // rejected otherwise (or if photo_confidence is null)
    let decisionStatus: "verified" | "rejected" = "rejected";

    if (
      photo_confidence !== null &&
      photo_confidence > 60 &&
      (ndvi_score === null || ndvi_score > 0.3)
    ) {
      decisionStatus = "verified";
    } else {
      decisionStatus = "rejected";
    }

    // 5. Write Verification row & 6. Update Submission status
    try {
      await prisma.verification.upsert({
        where: { submission_id: submission.id },
        update: {
          ndvi_score,
          photo_confidence,
          reasoning,
          verified_at: new Date(),
        },
        create: {
          submission_id: submission.id,
          ndvi_score,
          photo_confidence,
          reasoning,
          verified_at: new Date(),
        },
      });

      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: decisionStatus },
      });
    } catch (dbErr: any) {
      console.error(`[Database Error] Failed to write verification or update submission: ${dbErr.message || String(dbErr)}`);
      return NextResponse.json(
        { error: `Database write failure: ${dbErr.message || String(dbErr)}` },
        { status: 500, headers }
      );
    }

    // 7. Return 200 JSON response
    return NextResponse.json(
      {
        status: decisionStatus,
        ndvi_score,
        photo_confidence,
        reasoning,
      },
      { status: 200, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Unexpected server error: ${err.message || String(err)}` },
      { status: 500, headers }
    );
  }
}
