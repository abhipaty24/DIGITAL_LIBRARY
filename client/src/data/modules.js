// Course modules imported from the reference Data Science portal
// (module.html?id=1 … module.html?id=5). Edit freely — every module page reads from here.
export const modules = [
  {
    id: '1',
    title: 'Foundations of Data Science',
    description: 'What data science is, its lifecycle and the tools of the trade.',
    topics: ['Data science lifecycle', 'Types of data', 'Python ecosystem', 'Statistics refresher', 'Ethics and privacy'],
    overview: 'What data science is, its lifecycle and the tools of the trade. This module builds the skills needed for later modules and lab work.',
    objectives: [
      'Explain the key ideas of foundations of data science',
      'Apply the techniques in Python',
      'Interpret results critically',
    ],
    concepts: ['Data science lifecycle', 'Types of data', 'Python ecosystem'],
    applications: ['Business analytics', 'Healthcare data', 'Campus and student data'],
    resources: ['Class notes (replace)', 'Official Python docs'],
    takeaways: ['Good data beats complex models', 'Always validate your results'],
  },
  {
    id: '2',
    title: 'Data Acquisition & Preparation',
    description: 'Collecting, cleaning and shaping raw data for analysis.',
    topics: ['Data sources and APIs', 'Missing values', 'Outliers', 'Encoding', 'Scaling'],
    overview: 'Collecting, cleaning and shaping raw data for analysis. This module builds the skills needed for later modules and lab work.',
    objectives: [
      'Explain the key ideas of data acquisition & preparation',
      'Apply the techniques in Python',
      'Interpret results critically',
    ],
    concepts: ['Data sources and APIs', 'Missing values', 'Outliers'],
    applications: ['Business analytics', 'Healthcare data', 'Campus and student data'],
    resources: ['Class notes (replace)', 'Official Python docs'],
    takeaways: ['Good data beats complex models', 'Always validate your results'],
  },
  {
    id: '3',
    title: 'Exploratory Data Analysis',
    description: 'Summarising and visualising data to uncover patterns.',
    topics: ['Descriptive statistics', 'Distributions', 'Correlation', 'Visual storytelling', 'Hypothesis generation'],
    overview: 'Summarising and visualising data to uncover patterns. This module builds the skills needed for later modules and lab work.',
    objectives: [
      'Explain the key ideas of exploratory data analysis',
      'Apply the techniques in Python',
      'Interpret results critically',
    ],
    concepts: ['Descriptive statistics', 'Distributions', 'Correlation'],
    applications: ['Business analytics', 'Healthcare data', 'Campus and student data'],
    resources: ['Class notes (replace)', 'Official Python docs'],
    takeaways: ['Good data beats complex models', 'Always validate your results'],
  },
  {
    id: '4',
    title: 'Machine Learning Fundamentals',
    description: 'Core supervised and unsupervised learning algorithms.',
    topics: ['Regression', 'Classification', 'Clustering', 'Bias and variance', 'Feature engineering'],
    overview: 'Core supervised and unsupervised learning algorithms. This module builds the skills needed for later modules and lab work.',
    objectives: [
      'Explain the key ideas of machine learning fundamentals',
      'Apply the techniques in Python',
      'Interpret results critically',
    ],
    concepts: ['Regression', 'Classification', 'Clustering'],
    applications: ['Business analytics', 'Healthcare data', 'Campus and student data'],
    resources: ['Class notes (replace)', 'Official Python docs'],
    takeaways: ['Good data beats complex models', 'Always validate your results'],
  },
  {
    id: '5',
    title: 'Model Evaluation & Applications',
    description: 'Measuring model quality and applying it to real problems.',
    topics: ['Train/test split', 'Cross-validation', 'Precision and recall', 'ROC and AUC', 'Deployment basics'],
    overview: 'Measuring model quality and applying it to real problems. This module builds the skills needed for later modules and lab work.',
    objectives: [
      'Explain the key ideas of model evaluation & applications',
      'Apply the techniques in Python',
      'Interpret results critically',
    ],
    concepts: ['Train/test split', 'Cross-validation', 'Precision and recall'],
    applications: ['Business analytics', 'Healthcare data', 'Campus and student data'],
    resources: ['Class notes (replace)', 'Official Python docs'],
    takeaways: ['Good data beats complex models', 'Always validate your results'],
  },
]

export const getModule = (id) => modules.find((module) => module.id === String(id)) || modules[0]

export const modulePdfUrl = (id) => `/assets/modules/module-${getModule(id).id}.pdf`

export const moduleLabel = (id) => `Module 0${getModule(id).id}`

// Which course card opens which module page (courses without a match open Module 01).
export const courseModuleMap = { 'Data Science': '1', 'Machine Learning': '4', 'Others': '5' }

export const moduleForCourse = (course) => courseModuleMap[course] || modules[0].id
