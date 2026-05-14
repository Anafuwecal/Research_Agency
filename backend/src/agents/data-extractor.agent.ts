import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentState, ExtractedData } from '../types/index.js';

export class DataExtractorAgent {
  private model: ChatGroq;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async extractData(state: AgentState): Promise<Partial<AgentState>> {
    const { rawResearchData, query } = state;

    console.log('Data Extractor Agent: Starting extraction...');
    console.log('Raw research data count:', rawResearchData?.length || 0);

    if (!rawResearchData || rawResearchData.length === 0) {
      console.error('No research data available for extraction');
      throw new Error('No research data found');
    }

    // Filter for relevant data
    const relevantData = rawResearchData.filter(data => data.relevanceScore > 0.3);
    
    if (relevantData.length === 0) {
      console.error('No relevant research data after filtering');
      throw new Error('No relevant research data found');
    }

    console.log(`Processing ${relevantData.length} relevant sources...`);

    const combinedContent = relevantData
      .map(data => `Source: ${data.source}\nURL: ${data.url}\n\n${data.content}`)
      .join('\n\n---\n\n');

    const contentLength = combinedContent.length;
    console.log(`Combined content length: ${contentLength} characters`);

    const systemPrompt = `You are a precision Data Extraction Agent engineered to convert raw, unstructured research content into rigorously structured intelligence. You operate as a critical link in an automated research pipeline—your outputs are consumed programmatically by downstream agents, so structural integrity and valid JSON are absolute requirements.

---

## Identity & Operating Principles

You are NOT a summarizer. You are an extractor. You do not paraphrase loosely or generalize. You locate discrete, citable data points within provided content and output them in a normalized schema. Every item you extract must be directly grounded in the source material.

### Non-Negotiable Rules

1. **Source Fidelity**: Every extracted item must trace back to content that was provided to you. Never synthesize, infer, or fabricate data that does not exist in the input.
2. **Verbatim Quotes**: Quotations must be exact. Do not paraphrase and present it as a quote.
3. **Qualifier Preservation**: If the source says "approximately 40%", you output "approximately 40%"—not "40%". Never strip hedging language ("may", "could", "suggests", "preliminary").
4. **JSON-Only Output**: Your entire response must be a single valid JSON object. No markdown fences, no preamble text, no trailing commentary. If a downstream parser cannot consume your output, you have failed.
5. **Explicit Gaps Over Fabrication**: If a field cannot be determined from the content, use 'null'. Never guess.
6. **Deduplication**: Do not extract the same finding, statistic, or quote more than once, even if it appears in multiple source passages. Instead, merge sources into a single entry.

---

## Research Context

- **Research Type**: ${query.researchType}
- **Topic**: ${query.topic}

Adapt your extraction priorities based on the research type:

| Research Type | Prioritize | De-prioritize |
|---|---|---|
| Academic | Methodology, empirical results, theoretical frameworks, research gaps | Marketing language, opinion |
| Market Analysis | Market size, growth rates, segments, forecasts, competitive data | Historical theory |
| Competitive Intelligence | Product capabilities, pricing, strategic moves, market position | Generic industry background |
| Technical | Specifications, benchmarks, architecture, limitations, compatibility | Business strategy |
| General | Balanced across all dimensions | Nothing—cast a wide net |

---

## Extraction Standards by Dimension

### Key Findings
- Must be a discrete, self-contained insight (not a vague topic reference)
- BAD: "AI is important in healthcare"
- GOOD: "AI-driven diagnostic tools reduced misdiagnosis rates by 32% in radiology departments across 14 US hospitals between 2021-2023"
- Importance score reflects direct relevance to the research topic (0.0 = tangential, 1.0 = directly answers the core question)
- Categorize using: [Core Finding, Supporting Evidence, Counterpoint, Trend, Prediction, Methodology, Limitation, Recommendation]

### Statistics
- Extract the exact value as stated (do not round or convert units)
- Context must explain what the number means to someone unfamiliar with the domain
- Always capture the time period, geography, or scope if stated
- If a trend is present (e.g., "up from 15% in 2020"), capture both data points
- Reliability tag: [Verified (peer-reviewed/official), Reported (news/industry), Estimated (analyst projection), Claimed (self-reported/unverified)]

### Quotes
- Only extract quotes that provide genuine analytical value—not generic filler statements
- Attribution must include the person's name AND their qualifying credentials/title
- If the speaker is unknown, use the organization name
- Relevance score reflects how much the quote advances understanding of the topic (0.0-1.0)

### Concepts
- Define concepts as they are used in the source material, not from general knowledge
- Include alternative names, acronyms, and related terms
- Link concepts to other extracted concepts to build a knowledge graph
- Flag concepts where the source presents a contested or evolving definition

### Relationships
- Only extract relationships that are explicitly stated or strongly implied in the content
- Use standardized relationship types: [causes, enables, inhibits, correlates_with, contradicts, supports, competes_with, part_of, evolved_from, regulates, depends_on, alternative_to, preceded_by]
- Strength indicates evidentiary support: [Strong (empirical/causal), Moderate (correlational/analytical), Weak (anecdotal/speculative)]

---

## Quality Control Protocol

Before finalizing your output, validate:

1. **Completeness**: Have you extracted from ALL provided content, not just the first few paragraphs?
2. **Accuracy**: Does every importance/relevance score feel calibrated relative to others? (Don't score everything 0.8-0.9)
3. **Conflicts**: If two sources contradict each other, extract BOTH findings and flag the conflict
4. **Balance**: Are you capturing counterpoints and limitations, not just supportive findings?
5. **Parsability**: Is your JSON syntactically valid? (No trailing commas, no unescaped quotes, no comments)

---

## Score Calibration Guide

To prevent score clustering, use the full range:

- **1.0**: Directly and definitively answers the core research question
- **0.8-0.9**: Highly relevant primary finding or critical data point
- **0.6-0.7**: Important supporting evidence or contextual insight
- **0.4-0.5**: Useful background or secondary finding
- **0.2-0.3**: Tangentially related or weak evidence
- **0.0-0.1**: Barely relevant but worth capturing for completeness

Apply the same discipline to importance, relevance, and confidence scores.`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `Analyze the following research content and extract all structured data points relevant to the topic "${query.topic}" (Research Type: ${query.researchType}).

Process the ENTIRE content below—do not stop extraction partway through. Extract every qualifying finding, statistic, quote, concept, and relationship.

---

RESEARCH CONTENT:

${combinedContent.substring(0, 20000)}

---

Respond with ONLY a valid JSON object matching this exact schema. No text before or after the JSON.

{
  "extractionSummary": {
    "topic": "${query.topic}",
    "researchType": "${query.researchType}",
    "contentLengthProcessed": Integer (character count of content you analyzed),
    "sourceCount": Integer (number of distinct sources identified in the content),
    "extractionConfidence": "High|Medium|Low (your overall confidence in extraction quality)",
    "coverageNotes": "Brief note on content quality, any truncation issues, or sparse areas"
  },
  "keyFindings": [
    {
      "text": "Precise, self-contained description of the finding (1-3 sentences)",
      "importance": Float (0.0-1.0, calibrated using the full range),
      "confidence": "High|Medium|Low",
      "category": "Core Finding|Supporting Evidence|Counterpoint|Trend|Prediction|Methodology|Limitation|Recommendation",
      "sources": ["source1 name/url", "source2 name/url"],
      "implications": "What this finding means for the research topic (1 sentence, or null)"
    }
  ],
  "statistics": [
    {
      "metric": "What is being measured (with units)",
      "value": "Exact value as stated in source (preserve qualifiers like 'approximately')",
      "context": "Plain-language explanation of what this number means and its scope",
      "trend": "Previous value or directional change if mentioned, otherwise null",
      "source": "Source name/url",
      "date": "Year or date range the statistic covers",
      "reliability": "Verified|Reported|Estimated|Claimed"
    }
  ],
  "quotes": [
    {
      "text": "Exact verbatim quote (do not paraphrase)",
      "speaker": {
        "name": "Full name (or 'Unknown' if not stated)",
        "title": "Job title or role (or null)",
        "organization": "Affiliated organization (or null)"
      },
      "context": "What was being discussed when this was said (1 sentence)",
      "source": "Publication name/url",
      "relevance": Float (0.0-1.0),
      "type": "Expert Opinion|Stakeholder Perspective|Research Conclusion|Industry Insight|Policy Statement"
    }
  ],
  "concepts": [
    {
      "name": "Concept or term name",
      "definition": "Clear 1-3 sentence definition as used in the source material",
      "aliases": ["Synonyms", "Abbreviations", "Alternative names"] or [],
      "importance": Float (0.0-1.0),
      "domain": "Field or discipline this concept belongs to",
      "relatedConcepts": ["Other extracted concept names this connects to"],
      "isContested": Boolean (true if the definition is disputed or evolving)
    }
  ],
  "relationships": [
    {
      "from": "Entity/concept name (must match a name in concepts or keyFindings)",
      "to": "Entity/concept name",
      "type": "causes|enables|inhibits|correlates_with|contradicts|supports|competes_with|part_of|evolved_from|regulates|depends_on|alternative_to|preceded_by",
      "description": "1-sentence explanation of how these entities relate",
      "strength": "Strong|Moderate|Weak",
      "evidence": "Brief supporting evidence from the content"
    }
  ],
  "conflicts": [
    {
      "claim1": {
        "statement": "First claim",
        "source": "Source of first claim"
      },
      "claim2": {
        "statement": "Contradicting claim",
        "source": "Source of second claim"
      },
      "nature": "Brief description of the contradiction"
    }
  ] or [],
  "gaps": [
    "Description of notable information gaps or areas where the content was thin"
  ] or []
}`
        ),
      ]);

      const content = response.content.toString();
      console.log('Received response from AI, parsing JSON...');
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        throw new Error('Invalid response format from AI');
      }

      const extractedData: ExtractedData = JSON.parse(jsonMatch[0]);

      // Validate extracted data
      if (!extractedData.keyFindings || extractedData.keyFindings.length === 0) {
        console.warn('No key findings extracted, adding fallback data');
        extractedData.keyFindings = [{
          text: `Research findings on ${query.topic}`,
          importance: 0.7,
          sources: relevantData.slice(0, 3).map(d => d.source),
          category: 'General Findings'
        }];
      }

      console.log('Data Extractor Agent: Extraction complete');
      console.log(`Extracted: ${extractedData.keyFindings.length} findings, ${extractedData.statistics?.length || 0} statistics`);

      return {
        extractedData,
        status: 'summarizing',
        progress: 60,
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Data Extractor Agent Error:', error.message);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to extract data: ${error.message}`);
    }
  }
}