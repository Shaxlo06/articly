import { completeJson, hasAnthropicKey } from "@/lib/anthropic";
import type { DetectionResult } from "./types";

function mockDetection(text: string): DetectionResult {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance =
    lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / (lengths.length || 1);
  // Low sentence-length variance and long average length are loose, informal
  // signals of uniform machine-generated prose. This is a placeholder
  // heuristic, not a real classifier — swap for a trained detector or the
  // Claude-backed path (set ANTHROPIC_API_KEY) before relying on it.
  const uniformity = Math.max(0, 1 - Math.min(variance, 40) / 40);
  const lengthSignal = Math.min(avg / 25, 1);
  const aiPercent = Math.round(Math.min(95, Math.max(5, (uniformity * 0.6 + lengthSignal * 0.4) * 100)));
  return { aiPercent, humanPercent: 100 - aiPercent };
}

export async function scoreAiDetection(text: string): Promise<DetectionResult> {
  if (!hasAnthropicKey()) return mockDetection(text);

  const result = await completeJson<DetectionResult>(
    `Estimate what percentage of the following academic text reads as AI-generated vs. human-written. Consider repetitive sentence structure, generic phrasing, and lack of specific voice as AI signals.\n\nTEXT:\n${text}\n\nReturn JSON: { "aiPercent": number, "humanPercent": number } where the two sum to 100.`,
    "You are an AI-text detection engine for an academic writing platform. Be calibrated, not alarmist."
  );
  return result;
}
