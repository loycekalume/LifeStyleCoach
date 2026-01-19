// Run this with: node test-models.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // This fetches the list of all models your API key can access
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; 
    // ^ The SDK doesn't have a direct "listModels" method exposed easily in all versions, 
    // so we use the raw fetch below for accuracy:
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    console.log("Available Models:");
    data.models.forEach((m) => {
      if (m.name.includes("flash")) {
        console.log(`- ${m.name.replace("models/", "")}`);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();