import "dotenv/config";
import fs from "fs";

async function testOpenAI() {
  const imgBuffer = fs.readFileSync("test-mangrove-real.jpg");
  const base64Str = imgBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Str}`;

  console.log("Sending photo to OpenAI gpt-4o-mini vision...");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
              text: 'Does this photo clearly show mangrove or coastal vegetation? Respond only with JSON: {"confidence": 0-100, "reasoning": string}',
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    }),
  });

  console.log("OpenAI HTTP Status:", res.status);
  const data = await res.json();
  console.log("OpenAI Response:", JSON.stringify(data, null, 2));
}

testOpenAI().catch(console.error);
