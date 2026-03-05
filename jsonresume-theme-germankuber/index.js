import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(dateStr) {
  if (!dateStr) return 'Present';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
});

Handlebars.registerHelper('hasItems', function(arr, options) {
  if (arr && arr.length > 0) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('networkIcon', function(network) {
  const icons = {
    'LinkedIn': 'fab fa-linkedin',
    'Twitter': 'fab fa-x-twitter',
    'GitHub': 'fab fa-github',
    'Skype': 'fab fa-skype',
    'Facebook': 'fab fa-facebook',
    'Instagram': 'fab fa-instagram'
  };
  return icons[network] || 'fas fa-link';
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('or', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
});

Handlebars.registerHelper('getAllKeywords', function(skills) {
  if (!skills || !Array.isArray(skills)) return [];
  const keywords = [];
  skills.forEach(skill => {
    if (skill.keywords && Array.isArray(skill.keywords)) {
      keywords.push(...skill.keywords);
    }
  });
  return keywords;
});

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});

export const render = (resume) => {
  const css = readFileSync(join(__dirname, 'style.css'), 'utf-8');
  const template = readFileSync(join(__dirname, 'resume.hbs'), 'utf-8');

  const compiledTemplate = Handlebars.compile(template);

  return compiledTemplate({
    css,
    resume
  });
};

export default { render };
