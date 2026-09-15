import pandas as pd

df_a1 = pd.read_excel(r"C:\Users\Admin\Desktop\A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx", header=None)
print("A-1 shape:", df_a1.shape)
print("A-1 top 10 rows:")
print(df_a1.iloc[:10, :10])

# Check if Punjab is in A-1
pb_rows = df_a1[df_a1.apply(lambda row: row.astype(str).str.contains('PUNJAB', case=False).any(), axis=1)]
print("\nPunjab rows in A-1:")
print(pb_rows.iloc[:5, :10])
