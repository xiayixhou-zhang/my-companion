import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    // 这俩是 OpenRouter 推荐的标识头，不填也能用，但填了更稳
    "HTTP-Referer": "https://my-companion-one.vercel.app",
    "X-Title": "my-companion"
  }
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
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Invalid message" });
      return;
    }

    const completion = await client.chat.completions.create({
      // OpenRouter 里要用带前缀的模型名（先用便宜稳定的）
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      max_tokens: 220,
      temperature: 0.7
    });

    res.status(200).json({ reply: completion.choices?.[0]?.message?.content ?? "" });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}
