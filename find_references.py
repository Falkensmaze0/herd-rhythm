"""
find_references.py

A recursive project codebase search utility for locating any references to target terms (file/directory/word/identifier).

Usage:
    python3 find_references.py term1 term2 ... [--ext .ts .tsx .js .jsx .json .md] [--exclude node_modules .git build dist]

Defaults:
    - If run with no terms, will prompt.
    - Searches common source code file extensions by default.
    - Excludes common junk/build/.git dirs by default (override with --exclude).

Outputs:
    Prints: file:line_no: matching line

Example:
    python3 find_references.py dashboard cows --ext .ts .tsx

Author: [Your Name]
"""

import os
import sys

DEFAULT_EXCLUDE_DIRS = {'node_modules', '.git', '.next', '.vercel', 'dist', 'build', '__pycache__'}
DEFAULT_EXTENSIONS = {'.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.mjs'}

def parse_args():
    terms = []
    extensions = set(DEFAULT_EXTENSIONS)
    excludes = set(DEFAULT_EXCLUDE_DIRS)
    args = iter(sys.argv[1:])
    for arg in args:
        if arg == '--ext':
            extensions = set()
            while True:
                try:
                    ext = next(args)
                    if ext.startswith('--'):
                        break
                    extensions.add(ext)
                except StopIteration:
                    break
        elif arg == '--exclude':
            excludes = set()
            while True:
                try:
                    ex = next(args)
                    if ex.startswith('--'):
                        break
                    excludes.add(ex)
                except StopIteration:
                    break
        else:
            terms.append(arg)
    return terms, extensions, excludes

def should_skip(path, excludes):
    return any(excluded in path for excluded in excludes)

def scan_file(path, terms):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for lineno, line in enumerate(f, 1):
                for term in terms:
                    if term in line:
                        print(f"{path}:{lineno}: {line.strip()}")
    except Exception as e:
        # Ignore unreadable/binary files
        pass

def walk_and_scan(root, terms, extensions, excludes):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not should_skip(os.path.join(dirpath, d), excludes)]
        for f in filenames:
            path = os.path.join(dirpath, f)
            if not should_skip(path, excludes) and os.path.splitext(f)[1] in extensions:
                scan_file(path, terms)

if __name__ == "__main__":
    terms, extensions, excludes = parse_args()
    if not terms:
        print("Usage: python3 find_references.py term1 term2 ... [--ext .ts .js ...] [--exclude node_modules .git ...]")
        sys.exit(1)
    print(f"Searching for terms: {terms}")
    print(f"Extensions: {extensions}")
    print(f"Excluding directories: {excludes}")
    walk_and_scan('.', terms, extensions, excludes)
    