import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import PDFDocument from 'pdfkit';
import { Report } from '../types/index.js';

export class DocumentService {
  async generateDOCX(report: Report): Promise<Buffer> {
    try {
      const sections = [];

      // Title Page
      sections.push(
        new Paragraph({
          text: report.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        }),
        new Paragraph({
          text: `Generated on ${new Date(report.metadata.generatedDate).toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Research Type: ${report.metadata.researchType}`,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Sources: ${report.metadata.sourceCount} | Words: ${report.metadata.wordCount}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );

      // Abstract
      sections.push(
        new Paragraph({
          text: 'Abstract',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: report.abstract,
          spacing: { after: 400 },
        })
      );

      // Table of Contents
      sections.push(
        new Paragraph({
          text: 'Table of Contents',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      for (const item of report.tableOfContents) {
        sections.push(
          new Paragraph({
            text: item.title,
            spacing: { after: 100 },
            indent: { left: item.level * 400 },
          })
        );
      }

      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );

      // Report Sections
      for (const section of report.sections) {
        sections.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        // Split content into paragraphs
        const paragraphs = section.content.split('\n\n');
        for (const para of paragraphs) {
          if (para.trim()) {
            sections.push(
              new Paragraph({
                text: para.trim(),
                spacing: { after: 200 },
              })
            );
          }
        }

        // Add subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            sections.push(
              new Paragraph({
                text: subsection.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              })
            );

            const subParas = subsection.content.split('\n\n');
            for (const para of subParas) {
              if (para.trim()) {
                sections.push(
                  new Paragraph({
                    text: para.trim(),
                    spacing: { after: 200 },
                  })
                );
              }
            }
          }
        }

        // Add statistics
        if (section.statistics && section.statistics.length > 0) {
          sections.push(
            new Paragraph({
              text: 'Key Statistics:',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );

          for (const stat of section.statistics) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${stat.value}: `, bold: true }),
                  new TextRun({ text: stat.context }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        }
      }

      // References
      sections.push(
        new Paragraph({
          text: 'References',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      for (let i = 0; i < report.references.length; i++) {
        const ref = report.references[i];
        const refText = `[${i + 1}] ${ref.authors.join(', ')} (${ref.year}). ${ref.title}. ${ref.source}.${ref.url ? ` Available at: ${ref.url}` : ''} [Accessed: ${ref.accessDate}]`;
        
        sections.push(
          new Paragraph({
            text: refText,
            spacing: { after: 100 },
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      console.error('DOCX generation error:', error);
      throw new Error('Failed to generate DOCX document');
    }
  }

  async generatePDF(report: Report): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
        });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title Page
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(report.title, { align: 'center' });
        
        doc.moveDown(2);
        
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Generated on ${new Date(report.metadata.generatedDate).toLocaleDateString()}`, { align: 'center' })
          .text(`Research Type: ${report.metadata.researchType}`, { align: 'center' })
          .text(`Sources: ${report.metadata.sourceCount} | Words: ${report.metadata.wordCount}`, { align: 'center' });

        doc.addPage();

        // Abstract
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Abstract');
        
        doc.moveDown();
        
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(report.abstract);

        doc.addPage();

        // Table of Contents
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Table of Contents');
        
        doc.moveDown();

        for (const item of report.tableOfContents) {
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(item.title, { indent: item.level * 20 });
        }

        doc.addPage();

        // Report Sections
        for (const section of report.sections) {
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(section.title);
          
          doc.moveDown();
          
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(section.content);

          doc.moveDown();

          // Add subsections
          if (section.subsections) {
            for (const subsection of section.subsections) {
              doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(subsection.title);
              
              doc.moveDown(0.5);
              
              doc
                .fontSize(11)
                .font('Helvetica')
                .text(subsection.content);

              doc.moveDown();
            }
          }

          // Add statistics
          if (section.statistics && section.statistics.length > 0) {
            doc
              .fontSize(12)
              .font('Helvetica-Bold')
              .text('Key Statistics:');
            
            doc.moveDown(0.5);

            for (const stat of section.statistics) {
              doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(`${stat.value}: `, { continued: true })
                .font('Helvetica')
                .text(stat.context);
            }

            doc.moveDown();
          }
        }

        doc.addPage();

        // References
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('References');
        
        doc.moveDown();

        for (let i = 0; i < report.references.length; i++) {
          const ref = report.references[i];
          const refText = `[${i + 1}] ${ref.authors.join(', ')} (${ref.year}). ${ref.title}. ${ref.source}.${ref.url ? ` ${ref.url}` : ''} [Accessed: ${ref.accessDate}]`;
          
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(refText);
          
          doc.moveDown(0.5);
        }

        doc.end();
      } catch (error) {
        console.error('PDF generation error:', error);
        reject(new Error('Failed to generate PDF document'));
      }
    });
  }
}

export const documentService = new DocumentService();