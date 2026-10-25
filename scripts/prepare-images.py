"""Reproduce full-frame study images from the released registered TIFF files.

Pass a directory holding the six original TIFFs (about 1.6 GB). The files must
match the source project's published checksums. Nothing is downloaded here.
"""
import hashlib
import json
from pathlib import Path
import sys
import PIL
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
originals = Path(sys.argv[1])
expected = [
    ('066r-071v', 'Arch17r', 'true_pack8', '0f11e15c9299831a63eef040904d3c0a'),
    ('066r-071v', 'Arch17r', 'pseudo_no-veil', '0d808b07c2a0be4c097a1adf35e5077c'),
    ('066v-071r', 'Arch17v', 'true_pack8', '43798e3c2265086349f922cd443a4380'),
    ('066v-071r', 'Arch17v', 'pseudo_no-veil', 'db33e3dfe6587810859821c01f1e048e'),
    ('065r-072v', 'Arch18r', 'true_pack8', '2cf88f0d4fa42b7b31d0cddcafcdde80'),
    ('065r-072v', 'Arch18r', 'pseudo_no-veil', 'a1afd2c9644ccbae930db8f969fe72fe'),
]
results = []
for folder, folio, product, md5 in expected:
    name = f'{folder}_{folio}_Sinar_{product}.tif'
    source = originals / name
    sha = hashlib.sha256()
    legacy = hashlib.md5()
    with source.open('rb') as stream:
        while block := stream.read(1024*1024):
            sha.update(block)
            legacy.update(block)
    assert legacy.hexdigest() == md5, f'{name}: original does not match the published project checksum'
    image = Image.open(source)
    assert image.size == (8160,10880)
    metadata = str(image.tag_v2[270])
    credit = str(image.tag_v2[315])
    assert 'Christens-Barry' in credit and 'Easton' in credit and 'Knox' in credit
    metadata_name = f'{folio}-{product}-metadata.txt'
    (ROOT/'public/sources'/metadata_name).write_text(metadata+'\n')
    image.thumbnail((2448,3264),Image.Resampling.LANCZOS)
    output = f'{folio}-{product}.jpg'
    dest = ROOT/'public/sources'/output
    image.convert('RGB').save(dest,quality=82,subsampling=2)
    results.append(dict(file=output,source=f'https://archimedespalimpsest.net/Data/{folder}/{name}',
                        sourceSha256=sha.hexdigest(),sourceProjectMd5=md5,
                        checksumSource=f'https://archimedespalimpsest.net/Data/{folder}/{name[:-4]}.md5',
                        sourceBytes=source.stat().st_size,sourceSize=[8160,10880],size=[2448,3264],
                        bytes=dest.stat().st_size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),
                        metadata=metadata_name,creators=credit,
                        derivation='Full-frame Pillow LANCZOS, maximum 2448 x 3264, JPEG quality 82, subsampling 2',
                        pillow=PIL.__version__))
    print(output,dest.stat().st_size)
(ROOT/'public/sources/images.json').write_text(json.dumps(dict(license='CC BY 3.0',images=results),indent=2)+'\n')
