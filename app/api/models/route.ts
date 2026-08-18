import { NIM_BASE_URL } from "@/ai/providers";

type ModelsResponse = {
  data: { id: string }[];
};

export async function GET() {
  const apiKey = process.env.NIM_API_KEY;

  if (!apiKey) {
    return Response.json({ models: [] });
  }

  try {
    const response = await fetch(`${NIM_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return Response.json({ models: [] }, { status: response.status });
    }

    const body = (await response.json()) as ModelsResponse;
    const models = (body.data ?? [])
      .map((model) => model.id)
      .filter((id): id is string => Boolean(id));

    return Response.json(
      { models },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return Response.json({ models: [] });
  }
}