import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tavily } from '@tavily/core';
import { AgentState, RawResearchData, ImageData, DiagramData } from '../types/index.js';

export class ResearchAgent {
  private model: ChatGroq;
  private tavilyClient: any;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      apiKey: process.env.GROQ_API_KEY,
    });

    this.tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }

  async conductResearch(state: AgentState): Promise<Partial<AgentState>> {
    const { researchPlan, query } = state;

    if (!researchPlan) {
      throw new Error('Research plan not found');
    }

    console.log('Research Agent: Starting research with Tavily...');
    console.log('Main topics:', researchPlan.mainTopics?.length || 0);
    console.log('Search queries:', researchPlan.searchQueries?.length || 0);

    const searchQueries = Array.isArray(researchPlan.searchQueries) && researchPlan.searchQueries.length > 0
      ? researchPlan.searchQueries
      : [query.topic];

    console.log('Using search queries:', searchQueries);

    const rawResearchData: RawResearchData[] = [];
    const images: ImageData[] = [];
    const diagrams: DiagramData[] = [];

    for (const searchQuery of searchQueries.slice(0, 5)) {
      try {
        console.log(`Tavily search for: "${searchQuery}"`);
        
        const searchResults = await this.tavilySearch(searchQuery, query.depth);
        
        console.log(`Found ${searchResults.length} results from Tavily`);

        for (const result of searchResults) {
          // Simple quality check using Tavily's score - faster than AI analysis
          const credibilityScore = result.score || 0.75;
          const relevanceScore = result.score || 0.75;

          // Only add sources with minimum quality threshold
          if (credibilityScore >= 0.5 && relevanceScore >= 0.5) {
            rawResearchData.push({
              source: result.title,
              url: result.url,
              title: result.title,
              content: result.content,
              publishDate: result.published_date || null,
              author: result.author || null,
              credibilityScore: credibilityScore,
              relevanceScore: relevanceScore,
            });

            console.log(`Added research from: ${result.title} (score: ${result.score})`);
          } else {
            console.log(`Skipped low-quality source: ${result.title}`);
          }
        }

      } catch (error: any) {
        console.error(`Error searching "${searchQuery}":`, error.message);
        
        console.log(`Generating AI fallback for: "${searchQuery}"`);
        try {
          const aiResearch = await this.generateAIResearch(searchQuery, query.topic, query.depth);
          rawResearchData.push(aiResearch);
        } catch (aiError: any) {
          console.error('AI fallback failed:', aiError.message);
        }
      }
    }

    // Add AI research if we don't have enough sources
    if (rawResearchData.length < 5 && researchPlan.mainTopics && researchPlan.mainTopics.length > 0) {
      console.log('Adding AI research for main topics to ensure comprehensive coverage...');
      const topicsToResearch = researchPlan.mainTopics.slice(0, Math.min(3, 5 - rawResearchData.length));
      
      for (const topic of topicsToResearch) {
        try {
          const aiResearch = await this.generateAIResearch(topic, query.topic, query.depth);
          rawResearchData.push(aiResearch);
          console.log(`Added AI research for: ${topic}`);
        } catch (error: any) {
          console.error(`Failed to generate AI research for ${topic}:`, error.message);
        }
      }
    }

    if (query.requirements.includeDiagrams) {
      try {
        const imageResults = await this.tavilyImageSearch(query.topic);
        images.push(...imageResults);
      } catch (error) {
        console.error('Image search failed:', error);
      }

      diagrams.push(
        {
          type: 'infographic',
          url: 'https://via.placeholder.com/800x600/252523/FFFFFF?text=Research+Overview',
          description: `Overview diagram for ${query.topic}`,
          source: 'Generated',
        },
        {
          type: 'chart',
          url: 'https://via.placeholder.com/800x600/252523/FFFFFF?text=Key+Findings',
          description: `Key findings visualization for ${query.topic}`,
          source: 'Generated',
        }
      );
    }

    if (rawResearchData.length === 0) {
      console.log('No research data collected, generating comprehensive AI fallback...');
      const fallbackResearch = await this.generateAIResearch(
        query.topic,
        query.topic,
        query.depth
      );
      rawResearchData.push(fallbackResearch);
    }

    console.log(`Research Agent completed: ${rawResearchData.length} sources collected`);

    return {
      rawResearchData,
      images: images.slice(0, 10),
      diagrams: diagrams.slice(0, 5),
      status: 'extracting',
      progress: 40,
      updatedAt: new Date(),
    };
  }

  private async tavilySearch(query: string, depth: string): Promise<any[]> {
    try {
      const searchDepth = depth === 'advanced' ? 'advanced' : 'basic';
      
      const response = await this.tavilyClient.search(query, {
        search_depth: searchDepth,
        max_results: 10,
        include_answer: true,
        include_raw_content: false,
        include_images: false,
      });

      console.log(`Tavily returned ${response.results?.length || 0} results`);
      
      const cleanedResults = (response.results || []).map((result: any) => ({
        title: result.title || 'Untitled',
        url: result.url || '#',
        content: result.content || '',
        score: result.score || 0.5,
        published_date: result.published_date || null,
        author: result.author || null,
      }));

      return cleanedResults;
    } catch (error: any) {
      console.error('Tavily search error:', error.message);
      return [];
    }
  }

  private async tavilyImageSearch(query: string): Promise<ImageData[]> {
    try {
      const response = await this.tavilyClient.search(query, {
        search_depth: 'basic',
        max_results: 5,
        include_images: true,
      });

      const images = response.images || [];
      
      return images.map((img: any, index: number) => ({
        url: img.url || img,
        caption: `Image ${index + 1} for ${query}`,
        source: 'Tavily Search',
        relevance: 0.8,
      }));
    } catch (error) {
      console.error('Tavily image search error:', error);
      return [];
    }
  }

  private async generateAIResearch(
    subtopic: string,
    mainTopic: string,
    depth: string
  ): Promise<RawResearchData> {
    const depthInstructions = {
      basic: 'Provide a clear, accessible overview suitable for beginners. Use simple language and focus on fundamental concepts.',
      intermediate: 'Provide detailed analysis with specific examples, data, and expert perspectives. Balance accessibility with depth.',
      advanced: 'Provide comprehensive, technical analysis with in-depth exploration of complexities, methodologies, and cutting-edge developments.',
    };

    const instruction = depthInstructions[depth as keyof typeof depthInstructions] || depthInstructions.intermediate;

    const prompt = `Write a comprehensive, well-researched section about "${subtopic}" in the context of "${mainTopic}".

Depth Level: ${depth}
Instructions: ${instruction}

Your response should include:

1. **Introduction** - Brief overview of the topic
2. **Key Concepts** - Main ideas and definitions
3. **Current State** - Present situation and recent developments
4. **Analysis** - Critical examination and insights
5. **Evidence & Examples** - Specific cases, data points, or studies
6. **Implications** - What this means for the field/society
7. **Future Outlook** - Trends and predictions

Requirements:
- Write 800-1200 words
- Be factual and objective
- Include specific details and examples
- Use clear, professional language
- Structure information logically

Write the research content now:`;

    try {
      const response = await this.model.invoke([
        new SystemMessage('You are an expert researcher and academic writer. Provide accurate, well-structured, and comprehensive research content, and make sure not to bit around the bush.'),
        new HumanMessage(prompt),
      ]);

      const content = response.content.toString();

      return {
        source: `AI Research: ${subtopic}`,
        url: `#ai-research-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: subtopic,
        content: content,
        author: 'AI Research System',
        publishDate: new Date().toISOString(),
        credibilityScore: 0.80,
        relevanceScore: 0.92,
      };
    } catch (error: any) {
      console.error(`Error generating AI research for ${subtopic}:`, error.message);
      
      // Return a basic fallback
      return {
        source: `Research on ${subtopic}`,
        url: `#research-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: subtopic,
        content: `Research and analysis on ${subtopic} in the context of ${mainTopic}. This topic encompasses various aspects and considerations that are relevant to understanding the broader subject matter. Further investigation reveals important patterns, trends, and implications for stakeholders in this field.`,
        author: 'Research System',
        publishDate: new Date().toISOString(),
        credibilityScore: 0.70,
        relevanceScore: 0.85,
      };
    }
  }
}