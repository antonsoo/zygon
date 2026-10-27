"""Reproduce retained full frames from checked original TIFFs and the 1881 PDF.

Pass the directory containing the three named TIFFs and heiberg-1881.pdf.
Requires Pillow and Poppler. No mathematical letters are retouched.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from PIL import Image
import PIL

root = Path(__file__).resolve().parents[1]
originals = Path(sys.argv[1])
dest = root/'public/sources'
images = []
for folder, folio, expected in [
    ('017v-016r','Arch07v','7cac6ee484212718eca3a53852f71031'),
    ('028r-021v','Arch08r','d215360f98ce16c7d209e369a7c6b7b8'),
    ('028v-021r','Arch08v','396d605a5be17fb915ca931ff70055ff'),
]:
    name=f'{folder}_{folio}_Sinar_pseudo_no-veil.tif'
    source=originals/name
    raw=source.read_bytes()
    assert hashlib.md5(raw).hexdigest()==expected,name
    image=Image.open(source)
    assert image.size==(8160,10880)
    creators=str(image.tag_v2[315])
    assert all(c in creators for c in ['Christens-Barry','Easton','Knox'])
    metadata=f'float-{folio}-metadata.txt'
    (dest/metadata).write_text(str(image.tag_v2[270])+'\n')
    image.thumbnail((2448,3264),Image.Resampling.LANCZOS)
    output=f'float-{folio}.jpg'
    image.convert('RGB').save(dest/output,quality=82,subsampling=2)
    images.append(dict(file=output,caption=f'{folio} / project pseudo_no-veil processed image, full frame reduced from 8160 x 10880',
        source=f'https://archimedespalimpsest.net/Data/{folder}/{name}',sourceBytes=len(raw),sourceSha256=hashlib.sha256(raw).hexdigest(),
        checksumSource=f'https://archimedespalimpsest.net/Data/{folder}/{name[:-4]}.md5',sourceMd5=expected,
        size=[2448,3264],metadata=metadata,license='CC BY 3.0',creators=creators,
        derivation='Pillow LANCZOS full frame to 2448 x 3264; JPEG quality 82, subsampling 2',pillow=PIL.__version__))
pdf=originals/'heiberg-1881.pdf'
assert hashlib.sha256(pdf.read_bytes()).hexdigest()=='85cf138bc1368260a71d7324e8b9892e89c1a6751286093519982babbcc9ffcf'
for page in [376,377,379,380]:
    output=f'float-latin-{page}'
    subprocess.run(['pdftoppm','-f',str(page+43),'-l',str(page+43),'-singlefile','-scale-to','2000','-jpeg','-jpegopt','quality=85',str(pdf),str(dest/output)],check=True)
    images.append(dict(file=output+'.jpg',caption=f'Heiberg, Archimedis Opera omnia II (1881), printed p. {page}; Latin transmitted through the pre-palimpsest edition',
        source='https://archive.org/download/archimedisopera04eutogoog/archimedisopera04eutogoog.pdf',
        sourceSha256=hashlib.sha256(pdf.read_bytes()).hexdigest(),pdfPage=page+43,printedPage=page,
        license='Public domain',derivation='Poppler pdftoppm, scale-to 2000, JPEG quality 85; full page'))
for image in images:
    b=(dest/image['file']).read_bytes();image.update(bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
(dest/'float-sources.json').write_text(json.dumps(dict(images=images),indent=2)+'\n')
print(f'{len(images)} complete source images regenerated.')
