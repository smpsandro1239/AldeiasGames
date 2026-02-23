import re

file_path = 'src/app/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Pattern for Participar Modal
start_marker = "{/* Participar Modal */}"
end_marker = "{/* Create Modal */}"

parts = content.split(start_marker)
if len(parts) > 1:
    modal_content = parts[1].split(end_marker)[0]
    with open('src/components/modals/ParticiparModal.tsx', 'w') as f:
        f.write("import React from 'react';\n" + modal_content)
    print("ParticiparModal extracted.")
else:
    print("ParticiparModal not found.")
