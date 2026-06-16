import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentState, Report, ReportSection, Reference } from '../types/index.js';

export class ReportAgent {
  private model: ChatGroq;

  constructor() {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateReport(state: AgentState): Promise<Partial<AgentState>> {
    const { 
      query, 
      summary, 
      extractedData, 
      rawResearchData,
      images,
      diagrams 
    } = state;

    if (!summary || !extractedData) {
      throw new Error('Summary or extracted data not found');
    }

    console.log('Report Agent: Generating final report...');

    const title = await this.generateTitle(query.topic, query.researchType);
    const abstract = summary.executiveSummary;
    const sections = await this.generateSections(
      query,
      summary,
      extractedData,
      images,
      diagrams
    );
    const references = this.generateReferences(rawResearchData || []);
    const tableOfContents = this.generateTableOfContents(sections);

    const report: Report = {
      title,
      abstract,
      tableOfContents,
      sections,
      references,
      metadata: {
        generatedDate: new Date(),
        researchType: query.researchType,
        sourceCount: rawResearchData?.length || 0,
        wordCount: this.calculateWordCount(sections),
      },
    };

    console.log('Report Agent: Report generated successfully');
    console.log(`  Title: ${title}`);
    console.log(`  Sections: ${sections.length}`);
    console.log(`  References: ${references.length}`);
    console.log(`  Word count: ${report.metadata.wordCount}`);

    return {
      finalReport: report,
      status: 'completed',
      progress: 100,
      updatedAt: new Date(),
    };
  }

  private async generateTitle(topic: string, type: string): Promise<string> {
    const systemPrompt = `You are a professional research title writer. Create clear, informative, publication-quality titles.

Guidelines:
- Length: 10-16 words optimal
- Use Title Case capitalization
- Include specific scope when possible (time period, geography, methodology)
- Use colons for two-part titles: "Main Topic: Specific Focus"
- Be precise and descriptive, avoid vague terms
- Front-load important keywords

Title Format Examples:
- Academic: "Machine Learning in Healthcare: A Systematic Review of Diagnostic Applications"
- Market: "Global EV Market Analysis: Growth Drivers and Competitive Landscape, 2024"
- Technical: "GraphQL Performance Benchmarking: Comparative Analysis with REST APIs"
- General: "Artificial Intelligence in Education: Current Applications and Future Directions"`;

    const userPrompt = `Generate a professional title for this research:

Topic: ${topic}
Research Type: ${type}
Audience: Domain professionals and decision-makers

Requirements:
- Clear and specific
- Professional tone
- Approximately 12-15 words
- Title Case capitalization

Output ONLY the title, no quotes or explanations.`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);

      const title = response.content.toString()
        .replace(/['"]/g, '')
        .trim();

      // Validate title isn't empty or too short
      if (title.length < 10) {
        throw new Error('Generated title too short');
      }

      return title;
    } catch (error) {
      console.error('Title generation failed, using fallback:', error);
      // Fallback title
      const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
      return `${typeCapitalized} Research Report: ${topic}`;
    }
  }

  private async generateSections(
    query: any,
    summary: any,
    extractedData: any,
    images?: any[],
    diagrams?: any[]
  ): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    // 1. Introduction
    console.log('Generating Introduction section...');
    sections.push({
      title: '1. Introduction',
      content: await this.generateIntroduction(query.topic, query.researchType),
      subsections: [
        {
          title: '1.1 Background',
          content: await this.generateBackground(query.topic, extractedData.concepts || []),
        },
        {
          title: '1.2 Research Objectives',
          content: this.generateObjectives(query.topic),
        },
      ],
    });

    // 2. Methodology
    console.log('Generating Methodology section...');
    sections.push({
      title: '2. Methodology',
      content: this.generateMethodology(query),
    });

    // 3. Findings and Analysis
    console.log('Generating Findings section...');
    const findingsSection: ReportSection = {
      title: '3. Findings and Analysis',
      content: 'This section presents the key findings from the research.',
      subsections: [],
      statistics: extractedData.statistics || [],
    };

    const categorizedFindings = this.categorizeFindings(extractedData.keyFindings || []);
    
    let subsectionIndex = 1;
    for (const [category, findings] of Object.entries(categorizedFindings)) {
      findingsSection.subsections?.push({
        title: `3.${subsectionIndex} ${category}`,
        content: this.generateFindingContent(findings as any[], extractedData.quotes || []),
      });
      subsectionIndex++;
    }

    sections.push(findingsSection);

    // 4. Discussion
    console.log('Generating Discussion section...');
    sections.push({
      title: '4. Discussion',
      content: await this.generateDiscussion(
        summary.mainFindings || [],
        extractedData.relationships || []
      ),
      diagrams: diagrams?.slice(0, 3),
    });

    // 5. Conclusions
    console.log('Generating Conclusions section...');
    sections.push({
      title: '5. Conclusions',
      content: Array.isArray(summary.conclusions) 
        ? summary.conclusions.join('\n\n')
        : 'The research provides valuable insights into the topic under investigation.',
      subsections: summary.recommendations && summary.recommendations.length > 0 ? [
        {
          title: '5.1 Recommendations',
          content: summary.recommendations.join('\n\n'),
        },
      ] : undefined,
    });

    // Distribute images across sections
    if (images && images.length > 0) {
      this.distributeImages(sections, images);
    }

    return sections;
  }

