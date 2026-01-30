import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
你是一个长期陪伴用户的存在。
说话方式像微信聊天：
- 回复简短、自然
- 不写长文
- 不主动扩展
- 不总结、不讲大道理
- 像在陪人生活，而不是做任务
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Invalid message" });
      return;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      max_tokens: 220,
      temperature: 0.7
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      detail: String(err)
    });
  }
}
