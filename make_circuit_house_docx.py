from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import html


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "Circuit_House_Business_Report.html"
OUTPUT = ROOT / "Circuit_House_Business_Report.docx"


class ReportParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.stack = []
        self.current = None
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in {"style", "head", "script"}:
            self.skip = True
            return
        if self.skip:
            return
        if tag in {"h1", "h2", "h3", "p", "li"}:
            self.current = {"tag": tag, "runs": []}
        elif tag in {"strong", "b", "em", "i"}:
            self.stack.append(tag)
        elif tag == "br" and self.current:
            self.current["runs"].append(("\n", set(self.stack)))

    def handle_endtag(self, tag):
        if tag in {"style", "head", "script"}:
            self.skip = False
            return
        if self.skip:
            return
        if tag in {"strong", "b", "em", "i"}:
            for index in range(len(self.stack) - 1, -1, -1):
                if self.stack[index] == tag:
                    self.stack.pop(index)
                    break
        elif tag in {"h1", "h2", "h3", "p", "li"} and self.current:
            text = "".join(run[0] for run in self.current["runs"]).strip()
            if text:
                self.blocks.append(self.current)
            self.current = None

    def handle_data(self, data):
        if self.skip or self.current is None:
            return
        cleaned = " ".join(data.split())
        if cleaned:
            if self.current["runs"] and not self.current["runs"][-1][0].endswith((" ", "\n")):
                cleaned = " " + cleaned
            self.current["runs"].append((cleaned, set(self.stack)))


def esc(value):
    return html.escape(value, quote=True)


def run_xml(text, marks):
    props = []
    if "strong" in marks or "b" in marks:
        props.append("<w:b/>")
    if "em" in marks or "i" in marks:
        props.append("<w:i/>")
    prop_xml = f"<w:rPr>{''.join(props)}</w:rPr>" if props else ""
    pieces = []
    for part in text.split("\n"):
        if pieces:
            pieces.append("<w:br/>")
        pieces.append(f'<w:t xml:space="preserve">{esc(part)}</w:t>')
    return f"<w:r>{prop_xml}{''.join(pieces)}</w:r>"


def paragraph_xml(block, index):
    tag = block["tag"]
    text = "".join(run[0] for run in block["runs"]).strip()
    style = {
        "h1": "TitleHeading",
        "h2": "SectionHeading",
        "h3": "SubHeading",
        "li": "ListParagraph",
    }.get(tag, "BodyText")

    if text == "Circuit House":
        style = "CoverTitle"
    elif text == "Business Report on an E-commerce Gadget Store":
        style = "CoverSubtitle"
    elif text == "Prepared by the Group Members":
        style = "CoverNote"

    page_break = ""
    if text == "Business Report: Circuit House":
        page_break = '<w:pageBreakBefore/>'

    numbering = ""
    if tag == "li":
        numbering = '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'

    justification = '<w:jc w:val="both"/>' if tag == "p" else ""
    spacing = '<w:spacing w:before="80" w:after="120" w:line="360" w:lineRule="auto"/>'
    props = f'<w:pPr><w:pStyle w:val="{style}"/>{page_break}{numbering}{spacing}{justification}</w:pPr>'
    runs = "".join(run_xml(text, marks) for text, marks in block["runs"])
    return f"<w:p>{props}{runs}</w:p>"


def build_styles():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="BodyText">
    <w:name w:val="Body Text"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CoverTitle">
    <w:name w:val="Cover Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="2200" w:after="220"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:u w:val="single"/><w:color w:val="0F3D5E"/><w:sz w:val="60"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CoverSubtitle">
    <w:name w:val="Cover Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="900"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:u w:val="single"/><w:color w:val="374151"/><w:sz w:val="34"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CoverNote">
    <w:name w:val="Cover Note"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="500" w:after="100"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:color w:val="4B5563"/><w:sz w:val="25"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="TitleHeading">
    <w:name w:val="Title Heading"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="180"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:u w:val="single"/><w:color w:val="0F3D5E"/><w:sz w:val="40"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="SectionHeading">
    <w:name w:val="Section Heading"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="260" w:after="100"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:u w:val="single"/><w:color w:val="0F3D5E"/><w:sz w:val="30"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="SubHeading">
    <w:name w:val="Subheading"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="70"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:u w:val="single"/><w:color w:val="1F2933"/><w:sz w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="BodyText"/>
    <w:qFormat/>
    <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
  </w:style>
</w:styles>"""


def build_document(blocks):
    title_blocks = []
    body_started = False
    paragraphs = []
    for index, block in enumerate(blocks):
        text = "".join(run[0] for run in block["runs"]).strip()
        if text == "Business Report: Circuit House":
            body_started = True
        paragraphs.append(paragraph_xml(block, index))
        if not body_started:
            title_blocks.append(text)

    section_properties = """
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
</w:sectPr>"""

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(paragraphs)}
    {section_properties}
  </w:body>
</w:document>"""


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>"""

NUMBERING = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>"""


def main():
    parser = ReportParser()
    parser.feed(SOURCE.read_text(encoding="utf-8"))
    document = build_document(parser.blocks)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", CONTENT_TYPES)
        archive.writestr("_rels/.rels", RELS)
        archive.writestr("word/_rels/document.xml.rels", DOC_RELS)
        archive.writestr("word/document.xml", document)
        archive.writestr("word/styles.xml", build_styles())
        archive.writestr("word/numbering.xml", NUMBERING)
    print(OUTPUT)


if __name__ == "__main__":
    main()
