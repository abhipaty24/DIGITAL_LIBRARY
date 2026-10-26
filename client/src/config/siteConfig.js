// Single place to edit logo, resume, student details and links.
const base = import.meta.env.BASE_URL
export const siteConfig = {
  title: 'Digital Library',
  logoPath: `${base}assets/mbu-logo.svg`,
  resumePath: `${base}assets/resume.pdf`,
  avatarPath: `${base}assets/student-photo.png`,
  homeAvatarPath: `${base}assets/home-student-photo.png`,
  student: {
    name: 'M Abhilash', roll: '24102A030161', section: '3',
    department: 'Data Science', subject: 'Data Science', faculty: 'S Bose Babu',
    technicalSkills: [
      {
        category: 'Programming and Querying',
        skills: 'Python (Pandas, NumPy), SQL (MySQL / PostgreSQL), basic R',
      },
      {
        category: 'Data Analysis and Statistics',
        skills: 'Data cleaning and preprocessing, Exploratory Data Analysis (EDA), descriptive statistics, hypothesis testing, correlation and regression basics',
      },
      {
        category: 'Data Visualization and BI Tools',
        skills: 'Power BI, Tableau, Microsoft Excel (Pivot Tables, VLOOKUP/XLOOKUP, Power Query, dashboards), Matplotlib, Seaborn',
      },
      {
        category: 'Databases',
        skills: 'MySQL, PostgreSQL, joins, subqueries, window functions, indexing basics',
      },
      {
        category: 'Tools and Platforms',
        skills: 'Jupyter Notebook, Google Colab, VS Code, Git and GitHub, Google Sheets',
      },
      {
        category: 'Soft Skills',
        skills: 'Analytical thinking, problem solving, data storytelling, attention to detail',
      },
    ],
    internships: [
      {
        role: 'Full Stack Development Internship',
        organization: 'CodeAlpha (Virtual)',
        period: '10 June 2026 – 10 July 2026',
        studentId: 'CA/DF1/137659',
        description: 'Completed a one-month virtual internship in Full Stack Development. Applied full stack concepts through hands-on tasks and completed the program with a Certificate of Completion and a Letter of Recommendation. The recommendation highlights strong analytical skills, quick learning of new technologies, and good teamwork with fellow interns.',
      },
      {
        role: 'Web Development Internship',
        organization: 'Prodigy InfoTech',
        period: '15 June 2026 – 15 July 2026',
        description: 'Selected for a one-month Web Development Internship involving real-world projects and practical web development skill-building as part of the company’s internship program.',
      },
    ],
    education: [
      {
        degree: 'Bachelor of Technology (B.Tech) in Data Science',
        institution: 'Mohan Babu University, Tirupati',
        period: '2024 – 2028',
        details: ['CGPA: 8.44 / 10 (current)', 'Admitted through AP EAPCET, Rank: 35,960'],
      },
      {
        degree: 'Intermediate (MPC)',
        institution: 'Narayana Junior College, Hyderabad',
        period: 'Year of Passing: 2024',
        details: ['Score: 924 / 1000 (92.4%)'],
      },
      {
        degree: 'Secondary School Certificate (Class X)',
        institution: 'Narayana School, Yemmiganur',
        period: 'Year of Passing: 2022',
        details: ['Score: 557 / 600 (92.83%)'],
      },
    ],
  },
  links: {
    githubUrl: 'https://github.com/abhipaty24',
    githubRepositoriesUrl: 'https://github.com/abhipaty24?tab=repositories',
    linkedinUrl: 'https://www.linkedin.com/in/mallari-abhilash-62a264321?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    emailAddress: 'mallariabhi@gmail.com',
  },
}
