import os
import fitz    # PyMuPDF
import pdfplumber
import requests

OUTPUT_IMG_DIR = "extracted_images"

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    pages = []
    for page in doc:
        txt = page.get_text("text")
        if len(txt) > 200:
            pages.append(txt)
        else:
            pages.append(_two_col_extract(pdf_path, page.number))
    return "\n\n".join(pages)

def _two_col_extract(pdf_path, page_index):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_index]
        w, h = page.width, page.height
        full_lines = (page.extract_text() or "").splitlines()
        left = page.within_bbox((0, 0, w/2, h)).extract_text() or ""
        right = page.within_bbox((w/2, 0, w, h)).extract_text() or ""
        left_lines  = [l for l in left.splitlines()  if l.strip()]
        right_lines = [l for l in right.splitlines() if l.strip()]
        combined = [l + r for l, r in zip(left_lines, right_lines)]
        if combined == full_lines:
            return "\n".join(full_lines)
        return "\n".join(left_lines + [""] + right_lines)

def extract_links(pdf_path):
    doc = fitz.open(pdf_path)
    links = []
    for page in doc:
        for link in page.get_links():
            uri = link.get("uri")
            if uri:
                links.append(uri)
    return links

def extract_images(pdf_path, output_dir=OUTPUT_IMG_DIR):
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    saved = []
    for pi in range(len(doc)):
        page = doc[pi]
        for idx, img in enumerate(page.get_images(full=True), start=1):
            xref = img[0]
            img_dict = doc.extract_image(xref)
            ext = img_dict["ext"]
            data = img_dict["image"]
            fn = f"page{pi+1}_img{idx}.{ext}"
            path = os.path.join(output_dir, fn)
            with open(path, "wb") as f:
                f.write(data)
            saved.append(path)
    return saved

def build_parse_prompt(text, links):
    linkedin = next((u for u in links if "linkedin.com" in u.lower()), None)
    github   = next((u for u in links if "github.com" in u.lower()), None)
    project_links = [u for u in links if u not in [linkedin, github]]
    return f"""You are a professional resume parser. Here is the resume text and extracted links:

LinkedIn: {linkedin or 'null'}
GitHub: {github or 'null'}
Project Links: {project_links}

Resume Text (read the whole text before answering):
{text}

Extract to JSON with fields:
- name, email, phone
- bio
- linkedin, github
- domain: the candidate’s professional domain (e.g. "Software Development", "Data Science", "Machine Learning", only one domain)
- education: list of {{"degree", "university", "location", "gpa", "description", "start_date", "end_date"}}, treat 'present' as end_date
- experience: list of {{"role", "company", "location", "date", "description"}}
- skills: technical only (exclude languages & soft skills)
- missing_skills: list of strings (skills commonly required in their domain that are NOT in their CV)  
- projects: list of {{"name", "tools", "description", "link"}}

If not found, use null.
IMPORTANT: Return exactly one JSON object — 
start with '{' and end with '}',
with no extra text, explanations, or trailing commas.
"""

def call_mistral(prompt: str):
    resp = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": prompt, "stream": False}
    )
    return resp.json().get("response", "")
