import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(promt) {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: promt,
	});
	return response.text;
}

export default main;
