# Resume Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![HTML](https://img.shields.io/badge/HTML-5-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Build Step](https://img.shields.io/badge/Build-None-success.svg)](#quick-start)

> A lightweight, browser-based resume builder with live preview and one-click PDF/DOCX export — no server, no build step, no dependencies to install.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Resume Builder is a pure HTML/CSS/JS application that lets you fill out a resume form on the left side of your screen and see a live, print-ready preview on the right. Export your finished resume to PDF or DOCX with a single click. No frameworks, no bundlers — just open `index.html` in any modern browser.

## Key Features

- **Live preview** — updates instantly as you type
- **PDF export** — print-ready US Letter size via [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
- **DOCX export** — editable Word document via [docx.js](https://github.com/dolanmiu/docx) and [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- **No build step** — pure HTML/CSS/JS, no dependencies to install
- **Responsive** — works on desktop and mobile
- **Clean professional styling** — minimal, recruiter-friendly layout

## Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Skynet-Pro-Plus/resume-builder.git
   cd resume-builder
   ```

2. Open `index.html` in any modern browser (double-click or drag into Chrome/Firefox/Edge/Safari).

3. Fill in your details on the left panel.

4. Watch the preview update in real time on the right.

> **Note:** An internet connection is required on first load to fetch the CDN libraries (html2pdf, docx, FileSaver).

## Usage

### Filling the Form

| Field | Format |
|-------|--------|
| Personal Info | Plain text for name, title, email, phone, location, website |
| Summary | Free-form paragraph |
| Experience | One entry per line: `Company \| Role \| Start – End \| Description` |
| Education | One entry per line: `School \| Degree \| Year` |
| Skills | Comma-separated: `JavaScript, Python, SQL` |

### Exporting

**Export to PDF:** Click the **Export PDF** button. Your browser downloads a print-ready PDF (US Letter size).

**Export to DOCX:** Click the **Export DOCX** button. Your browser downloads a Word document you can open in Microsoft Word, Google Docs, or LibreOffice.

## Project Structure

```
resume-builder/
├── index.html   # Main page — form + preview, CDN script tags
├── style.css    # Professional styling
├── script.js    # Form logic, live preview, PDF & DOCX export
└── README.md    # This file
```

## Dependencies

All dependencies are loaded from CDN — no installation required.

| Library | Purpose | CDN |
|---------|---------|-----|
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | PDF export | cdnjs |
| [docx](https://github.com/dolanmiu/docx) | DOCX generation | unpkg |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | File download | cdnjs |

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License — free to use, modify, and distribute.
