import pandas  as pd
url="https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv"
df=pd.read_csv(url)
print("first five rows of the dataset:")
print(df.head())
print("\n Dataset Information:")
print(df.info())
print("\n Number of rows and columns:")
print(df.shape)