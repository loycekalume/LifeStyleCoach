import { Request, Response } from "express";
import pool from "../db.config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const chatWithBot = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, question } = req.body;

  if (!user_id || !question) {
    return res.status(400).json({ error: "Both user_id and question are required" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    const prompt = `Give a brief, concise answer in 1-2 sentences: ${question}`;
    const result = await model.generateContent(prompt);

    const answer =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure how to respond.";

    // Save to DB
    await pool.query(
      "INSERT INTO chathistory (user_id, question, answer) VALUES ($1, $2, $3)",
      [user_id, question, answer]
    );

    res.json({ reply: answer });
  } catch (error: any) {
    console.error("Gemini Error:", error?.message || error);
    res.status(500).json({
      error: "Failed to generate AI response",
      details: error?.message || error,
    });
  }
});
