
import { GoogleGenAI, Type } from "@google/genai";
import { SensorData, ClimateRisk, SustainabilityReport, RiskLevel } from "../types";

// Helper to normalize risk levels from AI response
const normalizeRiskLevel = (level: string): RiskLevel => {
  const upper = level.toUpperCase();
  if (upper === 'HIGH') return RiskLevel.HIGH;
  if (upper === 'MODERATE' || upper === 'WARNING') return RiskLevel.MODERATE;
  return RiskLevel.SAFE;
};

export const getClimateAnalysis = async (data: SensorData): Promise<{ risks: ClimateRisk[], recommendations: string[] }> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Act as an expert environmental data scientist. Analyze these sensor readings for a school campus:
  - Temperature: ${data.temperature}°C
  - Humidity: ${data.humidity}%
  - Air Quality (AQI): ${data.aqi}
  - Rainfall: ${data.rainfall}mm (Status: ${data.rainStatus})

  Generate a JSON report including:
  1. Detailed Risk Analysis for "Heat Stress", "Flooding", and "Air Quality".
  2. For each, assign a precise score (0-100) and a level (SAFE, MODERATE, HIGH).
  3. Provide a brief expert description of WHY the risk is at that level.
  4. 3 Actionable, safety-first recommendations for school staff and students.
  
  Format: JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  level: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "score", "level", "description"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["risks", "recommendations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(response.text);
    return {
      risks: Array.isArray(parsed.risks) ? parsed.risks.map((r: any) => ({
        ...r,
        level: normalizeRiskLevel(r.level)
      })) : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch (e: any) {
    console.error("Failed to parse Gemini response", e);
    return {
      risks: [],
      recommendations: [`Error analyzing data: ${e.message || "Unknown error"}. Sensors active, AI processing delayed.`]
    };
  }
};

export const getSustainabilityAudit = async (data: SensorData): Promise<SustainabilityReport> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Act as a specialized Sustainability Consultant for India's 2027 Carbon Regulations. 
  Current Environment: Temp ${data.temperature}°C, Humidity ${data.humidity}%, AQI ${data.aqi}.
  
  Generate a "Sustainability Readiness Audit" JSON with:
  1. overallScore (0-100) representing compliance with 2027 standards.
  2. A list of metrics for "Carbon Footprint", "Water Resilience", "Air Purity", and "Energy Efficiency".
     Each metric needs a category, score, status (COMPLIANT, WARNING, CRITICAL), and a specific 2027 target value/desc.
  3. A "roadmap" of 4 strategic priorities for the next 12 months.
  
  Format: JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  target: { type: Type.STRING }
                },
                required: ["category", "score", "status", "target"]
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["overallScore", "metrics", "roadmap"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (e: any) {
    console.error("Sustainability Audit Parse Error", e);
    throw e;
  }
};
