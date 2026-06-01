import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export async function generateCertificatePDF(studentName: string, courseTitle: string, certificateId: string, completionDate: string) {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add a blank page (landscape mode)
  const page = pdfDoc.addPage([842, 595]); // A4 Size in points (landscape)
  const { width, height } = page.getSize();

  // Load fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Draw elegant border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.12, 0.16, 0.32), // Deep blue border
    borderWidth: 6,
  });

  // Inner border
  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: rgb(0.74, 0.6, 0.23), // Gold inner border
    borderWidth: 1.5,
  });

  // 2. Decorative gold corner elements
  const drawCorner = (cx: number, cy: number) => {
    page.drawSquare({ x: cx - 10, y: cy - 10, size: 20, color: rgb(0.74, 0.6, 0.23) });
  };
  drawCorner(35, 35);
  drawCorner(width - 35, 35);
  drawCorner(35, height - 35);
  drawCorner(width - 35, height - 35);

  // 3. Header Logo & Text
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBytes = await fs.readFile(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // Scale logo down to fit
    const logoDims = logoImage.scaleToFit(200, 80);

    page.drawImage(logoImage, {
      x: (width - logoDims.width) / 2,
      y: height - 60 - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (error) {
    console.warn("Could not load logo image for PDF:", error);
    // Fallback to text
    const orgName = 'FLYMEDIA TECHNOLOGY';
    const orgNameWidth = timesBoldFont.widthOfTextAtSize(orgName, 18);
    page.drawText(orgName, {
      x: (width - orgNameWidth) / 2,
      y: height - 100,
      size: 18,
      font: timesBoldFont,
      color: rgb(0.12, 0.16, 0.32),
    });
  }

  // Subtitle removed to keep design clean alongside the logo

  // 4. Main Certificate Text
  const mainTitle = 'CERTIFICATE OF COMPLETION';
  const mainTitleWidth = timesBoldFont.widthOfTextAtSize(mainTitle, 36);
  page.drawText(mainTitle, {
    x: (width - mainTitleWidth) / 2,
    y: height - 200,
    size: 36,
    font: timesBoldFont,
    color: rgb(0.12, 0.16, 0.32),
  });

  const presentedTo = 'This certificate is proudly presented to';
  const presentedToWidth = timesRomanFont.widthOfTextAtSize(presentedTo, 14);
  page.drawText(presentedTo, {
    x: (width - presentedToWidth) / 2,
    y: height - 250,
    size: 14,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // 5. Student Name
  const nameText = studentName.toUpperCase();
  const nameWidth = timesBoldFont.widthOfTextAtSize(nameText, 28);
  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height - 300,
    size: 28,
    font: timesBoldFont,
    color: rgb(0.12, 0.16, 0.32),
  });

  // Line under student name
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: height - 310 },
    end: { x: (width + nameWidth) / 2 + 20, y: height - 310 },
    thickness: 1.5,
    color: rgb(0.74, 0.6, 0.23),
  });

  // 6. Course accomplishment text
  const completionText = `for successfully completing all curriculum requirements and practical assignments for the course`;
  const completionTextWidth = timesRomanFont.widthOfTextAtSize(completionText, 14);
  page.drawText(completionText, {
    x: (width - completionTextWidth) / 2,
    y: height - 350,
    size: 14,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Course Title
  const courseText = `"${courseTitle}"`;
  const courseWidth = timesBoldFont.widthOfTextAtSize(courseText, 22);
  page.drawText(courseText, {
    x: (width - courseWidth) / 2,
    y: height - 390,
    size: 22,
    font: timesBoldFont,
    color: rgb(0.12, 0.16, 0.32),
  });

  // 7. Footer: Signatures, Certificate ID, Date
  // Date Block (Left Side)
  page.drawLine({ start: { x: 150, y: 100 }, end: { x: 300, y: 100 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
  page.drawText('Date of Completion', { x: 175, y: 80, size: 10, font: helveticaFont, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(completionDate, { x: 195, y: 110, size: 12, font: timesBoldFont, color: rgb(0.12, 0.16, 0.32) });

  // Signature Block (Right Side)
  page.drawLine({ start: { x: width - 300, y: 100 }, end: { x: width - 150, y: 100 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
  page.drawText('Authorized Signature', { x: width - 265, y: 80, size: 10, font: helveticaFont, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('Flymedia LMS Team', { x: width - 260, y: 110, size: 13, font: timesBoldFont, color: rgb(0.12, 0.16, 0.32) });

  // Certificate ID (Bottom Center)
  const certIdText = `Certificate ID: ${certificateId}`;
  const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, 9);
  page.drawText(certIdText, {
    x: (width - certIdWidth) / 2,
    y: 50,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
