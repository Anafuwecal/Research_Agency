import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentState, ResearchPlan } from '../types/index.js';

export class ManagerAgent {
  private model: ChatGroq;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async createResearchPlan(state: AgentState): Promise<Partial<AgentState>> {
    const { query } = state;

    const systemPrompt = ` You are an elite Research Manager Agent specialized in designing comprehensive, strategic research plans. Your expertise spans academic research, market analysis, competitive intelligence, and investigative reporting.

## Core Responsibilities

1. **Query Analysis & Scoping**
   - Identify the research domain, objectives, and constraints
   - Clarify ambiguities and implicit requirements
   - Determine success criteria and deliverable expectations

2. **Strategic Decomposition**
   - Break complex topics into logical, hierarchical structures
   - Identify main themes, subtopics, and interdependencies
   - Recognize knowledge gaps and edge cases
   - Prioritize research areas by importance and feasibility

3. **Search Strategy Development**
   - Craft targeted search queries using advanced operators
   - Design multi-angle query approaches (definitional, comparative, causal, temporal)
   - Include domain-specific terminology and synonyms
   - Plan for primary, secondary, and tertiary sources

4. **Resource Planning**
   - Estimate optimal source count based on depth and breadth
   - Balance authoritative sources with diverse perspectives
   - Specify source types (academic, industry, news, data, expert opinions)
   - Set quality thresholds and recency requirements

5. **Adaptive Strategy Selection**
   - Customize approach based on research type and depth
   - Account for time-sensitivity and evolving information
   - Plan verification and cross-reference protocols

---

## Current Research Parameters

- **Research Type**: ${query.researchType}
- **Research Depth**: ${query.depth}
- **Topic**: ${query.topic}

---

## Research Type Strategies

### Academic Research
- Prioritize peer-reviewed journals, academic databases, and citations
- Include foundational papers, recent studies, and meta-analyses
- Trace theoretical frameworks and methodological approaches

### Market Analysis
- Focus on industry reports, market data, trend analyses, and forecasts
- Include competitive landscape, customer insights, and regulatory factors
- Incorporate quantitative metrics and qualitative assessments

### Competitive Intelligence
- Emphasize product comparisons, strategic positioning, and market share
- Analyze strengths/weaknesses, innovation patterns, and business models
- Track recent developments, announcements, and strategic moves

### Technical Investigation
- Prioritize technical documentation, specifications, and expert analyses
- Include implementation examples, best practices, and limitations
- Cover emerging technologies and industry standards

### General Research
- Balance breadth and depth across multiple dimensions
- Include background context, current state, and future implications
- Synthesize diverse viewpoints and cross-disciplinary insights

---

## Depth Level Guidelines

### **Surface** (Quick Overview)
- 3-5 main topics, 2-3 subtopics each
- 5-10 total sources
- Focus on summaries, overviews, and key facts
- 1-2 search queries per topic

### **Standard** (Comprehensive Understanding)
- 4-7 main topics, 3-5 subtopics each
- 15-25 total sources
- Balance breadth and depth, include multiple perspectives
- 2-3 search queries per topic with variations

### **Deep** (Expert-Level Analysis)
- 6-10 main topics, 5-8 subtopics each
- 30-50+ total sources
- Exhaustive coverage, nuanced analysis, edge cases
- 3-5 search queries per topic with advanced operators
- Include niche sources and expert interviews

---

## Output Structure

Provide a structured research plan with:

### 1. Executive Summary
- Research scope and objectives
- Key focus areas
- Expected outcomes

### 2. Topic Hierarchy
Main Topic 1: [Descriptive Title]
├─ Subtopic 1.1: [Specific Aspect]
├─ Subtopic 1.2: [Specific Aspect]
└─ Subtopic 1.3: [Specific Aspect]


### 3. Search Query Matrix
For each topic/subtopic:
- **Primary Query**: [Broad, comprehensive]
- **Secondary Queries**: [Targeted, specific angles]
- **Advanced Queries**: [With operators: site:, filetype:, intitle:, etc.]

### 4. Source Requirements
- **Total Sources**: [Number]
- **Source Distribution**: [By topic and type]
- **Quality Criteria**: [Authority, recency, relevance]
- **Diversity Requirements**: [Perspectives, methodologies, geographies]

### 5. Research Methodology
- **Sequence**: Order of investigation
- **Validation Strategy**: Cross-referencing and fact-checking approach
- **Iteration Plan**: How to deepen or pivot based on findings

### 6. Risk & Limitations
- Potential information gaps
- Bias considerations
- Time-sensitivity factors
- Access limitations

---

## Best Practices

- **Be Specific**: Avoid vague topics; drill into concrete aspects
- **Think Critically**: Anticipate counterarguments and alternative views
- **Stay Current**: Prioritize recent sources for dynamic topics
- **Cross-Verify**: Build in redundancy for critical claims
- **Think Systemically**: Show relationships between topics
- **Be Pragmatic**: Match ambition to available resources and time

---

Begin by analyzing the research parameters and generating a comprehensive research plan following this framework. Ensure the output is in valid JSON format with all strings properly escaped.`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `Based on the Research Type ("${query.researchType}") and Depth Level ("${query.depth}") parameters, generate a structured research plan for the following topic: "${query.topic}".

Adhere strictly to the specific strategies and source estimates defined in the system instructions for the selected Research Type and Depth.

Output the result as a valid JSON object with the following structure:

{
  "executiveSummary": "A brief 2-3 sentence summary of the research scope and primary objectives.",
  "estimatedTotalSources": Integer (Total number of sources required for this depth),
  "strategy": {
    "methodology": "Description of the overall research approach and sequence of investigation.",
    "validationApproach": "How the agent will cross-reference and verify findings.",
    "risksAndLimitations": ["Array of strings identifying potential gaps, biases, or access issues."]
  },
  "sourceCriteria": {
    "requiredTypes": ["Array of preferred source types (e.g., 'Academic Journals', 'Industry Reports')"],
    "recency": "Description of how recent sources should be (e.g., 'Last 3 years for tech topics')",
    "qualityThreshold": "Standard for source credibility (e.g., 'High authority, .edu or .gov preferred')"
  },
  "topicBreakdown": [
    {
      "mainTopic": "Title of the main research area",
      "rationale": "Why this main topic is critical to the overall research query.",
      "subtopics": [
        {
          "title": "Title of the specific subtopic",
          "queries": {
            "primary": "Broad search query to capture general information",
            "secondary": [
              "Specific search query focusing on a particular angle",
              "Alternative search query using synonyms"
            ],
            "advanced": [
              "Query using advanced operators (site:, filetype:, intitle:, etc.)",
              "Query targeting specific data or statistics"
            ]
          },
          "sourceEstimate": Integer (Estimated number of sources specific to this subtopic),
          "keyQuestions": ["Array of specific questions this subtopic must answer"]
        }
      ]
    }
  ]
}`
        ),
      ]);

       const content = response.content.toString();
      console.log('Manager Agent response received, parsing...');
      
      // Clean and extract JSON
      let jsonStr = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', content);
        throw new Error('Invalid response format - no JSON found');
      }

      let researchPlan: ResearchPlan;
      
      try {
        researchPlan = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        throw new Error('Failed to parse research plan JSON');
      }

      // Validate and provide defaults
      researchPlan = this.validateResearchPlan(researchPlan, query);

      console.log('Manager Agent: Research plan created');
      console.log('Main topics:', researchPlan.mainTopics?.length || 0);
      console.log('Search queries:', researchPlan.searchQueries?.length || 0);

      return {
        researchPlan,
        status: 'researching',
        progress: 10,
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Manager Agent Error:', error.message);
      
      // Create fallback research plan
      console.log('Creating fallback research plan...');
      const fallbackPlan = this.createFallbackPlan(query);

      return {
        researchPlan: fallbackPlan,
        status: 'researching',
        progress: 10,
        updatedAt: new Date(),
      };
    }
  }

  private validateResearchPlan(plan: ResearchPlan, query: any): ResearchPlan {
    return {
      mainTopics: Array.isArray(plan.mainTopics) && plan.mainTopics.length > 0
        ? plan.mainTopics
        : this.generateMainTopics(query.topic),
      
      subTopics: Array.isArray(plan.subTopics) && plan.subTopics.length > 0
        ? plan.subTopics
        : this.generateSubTopics(query.topic),
      
      searchQueries: Array.isArray(plan.searchQueries) && plan.searchQueries.length > 0
        ? plan.searchQueries
        : this.generateSearchQueries(query.topic),
      
      estimatedSources: typeof plan.estimatedSources === 'number'
        ? plan.estimatedSources
        : query.requirements.maxSources || 20,
      
      researchStrategy: typeof plan.researchStrategy === 'string' && plan.researchStrategy.length > 0
        ? plan.researchStrategy
        : `Comprehensive ${query.researchType} research on ${query.topic}`,
    };
  }

  private generateMainTopics(topic: string): string[] {
    return [
      `Overview of ${topic}`,
      `Current state and trends in ${topic}`,
      `Key concepts and principles of ${topic}`,
      `Applications and implications of ${topic}`,
      `Future directions for ${topic}`,
    ];
  }

  private generateSubTopics(topic: string): string[] {
    return [
      `Historical context of ${topic}`,
      `Recent developments in ${topic}`,
      `Challenges and opportunities`,
      `Best practices and methodologies`,
      `Case studies and examples`,
      `Expert perspectives on ${topic}`,
    ];
  }

  private generateSearchQueries(topic: string): string[] {
    return [
      topic,
      `${topic} overview`,
      `${topic} recent developments`,
      `${topic} trends and analysis`,
      `${topic} best practices`,
      `${topic} case studies`,
      `${topic} future outlook`,
    ];
  }

  private createFallbackPlan(query: any): ResearchPlan {
    console.log('Using fallback research plan');
    
    return {
      mainTopics: this.generateMainTopics(query.topic),
      subTopics: this.generateSubTopics(query.topic),
      searchQueries: this.generateSearchQueries(query.topic),
      estimatedSources: query.requirements.maxSources || 20,
      researchStrategy: `Comprehensive ${query.researchType} research approach focusing on ${query.topic}. The research will cover fundamental concepts, current trends, practical applications, and future implications. Sources will be evaluated for credibility and relevance.`,
    };
  }
}