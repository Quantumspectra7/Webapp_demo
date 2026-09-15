import os
import pandas as pd

files = [
    r"c:\Users\Admin\Desktop\SIH2026\Database\Rdir_2011_03_PUNJAB.xls",
    r"c:\Users\Admin\Desktop\SIH2026\Database\PCA_CDB_0310_F_Census.xls",
    r"C:\Users\Admin\Desktop\A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx"
]

for f in files:
    if os.path.exists(f):
        print("="*60)
        print("File:", os.path.basename(f), "Size:", os.path.getsize(f))
        try:
            xl = pd.ExcelFile(f)
            print("Sheet names:", xl.sheet_names)
            df = xl.parse(xl.sheet_names[0], nrows=10)
            print("Shape of preview:", df.shape)
            print("Columns preview:")
            print(df.columns.tolist()[:15])
            print("First 3 rows:")
            print(df.head(3))
        except Exception as e:
            print("Error reading:", e)
