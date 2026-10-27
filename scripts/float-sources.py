"""Retained byte identities, reproducible excerpts, line mappings and source checksums.

Pass --online to compare original XML and the project's TIFF checksum sidecars.
The three large TIFFs are not downloaded by this review.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1]
ns={'t':'http://www.tei-c.org/ns/1.0'}
source=root/'public/sources'
before=(root/'src/float-readings.json').read_bytes()
subprocess.run([sys.executable,str(root/'scripts/extract-floating.py')],check=True,capture_output=True)
assert (root/'src/float-readings.json').read_bytes()==before,'Excerpt extraction is not reproducible'
readings=json.loads(before);assert len(readings)==6
mapped=0
for reading in readings:
    assert ''.join(chunk['text'] for chunk in reading['chunks'])==reading['text']
    tree=ET.parse(source/reading['source']).getroot()
    zones={z.get('{http://www.w3.org/XML/1998/namespace}id'):z for z in tree.findall('.//t:zone',ns)}
    for line in reading['lines']:
        z=zones[line['id']]
        assert all(int(z.get(k))==line[k] for k in ['ulx','uly','lrx','lry'])
        mapped+=1
manifest=json.loads((source/'float-sources.json').read_text())
observed=[]
for image in manifest['images']:
    b=(source/image['file']).read_bytes()
    assert len(b)==image['bytes'] and hashlib.sha256(b).hexdigest()==image['sha256']
    if 'metadata' in image:
        text=(source/image['metadata']).read_text()
        assert all(name in text for name in ['Christens-Barry','Easton','Knox'])
    if '--online' in sys.argv and 'checksumSource' in image:
        actual=urllib.request.urlopen(image['checksumSource'],timeout=30).read().decode().split()[0]
        assert actual==image['sourceMd5'];observed.append(dict(url=image['checksumSource'],md5=actual))
if '--online' in sys.argv:
    for folder,folio in [('017v-016r','Arch07v'),('028r-021v','Arch08r'),('028v-021r','Arch08v')]:
        url=f'https://archimedespalimpsest.net/Data/{folder}/{folder}_{folio}_TEI_Netz-Wilson.xml'
        raw=urllib.request.urlopen(url,timeout=30).read()
        assert raw==(source/f'float-{folio}.xml').read_bytes()
        observed.append(dict(url=url,sha256=hashlib.sha256(raw).hexdigest()))
print(json.dumps(dict(checkedAt=datetime.now(timezone.utc).isoformat(),readings=len(readings),mappedLines=mapped,
    manuscriptFrames=3,printedLatinPages=4,online='--online' in sys.argv,originals=observed,
    scope='Retained byte identities, exact expanded excerpts and flags, original line coordinates. Not independent philological review.'),indent=2))
