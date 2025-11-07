import type { Scene } from "@/lib/types";

const headers = {
  "content-type": "application/json",
};

export async function fetchScenes(): Promise<Scene[]> {
  const res = await fetch("/scenes", {
    headers,
    method: "GET",
  });
  if (!res.ok) {
    throw new Error("Failed to load scenes");
  }
  return (await res.json()) as Scene[];
}

export async function saveScenes(scenes: Scene[]): Promise<Scene[]> {
  const res = await fetch("/scenes", {
    headers,
    method: "PUT",
    body: JSON.stringify(scenes),
  });
  if (!res.ok) {
    throw new Error("Failed to save scenes");
  }
  return (await res.json()) as Scene[];
}
