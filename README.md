# Resume Builder

A lightweight, browser-based resume builder. Fill out the form on the left,
see a live preview on the right, and export your resume to **PDF** or **DOCX**
with a single click — no server required.

## Features

- **Live preview** — updates instantly as you type.
- **PDF export** — powered by [`html2pdf.js`](https://github.com/eKoopmans/html2pdf.js).
- **DOCX export** — powered by [`docx.js`](https://github.com/dolanmiu/docx) and [FileSaver.js](https://github.com/eligrey/FileSaver.js).
- **No build step** — pure HTML / CSS / JS. Just open `index.html` in a browser.
- **Responsive** — works on desktop and mobile.

## Quick Start

1. Download or clone this folder.
2. Double-click `index.html` (or open it with any modern browser).
3. Fill in your details on the left panel.
4. Watch the preview update in real time on the right.

> **Note:** An internet connection is required on first load so the browser can
> fetch the CDN libraries (html2pdf, docx, FileSaver).

## How to Use

### Filling the Form

| Field | Format |
|-------|--------|
| Personal Info | Plain text for name, title, email, phone, location, website |
| Summary | Free-form paragraph |
| Experience | One entry per line: `Company \| Role \| Start – End \| Description` |
| Education | One entry per line: `School \| Degree \| Year` |
| Skills | Comma-separated: `JavaScript, Python, SQL` |

### Exporting

#### Export to PDF
1. Click the **📄 Export PDF** button.
2. Your browser downloads a print-ready PDF (US Letter size).

#### Export to DOCX
1. Click the **📄 Export DOCX** button.
2. Your browser downloads a Word document you can open in Microsoft Word,
   Google Docs, or LibreOffice for further editing.

## Project Structure

```
resume-builder/
├── index.html   # Main page — form + preview, CDN script tags
├── style.css    # Minimal professional styling
├── script.js    # Form logic, live preview, PDF & DOCX export
└── README.md    # This file
```

## Dependencies (CDN)

| Library | CDN |
|---------|-----|
| html2pdf.js | `https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js` |
| docx | `https://unpkg.com/docx@8.5.0/build/index.umd.min.js` |
| FileSaver.js | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` |

## License

MIT — free to use, modify, and distribute.
