import os
import subprocess
import sys

# Wrapper to run data/validation/validate_data.py
script_path = os.path.join(os.path.dirname(__file__), "data", "validation", "validate_data.py")
subprocess.run([sys.executable, script_path], check=True)
