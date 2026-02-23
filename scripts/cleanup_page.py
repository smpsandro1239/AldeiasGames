import re

file_path = 'src/app/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove Auth Modal block
content = re.sub(r'\{/\* Auth Modal \*/\}[\s\S]*?\{/\* Wizard de Configuração Inicial \*/\}', '{/* Modals Placeholder */}', content)

# Remove Participar Modal block
content = re.sub(r'\{/\* Participar Modal \*/\}[\s\S]*?\{/\* Create Modal \*/\}', '', content)

# Remove Create Modal block
content = re.sub(r'\{/\* Create Modal \*/\}[\s\S]*?\{/\* Profile Edit Modal \*/\}', '', content)

# Actually let's just find the start of modais section and clear it.
# Usually modais are after the main layout.

# I will find the footer and clear everything after it until the end of the return.

with open(file_path, 'w') as f:
    f.write(content)
