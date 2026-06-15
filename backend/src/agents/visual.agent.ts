import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import axios from 'axios';
import { AgentState, DiagramData, ImageData } from '../types/index.js';

export class VisualAgent {
  private model: ChatGroq;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateVisuals(state: AgentState): Promise<Partial<AgentState>> {
    const { query, extractedData, summary } = state;

    if (!extractedData || !summary) {
      console.log('Visual Agent: Skipping - insufficient data');
      return {
        diagrams: [],
        images: [],
      };
    }

    console.log('Visual Agent: Generating visual representations...');

    const diagrams: DiagramData[] = [];
    const images: ImageData[] = [];

    try {
      // Generate diagram specifications
      const diagramSpecs = await this.generateDiagramSpecs(
        query.topic,
        extractedData,
        summary
      );

      console.log(`Generated ${diagramSpecs.length} diagram specifications`);

      // Create actual diagrams using various methods
      for (const spec of diagramSpecs) {
        try {
          const diagram = await this.createDiagram(spec);
          diagrams.push(diagram);
        } catch (error) {
          console.error(`Failed to create diagram: ${spec.type}`, error);
        }
      }

      // Generate charts using QuickChart API
      if (extractedData.statistics && extractedData.statistics.length > 0) {
        const chartDiagrams = await this.generateCharts(
          query.topic,
          extractedData.statistics
        );
        diagrams.push(...chartDiagrams);
      }

      // Generate concept maps
      if (extractedData.concepts && extractedData.concepts.length > 0) {
        const conceptMap = await this.generateConceptMap(
          query.topic,
          extractedData.concepts
        );
        if (conceptMap) {
          diagrams.push(conceptMap);
        }
      }

      // Generate relationship diagrams
      if (extractedData.relationships && extractedData.relationships.length > 0) {
        const relationshipDiagram = await this.generateRelationshipDiagram(
          query.topic,
          extractedData.relationships
        );
        if (relationshipDiagram) {
          diagrams.push(relationshipDiagram);
        }
      }

      console.log(`Visual Agent: Generated ${diagrams.length} diagrams`);

    } catch (error: any) {
      console.error('Visual Agent error:', error.message);
    }

    return {
      diagrams: diagrams.slice(0, 10),
      images: images.slice(0, 10),
    };
  }