  private async generateIntroduction(topic: string, type: string): Promise<string> {
    const prompt = `Write a comprehensive introduction for a ${type} research report on: "${topic}"

The introduction should:
- Be 2-3 paragraphs (250-350 words)
- Establish context and significance
- Preview the report's scope
- Engage the reader

Write the introduction:`;

    try {
      const response = await this.model.invoke([
        new SystemMessage('You are an expert research writer. Write clear, professional prose.'),
        new HumanMessage(prompt),
      ]);

      return response.content.toString();
    } catch (error) {
      console.error('Introduction generation failed:', error);
      return `This report provides a comprehensive analysis of ${topic}. The research examines key aspects, current trends, and future implications of this important topic. Through systematic investigation and synthesis of available evidence, this study offers valuable insights for stakeholders and decision-makers in the field.`;
    }
  }

  private async generateBackground(topic: string, concepts: any[]): Promise<string> {
    const validConcepts = Array.isArray(concepts) ? concepts : [];
    
    if (validConcepts.length === 0) {
      return `This section provides foundational context for understanding ${topic}. The background encompasses key theoretical frameworks, historical development, and current state of knowledge in this domain.`;
    }

    const conceptText = validConcepts
      .slice(0, 5)
      .map(c => `**${c.name}**: ${c.definition}`)
      .join('\n\n');

    const prompt = `Write a background section for a research report on: "${topic}"

Key concepts to incorporate:
${conceptText}

Requirements:
- 2-3 paragraphs (200-300 words)
- Integrate the concepts naturally
- Provide context and foundational understanding
- Academic but accessible tone

Write the background section:`;

    try {
      const response = await this.model.invoke([
        new SystemMessage('You are an expert research writer. Write clear, professional prose.'),
        new HumanMessage(prompt),
      ]);

      return response.content.toString();
    } catch (error) {
      console.error('Background generation failed:', error);
      return `Background information on ${topic}.\n\n${conceptText}`;
    }
  }

  private generateObjectives(topic: string): string {
    return `The primary objectives of this research are to:

1. Provide a comprehensive overview of ${topic}
2. Analyze current trends and developments in the field
3. Identify key challenges, opportunities, and best practices
4. Examine relevant case studies and real-world examples
5. Offer evidence-based insights and recommendations for stakeholders

These objectives guide the research methodology and inform the analysis presented in subsequent sections.`;
  }

  private generateMethodology(query: any): string {
    const maxSources = query.requirements?.maxSources || 20;
    
    return `This research employed a comprehensive ${query.researchType} research methodology with a ${query.depth} level of analysis. The research process included the following key components:

**1. Data Collection**
Systematic gathering of information from up to ${maxSources} diverse and credible sources, including:
- Academic journals and peer-reviewed publications
- Industry reports and market analyses
- Authoritative websites and official documentation
- Expert perspectives and case studies

**2. Source Evaluation**
Each source underwent rigorous evaluation using a dual-dimension assessment framework:
- **Credibility scoring**: Evaluation of source authority, author credentials, editorial standards, and factual accuracy
- **Relevance scoring**: Assessment of topical alignment, information density, and research applicability

Sources meeting minimum quality thresholds (credibility ≥ 0.50, relevance ≥ 0.50) were selected for detailed analysis.

**3. Data Extraction and Analysis**
Structured extraction of key information elements:
- Primary findings and insights
- Statistical data and quantitative metrics
- Expert quotes and authoritative statements
- Core concepts and theoretical frameworks
- Relationships and patterns across sources

**4. Synthesis and Integration**
Information from multiple sources was synthesized to:
- Identify consensus and contradictions
- Map relationships between concepts
- Extract overarching themes and patterns
- Generate comprehensive insights

${query.requirements?.includeDiagrams ? '**5. Visual Analysis**\nRelevant diagrams, charts, and infographics were identified and incorporated to enhance understanding and illustrate key concepts.\n\n' : ''}${query.requirements?.includeStatistics ? '**6. Statistical Analysis**\nQuantitative data was analyzed to identify trends, correlations, and supporting evidence for key findings.\n\n' : ''}**Quality Assurance**
The research methodology employed AI-powered research agents with built-in quality control mechanisms, ensuring:
- Comprehensive topic coverage
- Objective analysis and balanced perspectives
- Credible source attribution
- Transparent limitations and uncertainties

This systematic approach ensures the reliability and depth of the research findings presented in this report.`;
  }

  private categorizeFindings(findings: any[]): Record<string, any[]> {
    const categorized: Record<string, any[]> = {};

    if (!Array.isArray(findings) || findings.length === 0) {
      categorized['Key Insights'] = [];
      return categorized;
    }

    for (const finding of findings) {
      const category = finding.category || 'General Findings';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(finding);
    }

    return categorized;
  }

