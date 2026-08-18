import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

const nim = createOpenAICompatible({
  name: "nim",
  baseURL: NIM_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.NIM_API_KEY ?? ""}`,
  },
});

export function getNimModel(modelId: string) {
  return nim(modelId);
}