  private async generateDiagramSpecs(
    topic: string,
    extractedData: any,
    summary: any
  ): Promise<any[]> {
    const prompt = `Analyze the following research data and generate 3-5 strategic diagram specifications that will enhance understanding and insight extraction.

---

## RESEARCH CONTEXT

**Topic**: ${topic}

**Key Findings**:
${JSON.stringify(extractedData.keyFindings?.slice(0, 5) || [], null, 2)}

**Core Concepts**:
${JSON.stringify(extractedData.concepts?.slice(0, 5) || [], null, 2)}

**Executive Summary**:
${summary.executiveSummary?.overview?.substring(0, 500) || summary.executiveSummary?.substring(0, 500) || 'Not available'}

---

## DIAGRAM SPECIFICATION REQUIREMENTS

For each recommended diagram:

1. **Type Selection**: Choose the most appropriate visualization type based on the data:
   - \`flowchart\`: For processes, workflows, decision trees, sequential steps
   - \`timeline\`: For chronological events, historical developments, roadmaps
   - \`comparison\`: For side-by-side analysis, before/after, competitive positioning
   - \`hierarchy\`: For organizational structures, taxonomies, nested relationships
   - \`process\`: For cyclical processes, feedback loops, iterative workflows
   - \`cycle\`: For recurring patterns, continuous processes, circular relationships
   - \`matrix\`: For multi-dimensional comparisons, prioritization frameworks (2x2, 3x3)
   - \`network\`: For interconnected relationships, dependency maps, social networks
   - \`funnel\`: For conversion processes, filtering stages, narrowing progressions

2. **Title**: Clear, descriptive title that communicates the diagram's purpose (5-10 words)

3. **Description**: Explain what insight or pattern the diagram should reveal (1-2 sentences)

4. **Elements**: List 3-8 specific components, entities, or data points to visualize

5. **Priority**: Rate the diagram's value (High|Medium|Low) based on:
   - How critical the information is to understanding the topic
   - Whether it reveals non-obvious patterns or relationships
   - If it synthesizes multiple findings effectively

---

## SELECTION CRITERIA

Prioritize diagrams that:
✅ Reveal patterns not immediately obvious from text
✅ Synthesize multiple related findings into a cohesive view
✅ Show relationships, dependencies, or hierarchies
✅ Illustrate processes, flows, or sequences
✅ Enable quick comparison across dimensions
✅ Support evidence-based decision-making

Avoid diagrams that:
❌ Merely restate text in visual form without added insight
❌ Are too complex for the available data
❌ Duplicate information better shown in other diagram types
❌ Require data not present in the research

---

## OUTPUT FORMAT

Return a valid JSON array with 3-5 diagram specifications, ordered by priority (highest first):

\`\`\`json
[
  {
    "type": "flowchart|timeline|comparison|hierarchy|process|cycle|matrix|network|funnel",
    "title": "Clear Descriptive Title",
    "description": "1-2 sentence explanation of what this diagram reveals",
    "elements": ["element1", "element2", "element3"],
    "priority": "High|Medium|Low",
    "rationale": "1 sentence justifying why this diagram is valuable"
  }
]
\`\`\`

Generate the JSON array now. No additional text.`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(`You are an elite Data Visualization Strategist specializing in translating complex research into intuitive, publication-grade visual representations.

Your expertise spans:
- Information architecture and visual hierarchy design
- Chart type selection based on data characteristics
- Cognitive load optimization for visual communication
- Academic and professional visualization standards

Your task is to analyze research content and recommend visual diagrams that maximize comprehension, reveal patterns, and support evidence-based decision-making.

Output ONLY valid JSON. No markdown, no explanations, no preamble.`),
        new HumanMessage(prompt),
      ]);

      const content = response.content.toString();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Diagram spec generation failed:', error);
    }

    return [];
  }

  private async createDiagram(spec: any): Promise<DiagramData> {
    // Use Mermaid.ink for diagram generation
    const mermaidCode = await this.generateMermaidCode(spec);
    
    const encodedMermaid = Buffer.from(mermaidCode).toString('base64');
    const url = `https://mermaid.ink/img/${encodedMermaid}`;

    return {
      type: spec.type || 'infographic',
      url: url,
      description: spec.description || spec.title,
      source: 'AI Generated Diagram',
    };
  }

  private async generateMermaidCode(spec: any): Promise<string> {
    const prompt =  `Generate production-ready Mermaid diagram code based on the following specification.

---

## DIAGRAM SPECIFICATION

**Type**: ${spec.type}
**Title**: ${spec.title}
**Description**: ${spec.description}
**Elements to Include**: ${JSON.stringify(spec.elements)}
**Priority**: ${spec.priority || 'Medium'}

---

## MERMAID SYNTAX REQUIREMENTS

### General Rules
- Use the most appropriate Mermaid diagram type for "${spec.type}"
- Start with the correct diagram declaration (\`graph TD\`, \`sequenceDiagram\`, \`classDiagram\`, etc.)
- Use alphanumeric node IDs (A, B, C, or Node1, Node2, etc.)
- Keep node labels clear and concise (max 30 chars)
- Use proper arrow syntax for relationships
- Ensure proper indentation for readability

### Type-Specific Guidance

**For flowchart**: Use \`graph TD\` (top-down) or \`graph LR\` (left-right). Show clear flow with decision points if applicable.

**For timeline**: Use \`gantt\` diagram or \`graph LR\` with dated nodes in chronological order.

**For comparison**: Use \`graph TD\` with parallel branches or subgraphs for side-by-side comparison.

**For hierarchy**: Use \`graph TD\` with clear parent-child relationships.

**For process/cycle**: Use \`graph\` with circular arrows showing iterative flow.

**For matrix**: Use \`graph\` with subgraphs to create quadrants.

**For network**: Use \`graph LR\` showing interconnected nodes with labeled relationships.

---

## STYLING RECOMMENDATIONS

- Use descriptive node shapes where appropriate:
  - \`[Rectangle]\` for standard nodes
  - \`(Rounded)\` for start/end points
  - \`{Diamond}\` for decision points
  - \`[[Subroutine]]\` for processes
  - \`[(Database)]\` for data stores

- Use clear relationship labels:
  - \`A --> B\` for simple flow
  - \`A -->|label| B\` for labeled relationships
  - \`A -.->|optional| B\` for dotted lines

- Group related elements using subgraphs if helpful:
  \`\`\`
  subgraph Title
    A --> B
  end
  \`\`\`

---

## EXAMPLES

**Flowchart Example**:
\`\`\`
graph TD
    Start([Start Research]) --> Collect[Collect Data]
    Collect --> Analyze{Sufficient Data?}
    Analyze -->|Yes| Report[Generate Report]
    Analyze -->|No| Collect
    Report --> End([End])
\`\`\`

**Hierarchy Example**:
\`\`\`
graph TD
    Root[Main Topic] --> Branch1[Subtopic 1]
    Root --> Branch2[Subtopic 2]
    Branch1 --> Leaf1[Detail A]
    Branch1 --> Leaf2[Detail B]
\`\`\`

**Network Example**:
\`\`\`
graph LR
    A[Concept A] -->|influences| B[Concept B]
    B -->|relates to| C[Concept C]
    C -->|depends on| A
    A -->|supports| D[Concept D]
\`\`\`

---

## OUTPUT REQUIREMENTS

Generate ONLY the Mermaid code. No explanations. No markdown fences. Just the diagram syntax.

Start with the appropriate diagram type declaration and build a clear, well-structured diagram that visualizes the specified elements.

Output Mermaid code now:`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(`You are a Mermaid Diagram Syntax Expert with deep knowledge of Mermaid.js syntax, rendering capabilities, and visual design principles.

Your expertise includes:
- All Mermaid diagram types (flowchart, sequence, class, state, ER, gantt, pie, etc.)
- Syntax optimization for rendering stability
- Visual hierarchy and readability
- Color schemes and styling
- Complex relationship representation

Your task is to generate syntactically perfect, render-stable Mermaid code that produces clear, professional diagrams.

CRITICAL REQUIREMENTS:
1. Output ONLY valid Mermaid code
2. No markdown code fences (\`\`\`mermaid)
3. No explanatory text before or after
4. Use proper Mermaid syntax for the specified diagram type
5. Ensure all node IDs are alphanumeric (no special characters except underscores)
6. Keep labels concise (max 30 characters per node)
7. Use clear, hierarchical layout

Output the Mermaid code directly.`),
        new HumanMessage(prompt),
      ]);

      let mermaidCode = response.content.toString()
        .replace(/```mermaid\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return mermaidCode;
    } catch (error) {
      console.error('Mermaid generation failed:', error);
      
      // Fallback simple diagram
      return `graph TD
    A[${spec.title}] --> B[Analysis]
    B --> C[Results]`;
    }
  }

  private async generateCharts(
  topic: string,
  statistics: any[]
): Promise<DiagramData[]> {
  const charts: DiagramData[] = [];

  try {
    // Filter statistics to those with extractable numeric values
    const numericStats = statistics.filter(stat => {
      const value = stat.value || stat.metric || '';
      return /\d+/.test(value); // Contains at least one digit
    });

    if (numericStats.length === 0) {
      console.log('No numeric statistics found for chart generation');
      return charts;
    }

    const topStats = numericStats.slice(0, 6);
    
    // Extract numeric values intelligently
    const chartData = topStats.map(stat => {
      const text = stat.value || stat.metric || '';
      
      // Try to extract percentage
      const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
      if (percentMatch) {
        return {
          label: stat.metric || text.substring(0, 30),
          value: parseFloat(percentMatch[1]),
          unit: '%'
        };
      }
      
      // Try to extract number with context
      const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        return {
          label: stat.metric || text.substring(0, 30),
          value: parseFloat(numberMatch[1]),
          unit: ''
        };
      }
      
      return null;
    }).filter(Boolean);

    if (chartData.length >= 3) {
      // Create a more sophisticated chart configuration
      const barChartUrl = this.createQuickChartUrl({
        type: 'bar',
        data: {
          labels: chartData.map(d => d?.label),
          datasets: [{
            label: 'Key Metrics',
            data: chartData.map(d => d?.value),
            backgroundColor: [
              'rgba(75, 85, 99, 0.8)',
              'rgba(107, 114, 128, 0.8)', 
              'rgba(156, 163, 175, 0.8)',
              'rgba(209, 213, 219, 0.8)',
              'rgba(243, 244, 246, 0.8)',
              'rgba(249, 250, 251, 0.8)'
            ],
            borderColor: 'rgba(31, 41, 55, 1)',
            borderWidth: 1
          }],
        },
        options: {
          title: {
            display: true,
            text: `Key Metrics: ${topic}`,
            fontSize: 16,
            fontColor: '#1f2937'
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: '#374151'
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#374151',
                maxRotation: 45,
                minRotation: 45
              }
            }]
          }
        },
      });

      charts.push({
        type: 'chart',
        url: barChartUrl,
        description: `Bar chart visualizing ${chartData.length} key metrics for ${topic}`,
        source: 'QuickChart API - AI Generated',
      });
    }

  } catch (error) {
    console.error('Chart generation failed:', error);
  }

  return charts;
}

  private createQuickChartUrl(config: any): string {
    const configStr = JSON.stringify(config);
    const encoded = encodeURIComponent(configStr);
    return `https://quickchart.io/chart?c=${encoded}&width=800&height=400`;
  }

  private async generateConceptMap(
  topic: string,
  concepts: any[]
): Promise<DiagramData | null> {
  try {
    if (concepts.length === 0) {
      return null;
    }

    const topConcepts = concepts.slice(0, 10);
    
    // Group concepts by importance or category if available
    const primaryConcepts = topConcepts.filter((c, i) => 
      i < 4 || (c.importance && c.importance > 0.7)
    );
    const secondaryConcepts = topConcepts.filter(c => 
      !primaryConcepts.includes(c)
    );

    let mermaidCode = `graph TB
    MAIN["${this.sanitizeForMermaid(topic)}"]
    
    %% Primary Concepts
`;

    primaryConcepts.forEach((concept, i) => {
      const nodeId = `P${i}`;
      const label = this.sanitizeForMermaid(concept.name || concept.term);
      mermaidCode += `    MAIN --> ${nodeId}["${label}"]\n`;
      
      // Add related concepts as sub-nodes if available
      if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
        const related = concept.relatedConcepts.slice(0, 2);
        related.forEach((rel: any, j: number) => {
          const relId = `${nodeId}_${j}`;
          const relLabel = this.sanitizeForMermaid(rel);
          mermaidCode += `    ${nodeId} -.-> ${relId}["${relLabel}"]\n`;
        });
      }
    });

    if (secondaryConcepts.length > 0) {
      mermaidCode += `\n    %% Secondary Concepts\n`;
      secondaryConcepts.forEach((concept, i) => {
        const nodeId = `S${i}`;
        const label = this.sanitizeForMermaid(concept.name || concept.term);
        mermaidCode += `    MAIN -.-> ${nodeId}["${label}"]\n`;
      });
    }

    // Add styling
    mermaidCode += `\n    classDef primary fill:#4b5563,stroke:#1f2937,color:#fff
    classDef secondary fill:#9ca3af,stroke:#4b5563,color:#fff
    class ${primaryConcepts.map((_, i) => `P${i}`).join(',')} primary
    class ${secondaryConcepts.map((_, i) => `S${i}`).join(',')} secondary
`;

    const encodedMermaid = Buffer.from(mermaidCode).toString('base64');
    const url = `https://mermaid.ink/img/${encodedMermaid}`;

    return {
      type: 'infographic',
      url: url,
      description: `Concept map illustrating ${topConcepts.length} key concepts and their relationships within ${topic}`,
      source: 'AI Generated - Mermaid Diagram',
    };
  } catch (error) {
    console.error('Concept map generation failed:', error);
    return null;
  }
}

