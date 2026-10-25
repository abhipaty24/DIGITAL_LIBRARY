import pandas as pd
student_data = {
    "Name": ["Alice", "Bob", "Charlie"],
    "Age": [20, 22, 21],
    "Grade": [85, 90, 78]
}
df = pd.DataFrame(student_data)
df.to_json("students_data.json", orient="records", lines=True)
print("json file created successfully.")