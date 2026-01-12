import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithBot = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, question } = req.body;

  if (!user_id || !question) {
    return res.status(400).json({ error: "Both user_id and question are required" });
  }

  try {
    // 1. Fetch recent history (Limit to last 5 to save tokens/speed)
    // We order by id DESC to get newest first, then reverse it to chronological order
    const historyResult = await pool.query(
      `SELECT question, answer FROM chathistory 
       WHERE user_id = $1 
       ORDER BY id DESC 
       LIMIT 5`,
      [user_id]
    );

    // 2. Format history for Groq
    // Groq expects: [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
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
      { role: "user", content: question }, // The current question
    ];

    // 5. Call Groq
    const completion = await groq.chat.completions.create({
      messages: messages as any, // Type cast might be needed depending on SDK strictness
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