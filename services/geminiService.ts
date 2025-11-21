import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the analysis report to ensure structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_ai_generated: { type: Type.BOOLEAN, description: "Whether the media is likely AI generated" },
    confidence_score: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
    verdict: { type: Type.STRING, enum: ["REAL", "SUSPICIOUS", "LIKELY_AI"] },
    reasoning: { type: Type.STRING, description: "A detailed paragraph explaining the forensic findings in plain language." },
    artifacts_detected: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of specific visual artifacts found (e.g., 'warped fingers', 'inconsistent shadows', 'glossy skin texture')"
    },
    watermark_detected: {
      type: Type.BOOLEAN,
      description: "Whether a visible watermark, text signature, or color bar typically associated with AI generators is present."
    },
    technical_details: {
      type: Type.OBJECT,
      properties: {
        lighting_consistency: { type: Type.STRING },
        anatomy_geometry: { type: Type.STRING },
        texture_quality: { type: Type.STRING }
      },
      required: ["lighting_consistency", "anatomy_geometry", "texture_quality"]
    }
  },
  required: ["is_ai_generated", "confidence_score", "verdict", "reasoning", "artifacts_detected", "watermark_detected", "technical_details"]
};

export const analyzeMedia = async (
  base64Data: string[], 
  mimeType: string
): Promise<AnalysisResult> => {
  
  // Prepare the prompt
  const prompt = `
    Act as a world-class Digital Forensics Expert specializing in Generative AI detection. 
    Analyze the provided media content carefully.
    
    Look for common Generative AI artifacts such as:
    1. Inconsistent lighting or shadows.
    2. Warped geometry (background lines not matching).
    3. Anatomical errors (hands, eyes, teeth).
    4. "AI Glaze" or overly smooth textures.
    5. Text rendering errors.
    6. Strange logical inconsistencies in the scene.
    7. VISIBLE WATERMARKS OR SIGNATURES: Scan corners for text like "nanobanana", "Imagined with AI", color bars (common in DALL-E), or faint logo overlays.

    If multiple images are provided, they are keyframes from a video. Treat them as a sequence to detect temporal inconsistencies or morphing artifacts common in deepfakes.

    Provide a strict JSON response.
  `;

  try {
    const parts = base64Data.map(data => ({
      inlineData: {
        mimeType: mimeType,
        data: data
      }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for more analytical/deterministic results
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Forensic analysis failed due to an API error.");
  }
};