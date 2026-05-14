import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function exportToDocx(report: string, topic: string) {
  // Parse markdown and convert to DOCX sections
  const lines = report.split('\n');
  const docSections: Paragraph[] = [];

  // Title
  docSections.push(
    new Paragraph({
      text: `Research Report: ${topic}`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      docSections.push(new Paragraph({ text: '' }));
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      docSections.push(
        new Paragraph({
          text: line.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );
    }
    // H2
    else if (line.startsWith('## ')) {
      docSections.push(
        new Paragraph({
          text: line.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        })
      );
    }
    // H3
    else if (line.startsWith('### ')) {
      docSections.push(
        new Paragraph({
          text: line.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        })
      );
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      docSections.push(
        new Paragraph({
          text: line.replace(/^[-*]\s+/, ''),
          bullet: { level: 0 },
          spacing: { after: 100 }
        })
      );
    }
    // Bold text
    else if (line.includes('**')) {
      const parts = line.split('**');
      const children: TextRun[] = [];
      
      parts.forEach((part, index) => {
        if (index % 2 === 0) {
          children.push(new TextRun({ text: part }));
        } else {
          children.push(new TextRun({ text: part, bold: true }));
        }
      });

      docSections.push(
        new Paragraph({
          children,
          spacing: { after: 100 }
        })
      );
    }
    // Horizontal rule
    else if (line === '---') {
      docSections.push(
        new Paragraph({
          text: '',
          spacing: { before: 200, after: 200 }
        })
      );
    }
    // Regular paragraph
    else {
      docSections.push(
        new Paragraph({
          text: line,
          spacing: { after: 100 }
        })
      );
    }
  }

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: docSections
    }]
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `research-report-${Date.now()}.docx`;
  saveAs(blob, filename);
}