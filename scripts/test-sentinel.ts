import "dotenv/config";

async function testSentinel() {
  const clientId = process.env.SENTINELHUB_CLIENT_ID;
  const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET;

  const tokenRes = await fetch("https://services.sentinel-hub.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const lat = 15.0;
  const lng = 74.0;
  const bufferDegLat = 0.00045;
  const bufferDegLng = 0.00045 / Math.cos((lat * Math.PI) / 180);

  const minLng = Number((lng - bufferDegLng).toFixed(6));
  const minLat = Number((lat - bufferDegLat).toFixed(6));
  const maxLng = Number((lng + bufferDegLng).toFixed(6));
  const maxLat = Number((lat + bufferDegLat).toFixed(6));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask", "SCL"] }],
    output: [
      { id: "default", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(samples) {
  let isVegetation = (samples.SCL === 4 || samples.SCL === 5);
  let denom = samples.B08 + samples.B04;
  let ndvi = denom === 0 ? 0 : (samples.B08 - samples.B04) / denom;
  return {
    default: [ndvi],
    dataMask: [samples.dataMask && isVegetation ? 1 : 0]
  };
}`;

  const statsRes = await fetch("https://services.sentinel-hub.com/api/v1/statistics", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        bounds: {
          bbox: [minLng, minLat, maxLng, maxLat],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [{ type: "sentinel-2-l2a", dataFilter: { maxCloudCoverage: 80 } }],
      },
      aggregation: {
        timeRange: { from: thirtyDaysAgo.toISOString(), to: now.toISOString() },
        aggregationInterval: { of: "P30D" },
        evalscript,
      },
    }),
  });

  const statsData = await statsRes.json();
  console.log("Sentinel Hub Raw Response:", JSON.stringify(statsData, null, 2));
}

testSentinel().catch(console.error);
