// Resources imported from the reference portal (resources.html → resourceDefaults).
// Content only — the reference's search / category / Add / Remove UI is intentionally not included.
export const resources = [
  { title: 'Python Documentation', category: 'Programming', type: 'Website', description: 'Official Python language tutorial and reference.', url: 'https://docs.python.org/3/tutorial/' },
  { title: 'NumPy Quickstart', category: 'Data Science', type: 'Website', description: 'Arrays, vectorized operations, and numerical computing.', url: 'https://numpy.org/doc/stable/user/quickstart.html' },
  { title: 'Pandas Getting Started', category: 'Data Science', type: 'Website', description: 'Learn tabular data analysis with Pandas.', url: 'https://pandas.pydata.org/docs/getting_started/' },
  { title: 'Java Documentation', category: 'Programming', type: 'Website', description: 'Official Java tutorials and API documentation.', url: 'https://dev.java/learn/' },
  { title: 'C++ Reference', category: 'Programming', type: 'Website', description: 'C++ language and standard library reference.', url: 'https://en.cppreference.com/w/' },
  { title: 'C Language Tutorial', category: 'Programming', type: 'Website', description: 'C language learning reference.', url: 'https://www.learn-c.org/' },
  { title: 'Data Science Tutorials', category: 'Video', type: 'YouTube', description: 'Search for introductory Data Science video tutorials.', url: 'https://www.youtube.com/results?search_query=data+science+tutorial+for+beginners' },
]

export const resourceIcon = (type) => (type === 'YouTube' ? '▶' : type === 'PDF' ? '▤' : '↗')
