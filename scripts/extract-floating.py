"""Derive an auditable reading and its image coordinates from the released TEI.

Readings use the expanded side of choice, join split words, omit marginal
numbers, and preserve supplied/unclear distinctions. No source XML is edited.
"""
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {"t": "http://www.tei-c.org/ns/1.0"}
XML_ID = "{http://www.w3.org/XML/1998/namespace}id"


def load(name):
    root = ET.parse(ROOT / "public/sources" / name).getroot()
    zones = {z.get(XML_ID): {k: int(z.get(k)) for k in ("ulx", "uly", "lrx", "lry")}
             for z in root.findall(".//t:zone", NS)}
    chars = []
    current = None
    join = False

    def add(text, flags, inside):
        if not text:
            return
        text = re.sub(r"\s+", "", text) if inside else re.sub(r"\s+", " ", text)
        chars.extend((c, flags, current) for c in text)

    def walk(e, flags=(), inside=False):
        nonlocal current, join
        tag = e.tag.split("}")[-1]
        if tag == "lb":
            current = e.get("facs", "").lstrip("#")
            if not join:
                add(" ", flags, False)
            return
        if tag in ("milestone", "figure", "hi", "abbr", "am", "g"):
            return
        if tag == "choice":
            child = e.find("t:expan", NS)
            if child is not None:
                walk(child, flags, True)
            return
        if tag == "gap":
            add("[… ]".replace(" ", ""), flags + ("gap",), True)
            return
        if tag == "w":
            if e.get("part") == "F":
                while chars and chars[-1][0] == " ":
                    chars.pop()
            inside = True
        if tag in ("supplied", "unclear", "ex", "sic"):
            flags += (tag,)
        add(e.text, flags, inside)
        for child in e:
            walk(child, flags, inside)
            # Whitespace between the split parts is typesetting, not a space.
            child_tag = child.tag.split("}")[-1]
            if not (child_tag == "w" and child.get("part") == "I"):
                add(child.tail, flags, inside)
        if tag == "w":
            join = e.get("part") == "I"

    walk(root.find("t:text/t:body", NS))
    clean = []
    for item in chars:
        if item[0] == " " and (not clean or clean[-1][0] == " "):
            continue
        clean.append(item)
    return clean, zones


files = {"Arch07v": "float-Arch07v.xml", "Arch08r": "float-Arch08r.xml", "Arch08v": "float-Arch08v.xml"}
selections = [
    ("Arch07v", "Τὸ ὀρθὸν τμᾶμα τοῦ ὀρθογωνίου", "τῆς μέχρι τοῦ ἄξονος,"),
    ("Arch07v", "πάντα λόγον", "μὴ ἅπτεσθαι τοῦ ὑγροῦ,"),
    ("Arch07v", "τεθὲν κεκλιμένον", "ἀλλὰ ἀποκαταστήσεται ὀρθόν."),
    ("Arch07v", "ὀρθὸν δὲ λέγω", "τὴν ἐπιφάνειαν ἦι τοῦ ὑγροῦ."),
    ("Arch08r", "δῆλον, ὡς οὐ", "ἕως ἂν ὀρθὸν ἀποκατασταθῆι."),
    ("Arch08v", "ΤΟ ὀρθὸν τμᾶμα", "ἀλλὰ ἀποκαταστήσεται εἰς ὀρθόν."),
]

loaded = {key: load(name) for key, name in files.items()}
results = []
for folio, start, end in selections:
    chars, zones = loaded[folio]
    text = "".join(c[0] for c in chars)
    try:
        a = text.index(start)
        b = text.index(end, a) + len(end)
    except ValueError:
        print(text)
        raise
    selected = chars[a:b]
    chunks = []
    for c, flags, _ in selected:
        if chunks and chunks[-1]["flags"] == list(flags):
            chunks[-1]["text"] += c
        else:
            chunks.append({"text": c, "flags": list(flags)})
    ids = list(dict.fromkeys(c[2] for c in selected if c[0] != " " and c[2]))
    assert ids and all(z in zones for z in ids)
    results.append({"folio": folio, "source": files[folio], "text": text[a:b], "chunks": chunks,
                    "lines": [{"id": z, **zones[z]} for z in ids]})
    print(len(results), folio, text[a:b])
(ROOT / "src/float-readings.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
