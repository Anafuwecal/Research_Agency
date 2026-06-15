import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

export const webScraperTool = new tool(
  async ({ url }: { url: string }) => {
    console.log(`Scraping: ${url}`);
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove scripts, styles, and other non-content elements
      $('script, style, nav, footer, header').remove();
      
      // Extract main content
      const text = $('article, main, .content, body')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit to 5000 chars
      
      console.log(`Scraped ${text.length} characters`);
      return text || "No content extracted";
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error);
      return "Failed to scrape content";
    }
  },
  {
    name: "web_scraper",
    description: "Scrape and extract text content from a given URL. Returns the main text content of the page.",
    schema: z.object({
      url: z.string().describe("The URL to scrape"),
    }),
  }
);