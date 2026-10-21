import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ARTIFACT_DIR = os.path.join(ROOT_DIR, '.aistudio', 'artifacts', 'brain', 'bf17a8ae-765c-4dfb-b5ba-f726e0dd24fc')
os.makedirs(ARTIFACT_DIR, exist_ok=True)

OUTPUT_ZIP = os.path.join(PUBLIC_DIR, 'doctor-translator-app.zip')
LEGACY_ZIP = os.path.join(PUBLIC_DIR, 'doctor-translator-render.zip')

EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '.aistudio', '__pycache__', 'scripts'}
EXCLUDE_FILES = {
  '.env',
  'doctor-translator-app.zip',
  'doctor-translator-render.zip',
  'bun.lock',
}

files_added = []

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.zip'):
                continue
            
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            
            archive_name = os.path.join('doctor-translator', rel_path)
            zipf.write(full_path, archive_name)
            files_added.append((archive_name, os.path.getsize(full_path)))

# Duplicate to legacy name and artifact dir
shutil.copyfile(OUTPUT_ZIP, LEGACY_ZIP)
shutil.copyfile(OUTPUT_ZIP, os.path.join(ARTIFACT_DIR, 'doctor-translator-app.zip'))

print(f"✓ Created {OUTPUT_ZIP} ({os.path.getsize(OUTPUT_ZIP)} bytes) with {len(files_added)} files:")
for name, sz in files_added:
    print(f"  - {name} ({sz} bytes)")
