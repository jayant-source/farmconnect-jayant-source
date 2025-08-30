import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CropDiseaseAnalysis {
  diseaseName: string;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  symptoms: string;
  treatment: string;
}

export async function analyzeImage(imageBuffer: Buffer): Promise<CropDiseaseAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const systemPrompt = `You are an expert agricultural pathologist specializing in crop disease identification. 
    Analyze the provided crop image and provide a detailed diagnosis.
    
    Respond with JSON in this exact format:
    {
      "diseaseName": "Name of the disease or 'Healthy' if no disease detected",
      "severity": "Low" | "Medium" | "High",
      "confidence": number between 1-100,
      "symptoms": "Detailed description of visible symptoms",
      "treatment": "Recommended treatment and prevention measures"
    }`;

    const imageBase64 = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            diseaseName: { type: "string" },
            severity: { type: "string", enum: ["Low", "Medium", "High"] },
            confidence: { type: "number" },
            symptoms: { type: "string" },
            treatment: { type: "string" },
          },
          required: ["diseaseName", "severity", "confidence", "symptoms", "treatment"],
        },
      },
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
        "Analyze this crop image for diseases, pests, or health issues. Provide detailed symptoms and treatment recommendations.",
      ],
    });

    const rawJson = response.text;
    console.log(`Gemini Raw Response: ${rawJson}`);

    if (rawJson) {
      const analysis: CropDiseaseAnalysis = JSON.parse(rawJson);
      
      // Validate the response
      if (!analysis.diseaseName || !analysis.severity || !analysis.confidence) {
        throw new Error("Incomplete analysis from Gemini");
      }
      
      return analysis;
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Helper function to analyze general farming questions
export async function askFarmingQuestion(question: string, context?: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const systemPrompt = `You are an expert agricultural advisor with deep knowledge of farming practices, 
    crop management, pest control, weather patterns, and sustainable agriculture. Provide helpful, 
    practical advice tailored to small and medium-scale farmers. Focus on actionable solutions.`;

    const contextualQuestion = context 
      ? `${context}\n\nQuestion: ${question}`
      : question;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: contextualQuestion,
    });

    return response.text || "I'm sorry, I couldn't provide an answer at this time. Please try rephrasing your question.";
  } catch (error) {
    console.error("Gemini farming question error:", error);
    throw new Error("Failed to get farming advice");
  }
}
