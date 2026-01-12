import { Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithBot = asyncHandler(async (req: UserRequest, res: Response) => {
  // ✅ Get user_id from authenticated token instead of request body
  const user_id = req.user?.user_id;
  const { question } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // 1. Fetch recent history (Limit to last 5 to save tokens/speed)
    const historyResult = await pool.query(
      `SELECT question, answer FROM chathistory 
       WHERE user_id = $1 
       ORDER BY id DESC 
       LIMIT 5`,
      [user_id]
    );

    // 2. Format history for Groq
    const historyMessages = historyResult.rows.reverse().flatMap((row) => [
      { role: "user", content: row.question },
      { role: "assistant", content: row.answer },
    ]);

    // 3. Define the System Persona
    const systemMessage = {
      role: "system",
      content: "You are a helpful health and fitness assistant. You remember previous details in this conversation. Keep answers concise.",
    };

    // 4. Combine: System + History + New Question
    const messages = [
      systemMessage,
      ...historyMessages,
      { role: "user", content: question },
    ];

    // 5. Call Groq
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 200,
    });

    const answer = completion.choices[0]?.message?.content || "I'm not sure.";

    // 6. Save ONLY the new interaction to DB
    await pool.query(
      "INSERT INTO chathistory (user_id, question, answer) VALUES ($1, $2, $3)",
      [user_id, question, answer]
    );

    res.json({ reply: answer });

  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});