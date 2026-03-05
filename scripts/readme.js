import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(html, sectionTitle) {
  const regex = new RegExp(`<h2>${sectionTitle}</h2>[\\s\\S]*?</section>`, 'i');
  const match = html.match(regex);
  return match ? match[0] : '';
}

function extractListItems(sectionHtml) {
  const items = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(sectionHtml)) !== null) {
    const text = stripHtml(match[1]);
    if (text) items.push(text);
  }
  return items;
}

function extractExperience(html) {
  const experiences = [];
  const expRegex = /<div class="experience-item">([\s\S]*?)<\/ul>\s*<\/div>/gi;
  let match;

  while ((match = expRegex.exec(html)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<div class="experience-title[^"]*">([^<]+)<\/div>/);
    const companyMatch = block.match(/<div class="experience-company">([^<]+)<\/div>/);
    const dateMatch = block.match(/<div class="experience-date">([^<]+)<\/div>/);

    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const company = companyMatch ? stripHtml(companyMatch[1]) : '';
    const date = dateMatch ? stripHtml(dateMatch[1]) : '';

    const bullets = extractListItems(block);

    if (title) {
      experiences.push({ title, company, date, bullets });
    }
  }

  return experiences;
}

function extractSkills(html) {
  const skillsSection = extractSection(html, 'Skills');
  const skills = {};

  const categoryRegex = /<strong[^>]*>([^<]+):<\/strong>\s*([^<]+)/gi;
  let match;
  while ((match = categoryRegex.exec(skillsSection)) !== null) {
    const category = stripHtml(match[1]);
    const items = stripHtml(match[2]);
    skills[category] = items;
  }

  return skills;
}

function extractKeyAchievements(html) {
  const section = extractSection(html, 'Key Achievements');
  const achievements = [];

  const divRegex = /<div>●\s*([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = divRegex.exec(section)) !== null) {
    achievements.push(stripHtml(match[1]));
  }

  return achievements;
}

function generateReadme() {
  const htmlPath = join(rootDir, 'resume.html');
  const readmePath = join(rootDir, 'README.md');

  console.log('Generating README from HTML...');

  const html = readFileSync(htmlPath, 'utf-8');

  // Extract basic info
  const nameMatch = html.match(/<h1>([^<]+)<\/h1>/);
  const name = nameMatch ? stripHtml(nameMatch[1]) : 'Resume';

  const subtitleMatch = html.match(/<p class="subtitle">([^<]+)<\/p>/);
  const subtitle = subtitleMatch ? stripHtml(subtitleMatch[1]) : '';

  const summaryMatch = html.match(/<p class="summary">([\s\S]*?)<\/p>/);
  const summary = summaryMatch ? stripHtml(summaryMatch[1]) : '';

  // Extract sections
  const achievements = extractKeyAchievements(html);
  const experiences = extractExperience(html);
  const skills = extractSkills(html);

  // Extract other sections
  const educationSection = extractSection(html, 'Education');
  const educationMatch = educationSection.match(/<div class="education-degree">([^<]+)<\/div>[\s\S]*?<div class="education-school">([^<]+)<\/div>/);

  const publicSpeakingSection = extractSection(html, 'Public Speaking');
  const speakingBullets = extractListItems(publicSpeakingSection);

  const performanceSection = extractSection(html, 'Performance Arts');
  const performanceBullets = extractListItems(performanceSection);

  // Build README
  let readme = `# ${name}

<div align="center">
  <img src="germankuber_2.jpg" width="150" alt="${name}"/>

  ### ${subtitle}

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-germankuber-blue?style=flat&logo=linkedin)](https://linkedin.com/in/germankuber)
  [![GitHub](https://img.shields.io/badge/GitHub-GermanKuber-black?style=flat&logo=github)](https://github.com/GermanKuber)
  [![YouTube](https://img.shields.io/badge/YouTube-germankuber-red?style=flat&logo=youtube)](https://youtube.com/@germankuber)
  [![Website](https://img.shields.io/badge/Web-germankuber.com-teal?style=flat&logo=google-chrome)](https://germankuber.com)

  📄 **[View HTML](https://germankuber.github.io/resume/resume.html)** | **[Download PDF](https://github.com/germankuber/resume/raw/main/Germ%C3%A1n%20K%C3%BCber.pdf)**
</div>

---

## About

${summary}

---

## Key Achievements

${achievements.map(a => `- ${a}`).join('\n')}

---

## Work Experience

`;

  // Add experiences
  for (const exp of experiences) {
    readme += `### ${exp.title}\n`;
    readme += `**${exp.company}** | ${exp.date}\n\n`;
    for (const bullet of exp.bullets) {
      readme += `- ${bullet}\n`;
    }
    readme += '\n';
  }

  // Add Skills
  readme += `---

## Skills

`;
  for (const [category, items] of Object.entries(skills)) {
    readme += `**${category}:** ${items}\n\n`;
  }

  // Add Education
  if (educationMatch) {
    readme += `---

## Education

**${stripHtml(educationMatch[1])}** - ${stripHtml(educationMatch[2])}

`;
  }

  // Add Public Speaking
  if (speakingBullets.length > 0) {
    readme += `---

## Public Speaking

`;
    for (const bullet of speakingBullets) {
      readme += `- ${bullet}\n`;
    }
    readme += '\n';
  }

  // Add Performance Arts
  if (performanceBullets.length > 0) {
    readme += `---

## Performance Arts

`;
    for (const bullet of performanceBullets) {
      readme += `- ${bullet}\n`;
    }
    readme += '\n';
  }

  // Add footer
  readme += `---

## Build

\`\`\`bash
npm install
npm run build    # Generate PDF + README
npm run pdf      # Generate PDF only
npm run readme   # Generate README only
\`\`\`

---

*Generated from [resume.html](resume.html)*
`;

  writeFileSync(readmePath, readme);
  console.log(`README generated: ${readmePath}`);
}

generateReadme();
