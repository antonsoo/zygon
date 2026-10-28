"""Reproduce every retained source JPEG from identified original PDF bytes.

python3 scripts/parabola-sources.py METHOD_EXCERPT.pdf HEIBERG_1881.pdf
No image is cropped, reconstructed, or cleaned. Captions distinguish editions.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'src/parabola-sources.json').read_text())
paths=dict(zip(['method','quadrature'],map(Path,sys.argv[1:])))
assert len(paths)==2,'Supply both original PDFs'
sha=lambda b:hashlib.sha256(b).hexdigest()
for source in manifest['sources']:
    b=paths[source['id']].read_bytes()
    assert len(b)==source['bytes'] and sha(b)==source['sha256'],source['id']
with tempfile.TemporaryDirectory() as tmp:
    for page in manifest['pages']:
        out=Path(tmp)/'page'
        method=page['source']=='method'
        subprocess.run(['pdftoppm','-f',str(page['pdfPage']),'-singlefile','-scale-to','2600' if method else '2000','-jpeg','-jpegopt','quality=88' if method else 'quality=85',str(paths[page['source']]),str(out)],check=True)
        actual=out.with_suffix('.jpg').read_bytes()
        assert actual==(root/'public/sources'/page['file']).read_bytes(),page['file']
        assert len(actual)==page['bytes'] and sha(actual)==page['sha256']
print(json.dumps({'originalPdfs':2,'reproducedWholePages':len(manifest['pages']),
                  'imageBytes':sum(p['bytes'] for p in manifest['pages']),
                  'method':'Identified original PDFs; Poppler pdftoppm; no crop or retouch',
                  'boundary':'Byte reproduction does not certify translations or manuscript decipherment.'},indent=2))
