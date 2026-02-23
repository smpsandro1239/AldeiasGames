import re
import os

file_path = 'src/app/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

def extract_block(name, open_var):
    # This is a bit risky but let's try to find {open_var && ( ... )}
    # Actually, the file uses <AnimatePresence> {open_var && ( ... )} </AnimatePresence>

    # We look for the start
    start_pattern = r'<AnimatePresence>\s+\{' + open_var
    match = re.search(start_pattern, content)
    if not match:
        print(f"Start not found for {name}")
        return None

    start_idx = match.start()

    # Find matching closing AnimatePresence
    # We count opening and closing tags if possible, but let's just look for the next </AnimatePresence>
    end_pattern = r'</AnimatePresence>'
    end_matches = list(re.finditer(end_pattern, content[start_idx:]))
    if not end_matches:
        print(f"End not found for {name}")
        return None

    end_idx = start_idx + end_matches[0].end()

    return content[start_idx:end_idx]

# List of modals to extract
modals = [
    ('AuthModal', 'authModalOpen'),
    ('ParticiparModal', 'participarModalOpen'),
    ('CreateModal', 'createModalOpen'),
    ('WizardModal', 'wizardModalOpen'),
]

# Note: WizardModal was already broken by sed.
# Let's see if I can find ParticiparModal.
participar = extract_block('ParticiparModal', 'participarModalOpen')
if participar:
    with open('src/components/modals/ParticiparModal.tsx', 'w') as f:
        f.write("import React from 'react';\n" + participar)

create = extract_block('CreateModal', 'createModalOpen')
if create:
    with open('src/components/modals/CreateModal.tsx', 'w') as f:
        f.write("import React from 'react';\n" + create)
