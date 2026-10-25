import pandas as pd
from io import StringIO

json_data = """
{"Name":"Alice","Age":20,"Grade":85}
{"Name":"Bob","Age":22,"Grade":90}
{"Name":"Charlie","Age":21,"Grade":78}
"""

df = pd.read_json(StringIO(json_data), lines=True)

print("Parsed JSON Data")
print(df)