  private generateFindingContent(findings: any[], quotes: any[]): string {
    if (!Array.isArray(findings) || findings.length === 0) {
      return 'No specific findings were identified in this category.';
    }

    const sortedFindings = findings.sort((a, b) => (b.importance || 0) - (a.importance || 0));

    let content = '';

    for (const finding of sortedFindings) {
      content += `**Finding**: ${finding.text}\n\n`;
      
      // Add relevant quotes if available
      if (Array.isArray(quotes) && quotes.length > 0) {
        const relevantQuotes = quotes.filter(q => 
          Array.isArray(finding.sources) && 
          finding.sources.some((s: string) => q.source && q.source.includes(s))
        );

        if (relevantQuotes.length > 0 && relevantQuotes[0].text && relevantQuotes[0].author) {
          content += `> "${relevantQuotes[0].text}" — ${relevantQuotes[0].author}\n\n`;
        }
      }

      // Add source attribution
      if (Array.isArray(finding.sources) && finding.sources.length > 0) {
        content += `*Sources: ${finding.sources.join(', ')}*\n\n`;
      }

      content += '---\n\n';
    }

    return content;
  }

  private async generateDiscussion(mainFindings: string[], relationships: any[]): Promise<string> {
    if (!Array.isArray(mainFindings) || mainFindings.length === 0) {
      return 'The research findings reveal important patterns and insights that contribute to our understanding of the topic. Further analysis of the evidence suggests multiple interconnected themes that warrant careful consideration.';
    }

    const findingsText = mainFindings.slice(0, 10).join('\n- ');
    const relationshipsText = Array.isArray(relationships) && relationships.length > 0
      ? relationships
          .slice(0, 5)
          .map(r => `${r.from} ${r.type} ${r.to}: ${r.description}`)
          .join('\n- ')
      : 'Various interconnected elements were identified';

    const prompt = `Write a discussion section that analyzes and interprets these research findings:

Main Findings:
- ${findingsText}

Key Relationships:
- ${relationshipsText}

Requirements:
- 3-4 well-developed paragraphs (400-500 words)
- Synthesize findings into coherent themes
- Discuss implications and significance
- Note patterns, contradictions, or gaps
- Professional, analytical tone

Write the discussion:`;

    try {
      const response = await this.model.invoke([
        new SystemMessage('You are an expert research analyst. Write insightful, nuanced analysis.'),
        new HumanMessage(prompt),
      ]);

      return response.content.toString();
    } catch (error) {
      console.error('Discussion generation failed:', error);
      return `The research findings reveal several important insights:\n\n${findingsText}\n\nThese findings demonstrate the complexity and multifaceted nature of the topic under investigation. The evidence suggests that multiple factors interact to shape outcomes in this domain. Further research would benefit from exploring these relationships in greater depth.`;
    }
  }

  private generateReferences(rawData: any[]): Reference[] {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }

    return rawData
      .filter(data => data && (data.credibilityScore || 0) > 0.5)
      .map((data) => ({
        authors: data.author ? [data.author] : ['Unknown'],
        title: data.title || 'Untitled',
        source: data.source || 'Unknown Source',
        year: data.publishDate 
          ? new Date(data.publishDate).getFullYear().toString() 
          : new Date().getFullYear().toString(),
        url: data.url || '#',
        accessDate: new Date().toISOString().split('T')[0],
        
        // UPDATE THIS LINE: Force TypeScript to accept the specific literal type
        type: this.determineSourceType(data.url || '') as "article" | "book" | "website" | "journal" | "other",
      }))
      .sort((a, b) => a.authors[0].localeCompare(b.authors[0]));
  }

  private determineSourceType(url: string): string {
    if (!url) return 'website';
    if (url.includes('arxiv.org') || url.includes('.edu') || url.includes('doi.org')) return 'journal';
    if (url.includes('books.google')) return 'book';
    if (url.includes('news') || url.includes('article')) return 'article';
    if (url.startsWith('#ai-research')) return 'research';
    return 'website';
  }

  private generateTableOfContents(sections: ReportSection[]): any[] {
    const toc: any[] = [];

    for (const section of sections) {
      toc.push({
        title: section.title,
        level: 1,
      });

      if (section.subsections && Array.isArray(section.subsections)) {
        for (const subsection of section.subsections) {
          toc.push({
            title: subsection.title,
            level: 2,
          });
        }
      }
    }

    return toc;
  }

  private calculateWordCount(sections: ReportSection[]): number {
    let count = 0;

    const countWords = (text: string) => {
      if (!text || typeof text !== 'string') return 0;
      return text.split(/\s+/).filter(word => word.length > 0).length;
    };

    for (const section of sections) {
      count += countWords(section.content);

      if (section.subsections && Array.isArray(section.subsections)) {
        for (const subsection of section.subsections) {
          count += countWords(subsection.content);
        }
      }
    }

    return count;
  }

  private distributeImages(sections: ReportSection[], images: any[]): void {
    if (!Array.isArray(images) || images.length === 0) return;
    
    const imagesPerSection = Math.ceil(images.length / sections.length);
    
    sections.forEach((section, index) => {
      const startIdx = index * imagesPerSection;
      const endIdx = startIdx + imagesPerSection;
      section.images = images.slice(startIdx, endIdx);
    });
  }
}