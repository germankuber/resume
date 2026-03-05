import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function generatePdf() {
  const htmlPath = join(rootDir, 'index.html');
  const pdfPath = join(rootDir, 'german-kuber-cv.pdf');

  // Check if HTML exists, if not build it first
  if (!existsSync(htmlPath)) {
    console.log('HTML not found, building first...');
    const resumePath = join(rootDir, 'resume.json');
    const resume = JSON.parse(readFileSync(resumePath, 'utf-8'));
    const theme = await import('../jsonresume-theme-germankuber/index.js');
    const html = theme.render(resume);
    writeFileSync(htmlPath, html);
    console.log('HTML generated.');
  }

  console.log('Generating PDF...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Load the HTML file
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '8mm',
      right: '8mm',
      bottom: '8mm',
      left: '8mm'
    }
  });

  await browser.close();

  console.log(`PDF generated: ${pdfPath}`);
}

generatePdf().catch(console.error);