// Helper method to sanitize text for Mermaid
private sanitizeForMermaid(text: string): string {
  if (!text) return 'Unknown';
  return text
    .substring(0, 30) // Limit length
    .replace(/["'\[\]{}()]/g, '') // Remove special chars
    .replace(/\n/g, ' ') // Replace newlines
    .trim();
}

  private async generateRelationshipDiagram(
  topic: string,
  relationships: any[]
): Promise<DiagramData | null> {
  try {
    if (relationships.length === 0) {
      return null;
    }

    // Prioritize relationships by strength if available
    const sortedRelationships = relationships
      .sort((a, b) => {
        const strengthOrder = { Strong: 3, Moderate: 2, Weak: 1 };
        const aStrength = strengthOrder[a.strength as keyof typeof strengthOrder] || 0;
        const bStrength = strengthOrder[b.strength as keyof typeof strengthOrder] || 0;
        return bStrength - aStrength;
      })
      .slice(0, 12);

    let mermaidCode = `graph LR
`;

    // Track unique nodes to avoid duplication
    const nodeMap = new Map<string, string>();
    let nodeCounter = 0;

    sortedRelationships.forEach((rel) => {
      // Get or create node IDs
      let fromId = nodeMap.get(rel.from);
      if (!fromId) {
        fromId = `N${nodeCounter++}`;
        nodeMap.set(rel.from, fromId);
      }

      let toId = nodeMap.get(rel.to);
      if (!toId) {
        toId = `N${nodeCounter++}`;
        nodeMap.set(rel.to, toId);
      }

      const fromLabel = this.sanitizeForMermaid(rel.from);
      const toLabel = this.sanitizeForMermaid(rel.to);
      const relType = this.sanitizeForMermaid(rel.relationshipType || rel.type || 'relates to');

      // Use different arrow styles based on strength
      let arrow = '-->';
      if (rel.strength === 'Strong') {
        arrow = '==>';
      } else if (rel.strength === 'Weak') {
        arrow = '-.->';
      }

      mermaidCode += `    ${fromId}["${fromLabel}"] ${arrow}|${relType}| ${toId}["${toLabel}"]\n`;
    });

    // Add styling based on relationship strength
    mermaidCode += `\n    linkStyle default stroke:#4b5563,stroke-width:2px
`;

    const encodedMermaid = Buffer.from(mermaidCode).toString('base64');
    const url = `https://mermaid.ink/img/${encodedMermaid}`;

    return {
      type: 'chart',
      url: url,
      description: `Relationship network showing ${sortedRelationships.length} key connections and dependencies within ${topic}`,
      source: 'AI Generated - Mermaid Network Diagram',
    };
  } catch (error) {
    console.error('Relationship diagram generation failed:', error);
    return null;
  }
}
}