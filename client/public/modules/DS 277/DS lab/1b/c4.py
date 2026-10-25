import pandas as pd

url = r"C:\Users\vardh\OneDrive\Documents\Desktop\ds\2a\students_data.json"

df = pd.read_json(url, lines=True)

print("First Five Records")
print(df.head())