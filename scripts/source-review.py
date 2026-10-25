"""Validate retained source identities and the exact mapped Greek extraction.

--online checks small source files and original TIFF checksum sidecars. It does
not download 1.6 GB of TIFFs. prepare-images.py separately checks the originals.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

root=Path(__file__).resolve().parents[1]
ns={'t':'http://www.tei-c.org/ns/1.0'}
online='--online' in sys.argv
sources=root/'public/sources'
assets=json.loads((root/'src/assets.json').read_text())
for name,sha in assets.items():
    assert hashlib.sha256((root/'public'/name).read_bytes()).hexdigest()==sha,name
before=(root/'src/readings.json').read_bytes()
subprocess.run([sys.executable,str(root/'scripts/extract-readings.py')],check=True,stdout=subprocess.DEVNULL)
assert (root/'src/readings.json').read_bytes()==before,'Regenerated excerpts differ'
readings=json.loads(before)
assert len(readings)==10
assert 'διπλασία' in readings[1]['text'] and 'τετραπλασίων' in readings[8]['text']
zones=0
for reading in readings:
    assert ''.join(c['text'] for c in reading['chunks'])==reading['text']
    source=ET.parse(sources/reading['source']).getroot()
    by_id={z.get('{http://www.w3.org/XML/1998/namespace}id'):z for z in source.findall('.//t:zone',ns)}
    line_ids={e.get('facs','').lstrip('#') for e in source.findall('.//t:lb',ns)}
    for line in reading['lines']:
        assert line['id'] in line_ids
        z=by_id[line['id']]
        for k in ['ulx','uly','lrx','lry']: assert int(z.get(k))==line[k]
        assert 0<=line['ulx']<line['lrx']<=8160
        assert 0<=line['uly']<line['lry']<=10880
        zones+=1
images=json.loads((sources/'images.json').read_text())['images']
assert len(images)==6
observations=[]
for image in images:
    assert hashlib.sha256((sources/image['file']).read_bytes()).hexdigest()==image['sha256']
    metadata=(sources/image['metadata']).read_text()
    creator_lines=[line for line in metadata.splitlines() if line.startswith('Creator ')]
    for first,last in [('Bill','Christens-Barry'),('Roger','Easton'),('Keith','Knox')]:
        assert any(first in line and last in line for line in creator_lines)
    if online:
        checksum=urllib.request.urlopen(image['checksumSource'],timeout=30).read().decode().split()[0]
        assert checksum==image['sourceProjectMd5']
        observations.append({'url':image['checksumSource'],'md5':checksum})
if online:
    for name,folder in [('Method-NW-p5.xml','Supplemental/ArchimedesTranscriptions/Method/'),('Method-Heiberg-p5.xml','Supplemental/ArchimedesTranscriptions/Method/')]:
        url='https://archimedespalimpsest.net/'+folder+name
        raw=urllib.request.urlopen(url,timeout=30).read()
        assert raw==(sources/name).read_bytes()
        checksum=urllib.request.urlopen(url+'.md5',timeout=30).read().decode().split()[0]
        assert hashlib.md5(raw).hexdigest()==checksum
        observations.append({'url':url,'sha256':hashlib.sha256(raw).hexdigest(),'projectMd5':checksum})
print(json.dumps(dict(checkedAt=datetime.now(timezone.utc).isoformat(),online=online,
                      assetFiles=len(assets),readings=len(readings),mappedLines=zones,fullFrameImages=len(images),
                      sourceObservations=observations,
                      scope='Exact retained bytes, regenerated expanded excerpts and supplied/unclear/abbreviation flags, published line coordinates and source image identities; not certification of a translation or new manuscript decipherment.'),indent=2))
