import { ChatResponse } from "../types/chat";
import { CORPWISE_CONFIG } from "../config";

const API_BASE = CORPWISE_CONFIG.API_BASE_URL;

export async function sendQuery(
  userId: string,
  conversationId: string,
  query: string
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Company-ID": CORPWISE_CONFIG.companyId,
    "X-API-Key": CORPWISE_CONFIG.API_KEY
  };

  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      user_id: userId,
      conversation_id: conversationId,
      question: query
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chat request failed: ${err}`);
  }

  return res.json();
}

export async function getHistory(userId: string) {
  const res = await fetch(`${API_BASE}/conversations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function sendFeedback(
  conversationId: string,
  helpful: boolean,
  reason?: string
) {
  await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      helpful,
      reason
    })
  });
}
