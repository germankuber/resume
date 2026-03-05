import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function extractText(html, startTag, endTag) {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return '';
  const endIdx = html.indexOf(endTag, startIdx);
  if (endIdx === -1) return '';
  return html.substring(startIdx + startTag.length, endIdx).trim();
}

function extractBetween(html, start, end) {
  const startIdx = html.indexOf(start);
  if (startIdx === -1) return '';
  const searchStart = startIdx + start.length;
  const endIdx = html.indexOf(end, searchStart);
  if (endIdx === -1) return '';
  return html.substring(searchStart, endIdx).trim();
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateReadme() {
  const htmlPath = join(rootDir, 'resume.html');
  const readmePath = join(rootDir, 'README.md');

  console.log('Generating README from HTML...');

  const html = readFileSync(htmlPath, 'utf-8');

  // Extract name
  const name = stripHtml(extractBetween(html, '<h1>', '</h1>'));

  // Extract subtitle
  const subtitle = stripHtml(extractBetween(html, '<p class="subtitle">', '</p>'));

  // Extract summary
  const summary = stripHtml(extractBetween(html, '<p class="summary">', '</p>'));

  // Extract key achievements
  const achievementsSection = extractBetween(html, '<h2>Key Achievements</h2>', '</section>');
  const achievementMatches = achievementsSection.match(/<strong>([^<]+)<\/strong>/g) || [];
  const achievements = achievementMatches.map(a => stripHtml(a)).slice(0, 6);

  const readme = `# ${name} - Resume

<div align="center">
  <img src="germankuber_2.jpg" width="150" alt="${name}"/>

  **${subtitle}**

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-germankuber-blue?style=flat&logo=linkedin)](https://linkedin.com/in/germankuber)
  [![GitHub](https://img.shields.io/badge/GitHub-GermanKuber-black?style=flat&logo=github)](https://github.com/GermanKuber)
  [![YouTube](https://img.shields.io/badge/YouTube-germankuber-red?style=flat&logo=youtube)](https://youtube.com/@germankuber)
  [![Website](https://img.shields.io/badge/Web-germankuber.com-teal?style=flat&logo=google-chrome)](https://germankuber.com)
</div>

---

## About

${summary}

### Key Highlights

${achievements.map(a => `- **${a}**`).join('\n')}

---

## View Resume

### Online Preview
👉 **[View Resume (HTML)](https://germankuber.github.io/resume/resume.html)**

### Download PDF
📄 **[Download PDF](https://github.com/germankuber/resume/raw/main/Germ%C3%A1n%20K%C3%BCber.pdf)**

---

## Tech Stack

- **HTML5 + CSS3** — Modern, responsive design
- **Inter + Geist Mono** — Typography
- **Puppeteer** — PDF generation
- **Node.js** — Build scripts

## Scripts

\`\`\`bash
# Install dependencies
npm install

# Generate PDF only
npm run pdf

# Generate README only
npm run readme

# Generate both PDF and README
npm run build
\`\`\`

---

## License

MIT License - Feel free to use as inspiration for your own resume!
`;

  writeFileSync(readmePath, readme);
  console.log(`README generated: ${readmePath}`);
}

generateReadme();
