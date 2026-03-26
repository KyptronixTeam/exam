const MCQ_CATEGORIES = [
  'Full Stack Developer',
  'Python Developer',
  'Backend Developer',
  'Frontend Developer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Data Analyst',
  'Flutter Developer',
  'SEO',
  'SMO',
  'Video Editor',
  'Graphic Designer',
  'Content Creator'
];

const CATEGORY_ALIASES = {
  'full stack developer': 'Full Stack Developer',
  'full-stack developer': 'Full Stack Developer',
  fullstack: 'Full Stack Developer',
  'fullstack developer': 'Full Stack Developer',
  'fill developer': 'Full Stack Developer',
  fill: 'Full Stack Developer',
  'full developer': 'Full Stack Developer',
  'python developer': 'Python Developer',
  python: 'Python Developer',
  'backend developer': 'Backend Developer',
  backend: 'Backend Developer',
  'frontend developer': 'Frontend Developer',
  frontend: 'Frontend Developer',
  'front-end developer': 'Frontend Developer',
  'front end developer': 'Frontend Developer',
  'ui/ux': 'UI/UX Designer',
  'ui ux': 'UI/UX Designer',
  'ui/ux designer': 'UI/UX Designer',
  'ui ux designer': 'UI/UX Designer',
  'uiux designer': 'UI/UX Designer',
  'ux designer': 'UI/UX Designer',
  'ui designer': 'UI/UX Designer',
  ux: 'UI/UX Designer',
  ui: 'UI/UX Designer',
  'devops engineer': 'DevOps Engineer',
  devops: 'DevOps Engineer',
  'data analyst': 'Data Analyst',
  'data analysis': 'Data Analyst',
  analyst: 'Data Analyst',
  'data analyt': 'Data Analyst',
  'flutter developer': 'Flutter Developer',
  flutter: 'Flutter Developer',
  'flutter app developer': 'Flutter Developer',
  seo: 'SEO',
  'seo executive': 'SEO',
  'seo specialist': 'SEO',
  smo: 'SMO',
  'social media optimization': 'SMO',
  'social media optimizer': 'SMO',
  'social media executive': 'SMO',
  'video editor': 'Video Editor',
  'video editing': 'Video Editor',
  'graphic designer': 'Graphic Designer',
  'graphic design': 'Graphic Designer',
  'content creator': 'Content Creator',
  'content creation': 'Content Creator',
  creator: 'Content Creator'
};

const normalizeCategory = (category) => {
  if (!category) return category;
  const raw = String(category).trim();
  const canonical = CATEGORY_ALIASES[raw.toLowerCase()];
  return canonical || raw;
};

module.exports = {
  MCQ_CATEGORIES,
  normalizeCategory
};
