#!/usr/bin/env python3
# Triggered only on the isolated taxonomy migration branch.
import base64
import hashlib
import io
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHUNKS = [
    'scripts/.taxonomy_payload_00.b64',
    'scripts/.taxonomy_payload_01.b64',
    'scripts/.taxonomy_payload_02.b64',
    'scripts/.taxonomy_payload_03.b64',
    'scripts/.taxonomy_payload_04.b64',
    'scripts/.taxonomy_payload_05.b64',
]
EXPECTED_SHA256 = '0749fd0d442ef59968939a140a27eba9804f8a366a5a400d056d30663cca9768'
ALLOWED_PATHS = {
    'scripts/normalize_tags.py',
    'spaceship-ui/site/content/posts/_template.mdx',
    '.github/workflows/blog-ci.yml',
    'spaceship-ui/src/lib/research.ts',
    'spaceship-ui/src/lib/taxonomy.mjs',
    'spaceship-ui/scripts/taxonomy-contract.mjs',
    'spaceship-ui/src/pages/posts/index.astro',
    'spaceship-ui/src/content.config.ts',
    'spaceship-ui/src/pages/research.astro',
    'spaceship-ui/src/components/WritingListItem.astro',
    'spaceship-ui/site/content/posts/_template.md',
    'spaceship-ui/package.json',
}
PATCH_PATH = ROOT / 'scripts' / '.taxonomy_patch.b64'
PATCH_SHA256 = '89aeafb1dfcad2e92aacb1755122cd37d96fd8bfa8a15f4de4d513ae046b064c'
PATCH_ALLOWED_PATHS = {
    'spaceship-ui/src/lib/research.ts',
    'spaceship-ui/src/pages/posts/index.astro',
}


def extract_payload(payload: bytes, expected_sha: str, allowed_paths: set[str]) -> None:
    digest = hashlib.sha256(payload).hexdigest()
    if digest != expected_sha:
        raise RuntimeError(f'payload checksum mismatch: {digest}')

    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        names = set(archive.namelist())
        if names != allowed_paths:
            raise RuntimeError(f'payload path mismatch: {sorted(names)}')
        for name in sorted(names):
            destination = (ROOT / name).resolve()
            if ROOT.resolve() not in destination.parents:
                raise RuntimeError(f'refusing path outside repository: {name}')
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(name))
            print(f'wrote {name}')


encoded = ''.join((ROOT / path).read_text(encoding='ascii').strip() for path in CHUNKS)
extract_payload(base64.b64decode(encoded), EXPECTED_SHA256, ALLOWED_PATHS)

patch_payload = base64.b64decode(PATCH_PATH.read_text(encoding='ascii').strip())
extract_payload(patch_payload, PATCH_SHA256, PATCH_ALLOWED_PATHS)

(ROOT / 'scripts' / 'normalize_tags.py').chmod(0o755)
subprocess.run(
    [sys.executable, str(ROOT / 'scripts' / 'normalize_tags.py'), '--write'],
    cwd=ROOT,
    check=True,
)
