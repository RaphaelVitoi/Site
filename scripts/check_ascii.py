import sys
import os

def check_ascii(file_path):
    if not os.path.isfile(file_path):
        return True
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            content.decode('ascii')
            return True
    except UnicodeDecodeError:
        return False

if __name__ == "__main__":
    files = sys.argv[1:]
    failed = []
    for f in files:
        if not check_ascii(f):
            failed.append(f)
    
    if failed:
        print("[SOTA] Non-ASCII characters detected in the following files:")
        for f in failed:
            print(f"  - {f}")
        sys.exit(1)
    sys.exit(0)
