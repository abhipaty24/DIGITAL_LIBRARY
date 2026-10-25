const E = [
  ["Introduction to Python for Data Science","Basics of Python syntax, types, I/O, loops, functions and files.","import sys\nsys.setrecursionlimit(10**7)",[
    ["Python Basics","print('Hello DS');a=10;b=20;print(a+b)"],
    ["Data Types and Operators","x=5;y=2;print(x/y,x//y,x%y,x**y)"],
    ["Control Structures","for i in range(5):\n  if i%2==0: print(i)"],
    ["Functions","def add(a,b): return a+b\nprint(add(3,4))"],
    ["Lists and Tuples","l=[1,2,3];print(l[0],l[-1]);t=(1,2);print(t)"],
    ["Dictionaries and Sets","d={'a':1};print(d.get('a'));print({1,2,2})"],
    ["File Handling","with open('demo.txt','w') as f: f.write('hi')\nprint('done')"]
  ]],
  ["NumPy for Data Science","Numerical computing with arrays, broadcasting and linear algebra.","import numpy as np",[
    ["Array Creation","print(np.array([1,2,3]));print(np.zeros((2,2)))"],
    ["Indexing and Slicing","a=np.arange(10);print(a[1:5])"],
    ["Broadcasting","print(np.ones((3,3))+np.array([1,2,3]))"],
    ["Vectorized Math","x=np.linspace(0,1,5)\nprint(np.sqrt(x),x**2)"],
    ["Statistics with NumPy","d=np.random.randn(100)\nprint(d.mean(),d.std())"],
    ["Reshaping Arrays","print(np.arange(12).reshape(3,4).T)"],
    ["Linear Algebra","A=np.array([[2,1],[1,3]])\nprint(np.linalg.inv(A))"]
  ]],
  ["Pandas Data Manipulation","Tabular data handling with Pandas.","import pandas as pd",[
    ["Series and DataFrame","df=pd.DataFrame({'a':[1,2],'b':[3,4]})\nprint(df)"],
    ["Selection with loc/iloc","print(df.loc[0,'a'],df.iloc[1])"],
    ["Filtering Rows","print(df[df['a']>1])"],
    ["GroupBy Aggregation","print(df.groupby('a')['b'].sum())"],
    ["Merging DataFrames","print(df.merge(df,on='a'))"],
    ["Pivot Tables","print(df.pivot_table(index='a',values='b'))"],
    ["Time Series Basics","s=pd.Series(range(3),pd.date_range('2026-01-01',periods=3))\nprint(s.resample('2D').sum())"]
  ]],
  ["Data Cleaning","Making raw data trustworthy.","import pandas as pd",[
    ["Handling Missing Values","df=pd.DataFrame({'x':[1,None,3]})\nprint(df.fillna(df.x.mean()))"],
    ["Removing Duplicates","print(df.drop_duplicates())"],
    ["Type Conversion","df['x']=df['x'].astype('float')"],
    ["Outlier Detection","q1,q3=df.x.quantile([.25,.75])\nprint(q3-q1)"],
    ["String Cleaning","s=pd.Series([' Ab ']);print(s.str.strip().str.lower())"],
    ["Categorical Encoding","print(pd.get_dummies(pd.Series(['a','b'])))"],
    ["Feature Scaling","print((df.x-df.x.min())/(df.x.max()-df.x.min()))"]
  ]],
  ["Exploratory Data Analysis","Understanding data before modelling.","import pandas as pd",[
    ["Summary Statistics","print(df.describe())"],
    ["Distribution Analysis","print(df.skew())"],
    ["Correlation Analysis","print(df.corr())"],
    ["Categorical Analysis","print(df['c'].value_counts())"],
    ["Bivariate Analysis","print(df.groupby('c').mean())"],
    ["Outlier Plots","df.boxplot()"],
    ["EDA Report","print(df.info())"]
  ]]
];

function mkSub(eid, i, name, code, imp, en) {
  const L = "ABCDEFG"[i];
  return {
    id: eid.replace(/^0/, "") + L,
    name,
    youtube: "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " Python tutorial"),
    github: "https://github.com/search?q=" + encodeURIComponent(name + " Python"),
    aim: "To learn and implement " + name.toLowerCase() + " as part of " + en + ".",
    problemStatement: "Apply " + name.toLowerCase() + " to a small sample dataset and verify the output.",
    tools: ["Python", "Jupyter Notebook", "NumPy", "Pandas"],
    explanation: name + " is a core technique in " + en.toLowerCase() + ". Start with a tiny example, inspect the result, then scale up.",
    procedure: ["Import required libraries", "Create the dataset", "Inspect the data", "Apply the operation", "Analyze the output", "Validate the result"],
    code: (imp ? imp + "\n" : "") + code,
    input: "A small in-memory sample dataset created in the code.",
    result: "Run the code in Jupyter and paste your output here.",
    analysis: "Compare the output with what you expected and explain any differences.",
    conclusion: "You can now apply " + name.toLowerCase() + " and check that it works."
  };
}

const experiments = E.map((e, k) => {
  const id = "0" + (k + 1);
  return {
    id,
    name: e[0],
    description: e[1],
    youtube: "https://www.youtube.com/results?search_query=" + encodeURIComponent(e[0] + " Python tutorial"),
    github: "https://github.com/search?q=" + encodeURIComponent(e[0] + " Python"),
    overview: e[1] + " This experiment has seven guided parts, 'A' to 'G'.",
    aim: "To perform " + e[0].toLowerCase() + " on sample data.",
    problemStatement: "Use real-style data to practise " + e[0].toLowerCase() + ".",
    dataset: "Small sample datasets (replace with your own CSV).",
    methodology: ["Load data", "Apply the technique", "Inspect results", "Document findings"],
    analysis: "Interpret outputs from each sub-experiment.",
    results: "Add your final observations here.",
    architecture: ["Dataset", "Data Collection", "Data Cleaning", "Preprocessing", "Feature Engineering", "Analysis / Model", "Results"],
    subExperiments: e[3].map((s, i) => mkSub(id, i, s[0], s[1], e[2], e[0]))
  };
});

const getStoredExperiments = () => {
  try {
    const raw = localStorage.getItem("mbu_exps");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const ALL_EXPERIMENTS = [...experiments, ...getStoredExperiments()];

export const getAllExperiments = () => {
  const stored = getStoredExperiments();
  return [...experiments, ...stored];
};

export const addExperiment = (exp) => {
  const stored = getStoredExperiments();
  stored.push(exp);
  localStorage.setItem("mbu_exps", JSON.stringify(stored));
  return getAllExperiments();
};

export { experiments, mkSub };
export default experiments;
