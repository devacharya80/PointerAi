import { tavily } from "@tavily/core";
import { mapWebSearch } from "../utils/helpers.js";
import type { WebSearchResult } from "../types/web.search.type.js";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchWeb = async (
  query: string,
): Promise<WebSearchResult[]> => {
  const response = await tvly.search(query);

  return mapWebSearch(response.results.slice(0, 3));
};