import type { WebSearchResult } from "../types/web.search.type.js";

export const mapWebSearch = (
  data: WebSearchResult[],
): WebSearchResult[] => {
  return data.map((res) => ({
    id: res.id,
    title: res.title,
    content: res.content,
    url: res.url,
    score: res.score,
  }));
};