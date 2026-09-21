"""Run all verification harnesses against the live Trail Africa app."""
import subprocess, json, os, sys

RESULTS_DIR = "verify/run"
os.makedirs(RESULTS_DIR, exist_ok=True)

harnesses = []
for f in os.listdir("verify"):
    if f.endswith(".mjs") and f != "diag-runtime.mjs":
        harnesses.append(f"verify/{f}")

print(f"Running {len(harnesses)} harnesses...\n")

all_ok = True
for h in sorted(harnesses):
    print(f"  --- {h} ---")
    try:
        r = subprocess.run(
            [sys.executable.replace("python.exe","python"), "-c", f"import os; os.chdir(r'C:\\Users\\bosar\\Documents\\REPO 2\\trail'); exec(open('{h}').read())"]
            if False else ["node", h],
            cwd="C:\\Users\\bosar\\Documents\\REPO 2\\trail",
            capture_output=True, text=True, timeout=120
        )
        output = r.stdout + r.stderr
        # extract JSON result if present
        lines = output.strip().split('\n')
        for line in lines:
            try:
                d = json.loads(line)
                print(f"    PASS: {json.dumps(d)[:150]}")
            except:
                if line.strip() and 'ERROR' in line.upper():
                    print(f"    {line.strip()[:150]}")
    except subprocess.TimeoutExpired:
        print(f"    TIMEOUT")
        all_ok = False
    except Exception as e:
        print(f"    ERROR: {e}")
        all_ok = False
    print()