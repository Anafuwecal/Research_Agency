import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

// @ts-ignore
export const webSearchTool: any = tool(
  async ({ query }: { query: string }) => {
    console.log(`Searching web for: ${query}`);
    
    try {
      // Using DuckDuckGo API (free, no API key needed)
      const response = await axios.get(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      
      const results = response.data.RelatedTopics?.slice(0, 5).map((topic: any) => ({
        title: topic.Text?.split(' - ')[0] || 'No title',
        url: topic.FirstURL || '',
        snippet: topic.Text || 'No description'
      })) || [];

      console.log(`Found ${results.length} results`);
      return JSON.stringify(results);
    } catch (error) {
      console.error("Search error:", error);
      return JSON.stringify([]);
    }
  },
  {
    name: "web_search",
    description: "Search the web for information on a given topic. Returns a list of relevant URLs and snippets.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);