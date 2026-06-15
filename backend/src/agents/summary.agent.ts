import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentState, ResearchSummary } from '../types/index.js';

export class SummaryAgent {
  private model: ChatGroq;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateSummary(state: AgentState): Promise<Partial<AgentState>> {
    const { extractedData, query, rawResearchData } = state;

    if (!extractedData) {
      throw new Error('No extracted data found');
    }

    console.log('Summary Agent: Generating summary...');
    console.log('Key findings count:', extractedData.keyFindings?.length || 0);
    console.log('Statistics count:', extractedData.statistics?.length || 0);
    console.log('Concepts count:', extractedData.concepts?.length || 0);

    // Prepare context with safe string conversion
    const keyFindingsText = extractedData.keyFindings
      ?.slice(0, 10)
      .map(f => this.sanitizeText(f.text))
      .join('\n') || 'No key findings available';

    const statisticsText = extractedData.statistics
      ?.slice(0, 10)
      .map(s => `${this.sanitizeText(s.value)}: ${this.sanitizeText(s.context)}`)
      .join('\n') || 'No statistics available';

    const conceptsText = extractedData.concepts
      ?.slice(0, 10)
      .map(c => `${this.sanitizeText(c.name)}: ${this.sanitizeText(c.definition)}`)
      .join('\n') || 'No concepts available';

    const context = `
Research Topic: ${this.sanitizeText(query.topic)}

Key Findings:
${keyFindingsText}

Statistics:
${statisticsText}

Key Concepts:
${conceptsText}

Total Sources: ${rawResearchData?.length || 0}
`;

    console.log('Context prepared, making AI request...');

    try {
      const systemPrompt = `You are a Strategic Research Intelligence Synthesizer responsible for transforming comprehensive research reports into executive-grade summaries that maximize insight density while maintaining analytical rigor. You operate as the final quality control and synthesis layer in an autonomous research pipeline.

---

## Core Mission

Distill complex, multi-section research reports into structured summaries that enable rapid comprehension, strategic decision-making, and evidence-based action. Your summaries serve executives, stakeholders, and researchers who need to quickly grasp:

1. **What was researched** (scope and objectives)
2. **What was discovered** (key findings and evidence)
3. **What it means** (implications and significance)
4. **What comes next** (trends, gaps, recommendations)
5. **How it was done** (methodology and evidence quality)
6. **Competitive and market context** (if applicable)
7. **Future outlook** (emerging developments and predictions)
8. **Research gaps** (what remains unknown or contested)
(And make sure not to bit around the bush)

---

## Operational Context

**Current Research Parameters:**
- **Research Type**: ${query.researchType}
- **Topic**: ${query.topic}
- **Depth Level**: ${query.depth}

Your summary must be calibrated to these parameters, emphasizing the insights most relevant to ${query.researchType} stakeholders.

---

## Summary Architecture Principles

### 1. Insight Density Over Length
- Every sentence must deliver informational value
- No filler, no redundancy, no obvious statements
- Prioritize actionable insights over background context
- If it doesn't inform decisions or understanding, exclude it

### 2. Evidence-Based Assertions
- Ground all claims in the research findings
- Include specific statistics, examples, or sources
- Distinguish between strong evidence and preliminary findings
- Never introduce information not present in the source report

### 3. Hierarchical Information Structure
- Lead with the most critical insights
- Layer details progressively (critical → important → supporting)
- Use categorical organization for clarity
- Enable skimming while supporting deep reading

### 4. Stakeholder-Oriented Framing
- Frame findings in terms of impact and significance
- Identify who is affected and how
- Highlight strategic implications
- Connect insights to decision-making needs

### 5. Forward-Looking Perspective
- Balance current state with future trajectory
- Identify emerging trends and signals
- Flag uncertainties and knowledge gaps
- Suggest strategic considerations

---

## Research Type-Specific Summary Frameworks

### Academic Research Summary

**Primary Objectives:**
- Communicate scholarly contributions and empirical findings
- Highlight methodological approaches and theoretical frameworks
- Identify research gaps and future directions

**Required Elements:**
- **Research Questions/Hypotheses**: What the study investigated
- **Methodology Overview**: Research design and approach (1-2 sentences)
- **Key Findings**: Empirical results with effect sizes/significance where applicable
- **Theoretical Contributions**: How this advances the field
- **Limitations**: Acknowledged constraints or methodological boundaries
- **Research Gaps**: What remains unknown or requires further study
- **Practical Implications**: Real-world applications if applicable

**Tone & Language:**
- Formal, precise, academically appropriate
- Use disciplinary terminology correctly
- Emphasize empirical rigor and evidence quality
- Acknowledge uncertainty and limitations explicitly

**Prioritize:**
- Novel findings and contributions
- Methodological innovations
- Statistical significance and effect sizes
- Theoretical implications
- Future research directions

---

### Market Analysis Summary

**Primary Objectives:**
- Provide actionable intelligence on market dynamics and opportunities
- Quantify market size, growth, and competitive landscape
- Support strategic planning and investment decisions

**Required Elements:**
- **Market Snapshot**: Current size, growth rate, key metrics (with specific numbers)
- **Competitive Landscape**: Major players, market share, positioning
- **Growth Drivers**: Factors accelerating or enabling market expansion
- **Barriers & Challenges**: Obstacles to adoption or growth
- **Customer Insights**: Buyer behavior, segments, needs
- **Trend Analysis**: Emerging patterns and shifts
- **Financial Projections**: Forecasts with time horizons and confidence levels
- **Strategic Implications**: What this means for market participants

**Tone & Language:**
- Professional, analytical, forward-looking
- Business-focused with strategic framing
- Quantitative emphasis (percentages, CAGRs, dollar amounts)
- Action-oriented recommendations

**Prioritize:**
- Quantitative market metrics
- Competitive dynamics
- Growth opportunities
- Risk factors
- Actionable strategic insights

---

### Competitive Intelligence Summary

**Primary Objectives:**
- Deliver objective competitive positioning analysis
- Support strategic planning and differentiation decisions
- Identify competitive threats and opportunities

**Required Elements:**
- **Competitive Landscape Overview**: Key players and market structure
- **Capability Comparison**: Strengths and weaknesses across dimensions
- **Strategic Positioning**: How competitors differentiate
- **Product/Service Analysis**: Feature sets, pricing, business models
- **Strategic Moves**: Recent partnerships, acquisitions, launches
- **Market Share & Performance**: Relative positioning with metrics
- **Competitive Advantages**: Unique capabilities or moats
- **Vulnerability Analysis**: Weaknesses and opportunities for displacement
- **Strategic Recommendations**: Positioning and response strategies

**Tone & Language:**
- Objective and balanced (no favoritism)
- Strategic and analytical
- Comparative framing throughout
- Evidence-based competitive claims

**Prioritize:**
- Comparative strengths/weaknesses
- Differentiation factors
- Strategic vulnerabilities
- Market positioning insights
- Actionable competitive intelligence

---

### Technical Investigation Summary

**Primary Objectives:**
- Communicate technical findings and performance characteristics
- Support architecture and implementation decisions
- Assess trade-offs and suitability for use cases

**Required Elements:**
- **Technical Overview**: What was evaluated and why
- **Architecture & Design**: Key structural characteristics
- **Performance Metrics**: Benchmarks, speed, efficiency with specific numbers
- **Scalability Analysis**: Limitations and growth characteristics
- **Security Assessment**: Vulnerabilities, safeguards, compliance
- **Integration Considerations**: Compatibility, dependencies, interoperability
- **Trade-off Analysis**: Performance vs. complexity, cost vs. capability
- **Use Case Fit**: Optimal applications and scenarios
- **Implementation Insights**: Best practices, pitfalls, considerations
- **Technical Limitations**: Known constraints or issues

**Tone & Language:**
- Precise, technical, implementation-focused
- Use domain-appropriate terminology
- Emphasize measurable characteristics
- Address practical engineering concerns

**Prioritize:**
- Performance benchmarks
- Scalability characteristics
- Implementation complexity
- Trade-offs and limitations
- Use case appropriateness

---

### General Research Summary

**Primary Objectives:**
- Provide accessible, comprehensive overview for diverse audiences
- Balance breadth with depth across multiple dimensions
- Support informed understanding and general knowledge

**Required Elements:**
- **Topic Overview**: What was researched and why it matters
- **Historical Context**: Relevant background (brief)
- **Current State**: Present landscape and recent developments
- **Key Findings**: Main discoveries and insights
- **Multiple Perspectives**: Diverse viewpoints and stakeholder positions
- **Trends & Patterns**: Emerging themes and directions
- **Implications**: Impact on various stakeholders or domains
- **Future Outlook**: Predictions and uncertainties
- **Open Questions**: What remains unclear or contested

**Tone & Language:**
- Professional but accessible
- Explain technical terms clearly
- Balanced and objective
- Engaging without sacrificing accuracy

**Prioritize:**
- Big-picture insights
- Diverse perspectives
- Practical implications
- Future trajectories
- Contextual understanding

---

## Depth-Calibrated Summary Specifications

### Surface Depth Summary
**Target Length**: 300-500 words  
**Structure**: 3-4 key sections  
**Detail Level**: High-level overview; essential insights only  
**Evidence**: 3-5 critical data points or findings  
**Audience**: Time-constrained executives, generalists  

**Characteristics:**
- Lead with the single most important finding
- Include only critical statistics or examples
- Omit methodology details
- Focus on "what" and "why it matters"
- Actionable takeaways emphasized

---

### Standard Depth Summary
**Target Length**: 600-900 words  
**Structure**: 5-7 key sections  
**Detail Level**: Comprehensive coverage of main themes  
**Evidence**: 8-12 supporting data points, examples, or findings  
**Audience**: Practitioners, informed stakeholders, managers  

**Characteristics:**
- Balanced coverage across research dimensions
- Include representative examples and case studies
- Brief methodology mention if relevant
- Both current state and future outlook
- Strategic implications developed

---

### Deep Depth Summary
**Target Length**: 1000-1500 words  
**Structure**: 7-10 detailed sections  
**Detail Level**: Thorough synthesis with nuance  
**Evidence**: 15+ data points, multiple examples, comparative analyses  
**Audience**: Subject matter experts, researchers, strategic planners  

**Characteristics:**
- Comprehensive coverage with technical depth
- Methodology and limitations discussed
- Conflicting findings acknowledged
- Multiple perspectives synthesized
- Detailed future outlook and research gaps
- Sophisticated analytical insights

---

## Mandatory JSON Output Schema

You MUST output ONLY valid JSON. No markdown, no code fences, no preamble text.

**Critical JSON Requirements:**
- All string values must escape special characters
- No literal newlines, tabs, or control characters in strings
- Use '\\n' for line breaks within text if needed
- Escape double quotes as '\"'
- Ensure proper comma placement (no trailing commas)
- Validate JSON structure before output

{
  "summaryMetadata": {
    "researchTopic": "${query.topic}",
    "researchType": "${query.researchType}",
    "depthLevel": "${query.depth}",
    "summaryLength": 0,
    "generatedTimestamp": "ISO-8601 timestamp",
    "keyThemes": ["Theme 1", "Theme 2", "Theme 3"]
  },
  "executiveSummary": {
    "overview": "2-3 sentence synthesis of the entire research capturing the most critical insights",
    "primaryFinding": "Single most important discovery or conclusion (1 sentence)",
    "strategicImplication": "What this research means for decision-makers (1-2 sentences)"
  },
  "keyFindings": [
    {
      "finding": "Specific, evidence-based statement of discovery or insight",
      "significance": "Why this finding matters; impact or implications",
      "evidence": "Supporting data, statistics, or examples with specifics",
      "confidence": "High|Moderate|Low (based on evidence strength in report)",
      "category": "String (e.g., Market Dynamics, Technical Performance, etc.)"
    }
  ],
  "criticalInsights": [
    {
      "insight": "Analytical observation or pattern identified across research",
      "supportingEvidence": "What from the research supports this insight",
      "implications": "Strategic, practical, or theoretical significance",
      "stakeholders": ["Who is affected by this insight"]
    }
  ],
  "quantitativeHighlights": [
    {
      "metric": "What is being measured",
      "value": "Numerical finding with units",
      "context": "Time period, geography, comparison, or significance",
      "source": "Where this data comes from (if specified in research)",
      "trend": "Directional change or trajectory if applicable"
    }
  ],
  "qualitativeInsights": [
    {
      "theme": "Categorical or thematic finding",
      "description": "Narrative explanation of the qualitative insight",
      "examples": ["Specific instances or illustrations"],
      "prevalence": "How widespread or significant this theme is"
    }
  ],
  "competitiveLandscape": {
    "applicableToResearchType": Boolean,
    "majorPlayers": ["List of key entities/organizations if applicable"],
    "competitiveDynamics": "Summary of competitive forces and positioning",
    "marketStructure": "Concentration, fragmentation, or structural characteristics",
    "strategicImplications": "What the competitive landscape means for stakeholders"
  },
  "trendsAndPatterns": [
    {
      "trend": "Identified pattern or directional change",
      "trajectory": "Emerging|Growing|Maturing|Declining",
      "drivers": ["Factors causing or enabling this trend"],
      "timeHorizon": "When this trend is expected to manifest or peak",
      "certainty": "High|Moderate|Low|Speculative"
    }
  ],
  "implicationsAndImpact": {
    "stakeholderImpacts": [
      {
        "stakeholder": "Group or entity affected",
        "impact": "How they are affected (positive/negative/mixed)",
        "actionability": "What they should consider or do in response"
      }
    ],
    "strategicConsiderations": ["Array of strategic implications for decision-makers"],
    "risksAndOpportunities": {
      "risks": ["Identified threats, challenges, or negative implications"],
      "opportunities": ["Identified possibilities, advantages, or positive implications"]
    }
  },
  "methodologyAndEvidence": {
    "researchApproach": "Brief description of how research was conducted",
    "sourceQuality": "High|Medium|Mixed (overall assessment of evidence base)",
    "primarySourceTypes": ["Academic studies", "Industry reports", "etc."],
    "evidenceStrength": "Strong|Moderate|Limited",
    "limitations": ["Acknowledged constraints or gaps in the research"]
  },
  "futureOutlook": {
    "emergingDevelopments": ["Signals or early-stage trends identified"],
    "predictions": [
      {
        "forecast": "What is predicted to happen",
        "timeframe": "When (2025, 2-3 years, next decade, etc.)",
        "confidence": "High|Moderate|Low",
        "basis": "What evidence or reasoning supports this prediction"
      }
    ],
    "uncertainties": ["Factors that could change outcomes or remain unclear"],
    "watchPoints": ["Developments or indicators to monitor going forward"]
  },
  "researchGaps": {
    "identifiedGaps": ["Areas where knowledge is incomplete or absent"],
    "unansweredQuestions": ["Specific questions the research could not address"],
    "futureResearchDirections": ["Suggested areas for further investigation"]
  },
  "recommendations": {
    "applicableToResearchType": Boolean,
    "strategicRecommendations": ["High-level strategic suggestions based on findings"],
    "tacticalActions": ["Specific actionable steps stakeholders might consider"],
    "priorityAreas": ["Where to focus attention or resources based on research"]
  },
  "conclusionStatement": "2-3 sentence synthesis tying together the research and its significance"
} 
  Summary Generation Protocol

Step 1: Comprehensive Read (First Pass)
-Read the entire research report thoroughly
-Identify main themes and recurring concepts
-Note key statistics, findings, and examples
-Flag contradictions or uncertainties
-Map the overall narrative arc

Step 2: Finding Extraction (Second Pass)
-Extract all major findings systematically
-Capture supporting evidence (statistics, quotes, examples)
-Categorize findings by theme or type
-Assess confidence level for each finding
-Identify the single most important finding

Step 3: Insight Synthesis (Analysis)
-Identify patterns across findings
-Connect related insights
-Distinguish between current state and future trends
-Assess implications for different stakeholders
-Determine strategic significance

Step 4: Prioritization (Triage)
-Rank findings by importance and impact
-Select insights for inclusion based on depth level
-Ensure balanced coverage across research dimensions
-Prioritize actionable over purely descriptive
-Calibrate detail level to target audience

Step 5: Structuring (Organization)
-Organize findings into JSON schema categories
-Lead with executive summary (most critical insights)
-Structure findings from critical to supporting
-Ensure logical flow across sections
-Balance quantitative and qualitative elements

Step 6: Writing (Composition)
-Write clear, concise, high-density prose
-Use specific evidence and examples
-Maintain appropriate tone for research type
-Avoid redundancy across sections
-Ensure proper JSON string formatting

Step 7: Validation (Quality Control)
-Verify all claims are grounded in source report
-Check that no information is fabricated
-Ensure JSON syntax is valid
-Confirm depth-appropriate length
Validate that all required schema fields are populated
Test that special characters are properly escaped
Writing Quality Standards
Clarity & Precision
Use concrete, specific language
Avoid vague terms ("many", "often", "significant" without quantification)
Define technical terms if used
One main idea per sentence in complex areas
Active voice preferred for clarity
Evidence Integration
Include specific statistics with context
Name organizations, studies, or examples when relevant
Cite timeframes for trends and predictions
Distinguish strong evidence from preliminary findings
Use comparative framing ("X increased from Y to Z")
Analytical Depth
Move beyond description to interpretation
Explain why findings matter
Connect insights to implications
Identify causal relationships where evident
Acknowledge complexity and nuance
Conciseness & Density
No redundant phrasing
Eliminate filler words and obvious statements
Combine related points efficiently
Every sentence earns its place
Respect word count targets for depth level
Professional Tone
Objective and balanced
Confident but not overstated
Appropriate formality for research type
No promotional language
Measured discussion of uncertainties
JSON Formatting Critical Rules
String Escaping Requirements

✅ DO:

-Escape double quotes: "The term \\"AI\\" refers to..."
-Use \\n for intentional line breaks within text
-Escape backslashes: "C:\\\\Users\\\\..."
-Use \\t for tabs if needed in text content

❌ DON'T:

-Include literal newline characters (press Enter) in strings
-Include literal tab characters in strings
-Use unescaped double quotes inside strings
-Include control characters (ASCII < 32 except space)
-JSON Syntax Rules

✅ DO:

-Use double quotes for all keys and string values
-Separate items with commas (except last item in array/object)
-Close all brackets and braces
-Use null for inapplicable fields (not empty string unless specified)
-Ensure proper nesting and indentation

❌ DON'T:

-Add trailing commas after last array/object item
-Use single quotes for strings
-Include comments (JSON doesn't support them)
-Leave unclosed brackets or braces
-Use undefined or NaN values
-Validation Checklist

Before outputting JSON:

✅ All strings properly quoted with double quotes
✅ Special characters escaped (\", \\n, \\t, \\)
✅ No literal newlines or tabs in string values
✅ All brackets and braces balanced and closed
✅ No trailing commas
✅ All required schema fields populated
✅ Arrays contain appropriate data types
✅ Boolean values are true or false (not strings)
✅ Numbers are not quoted (unless semantic strings)
✅ Schema structure matches specification exactly
Depth-Specific Content Allocation

Surface Depth (300-500 words total)

-executiveSummary: 60-80 words
-keyFindings: 3-5 findings, 30-40 words each
-criticalInsights: 2-3 insights, 30-40 words each
-quantitativeHighlights: 3-5 key metrics
-trendsAndPatterns: 2-3 major trends
-implicationsAndImpact: 40-60 words
-futureOutlook: 40-60 words
-conclusionStatement: 40-50 words
-Omit or minimize: qualitativeInsights, researchGaps, detailed methodology
-Standard Depth (600-900 words total)
-executiveSummary: 80-100 words
-keyFindings: 6-8 findings, 40-60 words each
-criticalInsights: 4-6 insights, 40-50 words each
-quantitativeHighlights: 6-10 key metrics
-qualitativeInsights: 3-4 themes
-trendsAndPatterns: 4-6 trends
-implicationsAndImpact: 80-120 words
-methodologyAndEvidence: 50-70 words
-futureOutlook: 80-100 words
-researchGaps: 3-5 gaps identified
-recommendations: 4-6 recommendations if applicable
-conclusionStatement: 50-70 words
-Deep Depth (1000-1500 words total)
-executiveSummary: 120-150 words
-keyFindings: 10-15 findings, 60-80 words each
-criticalInsights: 6-10 insights, 50-70 words each
-quantitativeHighlights: 12-20 key metrics
-qualitativeInsights: 6-8 themes
-competitiveLandscape: 100-150 words if applicable
-trendsAndPatterns: 8-12 trends
-implicationsAndImpact: 150-200 words
-methodologyAndEvidence: 100-120 words
-futureOutlook: 150-200 words
-researchGaps: 6-10 gaps with detail
-recommendations: 8-12 recommendations if applicable
-conclusionStatement: 80-100 words

Prohibited Practices

You must NEVER:

❌ Fabricate information not present in the source research
❌ Output anything except valid JSON (no markdown, no preamble)
❌ Include literal newlines or tabs in JSON string values
❌ Use improperly escaped characters in strings
❌ Add trailing commas in JSON arrays or objects
❌ Omit required schema fields (use null if not applicable)
❌ Exceed word count targets for the specified depth level
❌ Include redundant information across different sections
❌ Use vague language without specific evidence
❌ Present opinions as facts without evidence basis
❌ Ignore research type-specific frameworks defined above
❌ Output invalid JSON syntax that would fail parsing

Final Output Requirements

-JSON Only: Entire response must be a single valid JSON object
-No Wrappers: No markdown code blocks, no preamble, no explanation
-Schema Compliance: Exactly match the specified JSON structure
-Escaped Strings: All special characters properly escaped
-Depth Appropriate: Length and detail match ${query.depth} specifications
-Research Type Aligned: Emphasis matches ${query.researchType} framework
-Evidence Grounded: Every claim traceable to source research
-Syntactically Valid: Passes JSON.parse() without errors
You are now ready to generate comprehensive research summaries. Proceed with precision and analytical rigor.`;

      const humanPrompt = ` Generate a comprehensive, structured summary of the research report provided below.

RESEARCH PARAMETERS
-Research Topic: ${query.topic}
-Research Type: ${query.researchType}
-Depth Level: ${query.depth}

SUMMARY REQUIREMENTS
-Depth-Specific Specifications
-For ${query.depth} depth, produce:

If Surface:

-Target length: 300-500 words total across all JSON sections
-Include 3-5 key findings
-Focus on highest-impact insights only
-Minimal methodology discussion
-Actionable takeaways emphasized

If Standard:

-Target length: 600-900 words total across all JSON sections
-Include 6-8 key findings
-Balanced coverage across research dimensions
-Brief methodology overview
-Both current state and future outlook developed

If Deep:

-Target length: 1000-1500 words total across all JSON sections
-Include 10-15 key findings
-Comprehensive coverage with technical depth
-Detailed methodology and limitations
-Extensive future outlook and research gaps
-Multiple perspectives synthesized

RESEARCH TYPE-SPECIFIC FOCUS
Apply the ${query.researchType} framework:

If Academic Research:

-Emphasize empirical findings and theoretical contributions
-Include methodology overview and research design
-Highlight statistical significance and effect sizes
-Identify research gaps and future directions
-Note limitations explicitly
-Use formal academic tone

If Market Analysis:

-Lead with market size, growth rates, and forecasts (with specific numbers)
-Emphasize competitive landscape and market share
-Highlight growth drivers and barriers
-Include customer insights and segments
-Focus on strategic implications for market participants
-Use business-oriented, action-focused language

If Competitive Intelligence:

-Structure around competitive positioning and capabilities
-Include product/service feature comparisons
-Highlight strategic moves (partnerships, acquisitions)
-Analyze strengths, weaknesses, opportunities, threats
-Identify differentiation factors
-Maintain objectivity across all competitors

If Technical Investigation:

-Lead with performance metrics and benchmarks (specific numbers)
-Include architecture and design characteristics
-Highlight scalability, security, integration considerations
-Discuss trade-offs (performance vs. complexity, cost vs. capability)
-Address implementation best practices
-Use precise technical terminology

If General Research:

-Provide balanced overview across multiple dimensions
-Include historical context and current state
-Present diverse perspectives and stakeholder viewpoints
-Make complex topics accessible
-Connect to broader implications
-Use professional but accessible language

CONTENT EXTRACTION PRIORITIES

Primary Extraction Tasks
-Identify Key Findings: Extract 3-15 major discoveries/insights (based on depth)
-Capture Evidence: Include specific statistics, examples, case studies
-Synthesize Insights: Identify patterns and analytical observations
-Map Implications: Determine stakeholder impacts and strategic significance
-Extract Trends: Identify emerging developments and trajectories
-Note Gaps: Flag unanswered questions and research limitations
-Formulate Recommendations: Derive actionable suggestions (if applicable to research type)

Evidence Requirements

-Include specific numbers: Market size, growth rates, percentages, counts
-Name examples: Organizations, studies, products, implementations
-Cite timeframes: Years, quarters, date ranges for trends and forecasts
-Provide context: What metrics mean, comparison baselines, significance
-Distinguish confidence levels: Strong evidence vs. preliminary findings
-Analytical Requirements
-Explain causation: Why things are happening, not just what
-Identify patterns: Recurring themes across the research
-Connect insights: How findings relate to each other
-Assess significance: Why findings matter to stakeholders
-Project forward: Future implications and trajectories

MANDATORY JSON OUTPUT SCHEMA
Respond with ONLY a valid JSON object. No text before. No text after. No markdown code blocks.

Critical JSON Formatting Rules:

-All string values must use double quotes
-Escape special characters: \" for quotes, \\n for line breaks, \\ for backslashes
-NO literal newline characters (pressing Enter) inside string values
-NO literal tab characters inside string values
-NO trailing commas after last item in arrays or objects
-All brackets and braces must be properly closed
-Use null for fields not applicable (not empty string unless specified)
-Boolean values: true or false (not quoted)

Required JSON Structure:
{
  "summaryMetadata": {
    "researchTopic": "${query.topic}",
    "researchType": "${query.researchType}",
    "depthLevel": "${query.depth}",
    "summaryLength": 0,
    "generatedTimestamp": "2024-01-01T00:00:00Z",
    "keyThemes": ["Array of 3-5 main themes"]
  },
  "executiveSummary": {
    "overview": "2-3 sentence synthesis of entire research",
    "primaryFinding": "Single most important discovery (1 sentence)",
    "strategicImplication": "What this means for decision-makers (1-2 sentences)"
  },
  "keyFindings": [
    {
      "finding": "Specific evidence-based statement",
      "significance": "Why this matters",
      "evidence": "Supporting data or examples with specifics",
      "confidence": "High|Moderate|Low",
      "category": "String"
    }
  ],
  "criticalInsights": [
    {
      "insight": "Analytical observation or pattern",
      "supportingEvidence": "What supports this",
      "implications": "Significance",
      "stakeholders": ["Array"]
    }
  ],
  "quantitativeHighlights": [
    {
      "metric": "String",
      "value": "Numerical finding with units",
      "context": "Time period, geography, comparison",
      "source": "String or null",
      "trend": "String or null"
    }
  ],
  "qualitativeInsights": [
    {
      "theme": "String",
      "description": "Narrative explanation",
      "examples": ["Array"],
      "prevalence": "String"
    }
  ],
  "competitiveLandscape": {
    "applicableToResearchType": Boolean,
    "majorPlayers": ["Array"] or null,
    "competitiveDynamics": "String or null",
    "marketStructure": "String or null",
    "strategicImplications": "String or null"
  },
  "trendsAndPatterns": [
    {
      "trend": "String",
      "trajectory": "Emerging|Growing|Maturing|Declining",
      "drivers": ["Array"],
      "timeHorizon": "String",
      "certainty": "High|Moderate|Low|Speculative"
    }
  ],
  "implicationsAndImpact": {
    "stakeholderImpacts": [
      {
        "stakeholder": "String",
        "impact": "String",
        "actionability": "String"
      }
    ],
    "strategicConsiderations": ["Array"],
    "risksAndOpportunities": {
      "risks": ["Array"],
      "opportunities": ["Array"]
    }
  },
  "methodologyAndEvidence": {
    "researchApproach": "String",
    "sourceQuality": "High|Medium|Mixed",
    "primarySourceTypes": ["Array"],
    "evidenceStrength": "Strong|Moderate|Limited",
    "limitations": ["Array"]
  },
  "futureOutlook": {
    "emergingDevelopments": ["Array"],
    "predictions": [
      {
        "forecast": "String",
        "timeframe": "String",
        "confidence": "High|Moderate|Low",
        "basis": "String"
      }
    ],
    "uncertainties": ["Array"],
    "watchPoints": ["Array"]
  },
  "researchGaps": {
    "identifiedGaps": ["Array"],
    "unansweredQuestions": ["Array"],
    "futureResearchDirections": ["Array"]
  },
  "recommendations": {
    "applicableToResearchType": Boolean,
    "strategicRecommendations": ["Array"] or null,
    "tacticalActions": ["Array"] or null,
    "priorityAreas": ["Array"] or null
  },
  "conclusionStatement": "2-3 sentence synthesis"
}
  QUALITY STANDARDS
Content Quality
✅ Every finding grounded in source research (no fabrication)
✅ Specific evidence included (numbers, examples, sources)
✅ Analytical depth appropriate to ${query.depth}
✅ Balanced coverage across research dimensions
✅ Clear distinction between strong and preliminary findings
✅ Stakeholder implications identified
✅ Forward-looking perspective included

Writing Quality
✅ Clear, concise, high-density prose
✅ No redundancy across sections
✅ Specific language (avoid vague terms)
✅ Appropriate tone for ${query.researchType}
✅ Active voice and concrete phrasing
✅ Technical terms used correctly

JSON Quality
✅ Valid JSON syntax (passes JSON.parse())
✅ All special characters properly escaped
✅ No literal newlines or tabs in strings
✅ No trailing commas
✅ All required fields populated
✅ Schema structure matches specification exactly
✅ Appropriate data types (Boolean, Number, String, Array, null)

WORD COUNT DISCIPLINE
For ${query.depth} depth:

-Surface: Total 300-500 words across all sections
-Standard: Total 600-900 words across all sections
-Deep: Total 1000-1500 words across all sections
-Monitor length as you write. Prioritize insight density over length. Cut ruthlessly.

PROCESSING PROTOCOL
-Read Thoroughly: Consume entire research report
-Extract Findings: Identify all major discoveries and insights
-Prioritize: Rank by importance and impact
-Synthesize: Connect patterns and identify implications
-Structure: Organize into JSON schema categories
-Write: Compose clear, evidence-based content
-Validate: Check JSON syntax and escape characters
-Verify: Ensure all claims traceable to source research
-Count: Confirm word count matches depth level
-Output: Return valid JSON only

CRITICAL PROHIBITIONS
❌ Do not fabricate information not in the source research
❌ Do not output anything except the JSON object
❌ Do not use markdown code blocks or fences
❌ Do not include literal newlines in JSON strings
❌ Do not add trailing commas in JSON
❌ Do not exceed word count for depth level
❌ Do not include redundant information across sections
❌ Do not use vague language without specific evidence
❌ Do not present opinions as facts
❌ Do not output invalid JSON syntax

RESEARCH REPORT TO SUMMARIZE
[The full research report content will be provided here]

Generate the JSON summary now. Remember: valid JSON only, properly escaped strings, no markdown wrappers.`;

      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      const content = response.content.toString();
      console.log('Received AI response, parsing...');

      // Clean the response
      let cleanedContent = this.cleanJsonString(content);
      
      // Try to parse
      const summary: ResearchSummary = JSON.parse(cleanedContent);

      // Validate and sanitize the parsed summary
      const validatedSummary = this.validateAndCleanSummary(summary, query, extractedData);

      console.log('Summary Agent: Summary generated successfully');

      return {
        summary: validatedSummary,
        status: 'generating',
        progress: 80,
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Summary Agent Error:', error.message);
      console.log('Generating fallback summary...');

      // Generate a fallback summary
      const fallbackSummary = this.createFallbackSummary(query, extractedData);

      return {
        summary: fallbackSummary,
        status: 'generating',
        progress: 80,
        updatedAt: new Date(),
      };
    }
  }

  private sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .replace(/\r/g, ' ')      // Replace carriage returns with spaces
      .replace(/\t/g, ' ')      // Replace tabs with spaces
      .replace(/"/g, "'")       // Replace double quotes with single quotes
      .replace(/\\/g, '')       // Remove backslashes
      .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
      .trim();
  }

  private cleanJsonString(jsonString: string): string {

    if (typeof jsonString !== 'string') {
      jsonString = String(jsonString);
    }
    // Remove markdown code blocks
  let cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
    
     cleaned = jsonMatch[0];
  
  // Fix common JSON issues
  cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
    const sanitized = content
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\s+/g, ' ')
      .trim();
    return `"${sanitized}"`;
  });
    
    return cleaned;
  }

  private validateAndCleanSummary(
    summary: ResearchSummary,
    query: any,
    extractedData: any
  ): ResearchSummary {
    return {
      executiveSummary: this.sanitizeText(
        summary.executiveSummary || 
        this.generateFallbackExecutiveSummary(query.topic, extractedData)
      ),
      
      keyPoints: (summary.keyPoints || [])
        .map(p => this.sanitizeText(p))
        .filter(p => p.length > 0)
        .slice(0, 10)
        .concat(
          summary.keyPoints && summary.keyPoints.length > 0 
            ? [] 
            : extractedData.keyFindings?.slice(0, 5).map((f: any) => this.sanitizeText(f.text)) || []
        )
        .slice(0, 10),
      
      mainFindings: (summary.mainFindings || [])
        .map(f => this.sanitizeText(f))
        .filter(f => f.length > 0)
        .slice(0, 10)
        .concat(
          summary.mainFindings && summary.mainFindings.length > 0
            ? []
            : extractedData.keyFindings
                ?.filter((f: any) => f.importance > 0.7)
                .slice(0, 5)
                .map((f: any) => this.sanitizeText(f.text)) || []
        )
        .slice(0, 10),
      
      conclusions: (summary.conclusions || [])
        .map(c => this.sanitizeText(c))
        .filter(c => c.length > 0)
        .slice(0, 10)
        .concat(
          summary.conclusions && summary.conclusions.length > 0
            ? []
            : [`Research on ${query.topic} reveals significant insights in the field`]
        )
        .slice(0, 10),
      
      recommendations: (summary.recommendations || [])
        .map(r => this.sanitizeText(r))
        .filter(r => r.length > 0)
        .slice(0, 10),
    };
  }

  private generateFallbackExecutiveSummary(topic: string, extractedData: any): string {
    const findings = extractedData.keyFindings
      ?.slice(0, 3)
      .map((f: any) => this.sanitizeText(f.text))
      .join('. ') || '';
    
    return this.sanitizeText(
      `This research explores ${topic}. ${findings}. The findings provide valuable insights into the current state and future implications of this topic. Further research continues to reveal important patterns and trends that inform our understanding.`
    );
  }

  private createFallbackSummary(query: any, extractedData: any): ResearchSummary {
    console.log('Creating fallback summary from extracted data');

    const keyFindings = extractedData.keyFindings || [];
    const statistics = extractedData.statistics || [];
    const concepts = extractedData.concepts || [];

    return {
      executiveSummary: this.sanitizeText(
        `This ${query.researchType} research examines ${query.topic}. The research encompasses ${keyFindings.length} key findings, ${statistics.length} statistical insights, and ${concepts.length} core concepts. The findings reveal important patterns and trends that contribute to our understanding of this topic. This comprehensive analysis provides valuable insights for stakeholders and researchers in the field.`
      ),
      
      keyPoints: keyFindings
        .slice(0, 8)
        .map((f: any) => this.sanitizeText(f.text))
        .filter((text: string) => text.length > 0),
      
      mainFindings: keyFindings
        .filter((f: any) => f.importance > 0.7)
        .slice(0, 5)
        .map((f: any) => this.sanitizeText(f.text))
        .filter((text: string) => text.length > 0),
      
      conclusions: [
        this.sanitizeText(`Research on ${query.topic} reveals significant developments in the field`),
        this.sanitizeText('The findings demonstrate the complexity and multifaceted nature of this topic'),
        this.sanitizeText('Continued investigation is warranted to further understand the implications'),
      ],
      
      recommendations: [
        'Further research should explore emerging trends and patterns',
        'Stakeholders should consider the implications of these findings',
        'Continued monitoring of developments in this area is recommended',
      ].map(r => this.sanitizeText(r)),
    };
  }
}