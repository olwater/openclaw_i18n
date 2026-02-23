import os
import sys

def resolve_file(filepath):
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False
        
    out = []
    i = 0
    changed = False
    resolved_count = 0
    manual_count = 0
    
    while i < len(lines):
        if lines[i].startswith('<<<<<<< HEAD'):
            changed = True
            head_block = []
            origin_block = []
            
            i += 1
            # read head
            while i < len(lines) and not lines[i].startswith('======='):
                head_block.append(lines[i])
                i += 1
            
            if i < len(lines):
                i += 1 # skip =======
                
            # read origin
            while i < len(lines) and not lines[i].startswith('>>>>>>>'):
                origin_block.append(lines[i])
                i += 1
                
            if i < len(lines):
                i += 1 # skip >>>>>>>
                
            # Logic: If head block ONLY contains import { t } stuff, we can just merge them.
            # Let's see if head block contains ONLY import and empty lines.
            is_head_only_t_import = True
            for line in head_block:
                l = line.strip()
                if l and not l.startswith('import { t }') and not l.startswith('import {t}'):
                    is_head_only_t_import = False
                    
            if is_head_only_t_import:
                # Safe to combine: first HEAD then ORIGIN
                out.extend(head_block)
                out.extend(origin_block)
                resolved_count += 1
            else:
                # Not safe to auto-resolve
                out.append('<<<<<<< HEAD\n')
                out.extend(head_block)
                out.append('=======\n')
                out.extend(origin_block)
                out.append('>>>>>>> origin/main\n')
                manual_count += 1
        else:
            out.append(lines[i])
            i += 1
            
    if changed and resolved_count > 0:
        with open(filepath, 'w') as f:
            f.writelines(out)
        print(f"Resolved {resolved_count} conflicts in {filepath}. Remaining: {manual_count}")
        return True
    return False

def main():
    if not os.path.exists('.git/conflicted_files.txt'):
        return
    with open('.git/conflicted_files.txt', 'r') as f:
        files = [line.strip() for line in f if line.strip()]
        
    total_resolved = 0
    for file in files:
        if os.path.exists(file):
            if resolve_file(file):
                total_resolved += 1
                
    print(f"Total files fully or partially resolved: {total_resolved}")

if __name__ == '__main__':
    main()
