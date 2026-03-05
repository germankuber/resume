import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function build() {
  console.log('Building resume...');

  // Load resume data
  const resumePath = join(rootDir, 'resume.json');
  const resume = JSON.parse(readFileSync(resumePath, 'utf-8'));

  // Load and render theme
  const theme = await import('../jsonresume-theme-germankuber/index.js');
  const html = theme.render(resume);

  // Write output
  const outputPath = join(rootDir, 'index.html');
  writeFileSync(outputPath, html);

  console.log(`HTML generated: ${outputPath}`);
}

build().catch(console.error);
