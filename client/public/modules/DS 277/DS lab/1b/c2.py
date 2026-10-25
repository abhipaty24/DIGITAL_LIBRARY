import pandas as pd
df = pd.read_json("2a/students_data.json", lines=True)   
print("Student data")
print(df)
