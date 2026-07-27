import OpenAI from "openai";
import { z } from "zod";

let openai: OpenAI | undefined;

function getClient(): OpenAI {
  openai ??= new OpenAI();
  return openai;
}

export const RecommendationSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  cause: z.enum([
    "INTERNAL_CORROSION",
    "EXTERNAL_CORROSION",
    "MECHANICAL_DAMAGE",
    "MATERIAL_FAILURE",
    "OTHER",
  ]),
  recommendedAction: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type RecommendationOutput = z.infer<typeof RecommendationSchema>;

interface AssetContext {
  name: string;
  latestThickness: number | null;
  minSafeThickness: number;
  corrosionRate: number | null;
  daysRemaining: number | null;
  riskLevel: string;
}

const RESPONSE_JSON_SCHEMA = {
  name: "maintenance_recommendation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      cause: {
        type: "string",
        enum: [
          "INTERNAL_CORROSION",
          "EXTERNAL_CORROSION",
          "MECHANICAL_DAMAGE",
          "MATERIAL_FAILURE",
          "OTHER",
        ],
      },
      recommendedAction: { type: "string" },
      confidence: { type: "number" },
    },
    required: ["severity", "cause", "recommendedAction", "confidence"],
    additionalProperties: false,
  },
} as const;

function buildPrompt(asset: AssetContext): string {
  return `Asset: ${asset.name}
Latest wall thickness: ${asset.latestThickness ?? "unknown"} mm
Minimum safe thickness: ${asset.minSafeThickness} mm
Corrosion rate: ${asset.corrosionRate ?? "unknown"} mm/day
Days remaining until unsafe: ${asset.daysRemaining ?? "unknown"}
Computed risk level: ${asset.riskLevel}

Based on this data, provide a maintenance recommendation: the severity, the most likely cause category, a specific recommended action, and your confidence (0 to 1) in this assessment.`;
}

async function requestRecommendation(asset: AssetContext): Promise<unknown> {
  const completion = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a pipeline and storage tank integrity engineer generating structured maintenance recommendations from sensor-derived corrosion data.",
      },
      { role: "user", content: buildPrompt(asset) },
    ],
    response_format: { type: "json_schema", json_schema: RESPONSE_JSON_SCHEMA },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Calls the model for a structured recommendation and validates it with Zod.
 * Retries once on validation failure before giving up.
 */
export async function generateRecommendation(
  asset: AssetContext,
): Promise<RecommendationOutput | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await requestRecommendation(asset);
    const result = RecommendationSchema.safeParse(raw);
    if (result.success) return result.data;
  }

  return null;
}
