import re

with open('src/frontend/src/App.tsx', 'r') as f:
    content = f.read()
    lines = content.split('\n')

# Extract line ranges (1-based line numbers to 0-based indices)
def extract(start, end):
    return '\n'.join(lines[start-1:end])

# types.ts
types_content = """export """ + extract(46, 203).strip()
# Fix - add proper exports
types_content = extract(46, 203)

print(f"Total lines: {len(lines)}")
print(f"Line 46: {lines[45]!r}")
print(f"Line 203: {lines[202]!r}")
