/* ============================================================
   Resume Builder — JavaScript
   Listens to form changes, renders live preview,
   and exports to PDF (html2pdf) and DOCX (docx).
   ============================================================ */

(function () {
  "use strict";

  /* ── DOM References ─────────────────────────────────── */
  const els = {
    fullName: document.getElementById("fullName"),
    jobTitle: document.getElementById("jobTitle"),
    email:    document.getElementById("email"),
    phone:    document.getElementById("phone"),
    location: document.getElementById("location"),
    website:  document.getElementById("website"),
    summary:  document.getElementById("summary"),
    experience: document.getElementById("experience"),
    education:  document.getElementById("education"),
    skills:     document.getElementById("skills"),
    preview:    document.getElementById("resumePreview"),
    exportPdfBtn:  document.getElementById("exportPdfBtn"),
    exportDocxBtn: document.getElementById("exportDocxBtn"),
  };

  /* ── Collect form data into a plain object ──────────── */
  function getData() {
    return {
      fullName:   els.fullName.value.trim(),
      jobTitle:   els.jobTitle.value.trim(),
      email:      els.email.value.trim(),
      phone:      els.phone.value.trim(),
      location:   els.location.value.trim(),
      website:    els.website.value.trim(),
      summary:    els.summary.value.trim(),
      experience: els.experience.value.trim(),
      education:  els.education.value.trim(),
      skills:     els.skills.value.trim(),
    };
  }

  /* ── Parse pipe-separated textarea lines ────────────── */
  function parseLines(raw) {
    return raw
      .split("\n")
      .map(function (l) { return l.trim(); })
      .filter(Boolean)
      .map(function (l) { return l.split("|").map(function (p) { return p.trim(); }); });
  }

  /* ── Escape HTML to prevent injection ───────────────── */
  function esc(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── Render the live preview ────────────────────────── */
  function renderPreview() {
    var d = getData();
    var html = "";

    /* Header */
    html += '<div class="rp-header">';
    if (d.fullName)  html += '<div class="rp-name">' + esc(d.fullName) + "</div>";
    if (d.jobTitle)  html += '<div class="rp-title">' + esc(d.jobTitle) + "</div>";

    /* Contact line */
    var contacts = [];
    if (d.email)    contacts.push(esc(d.email));
    if (d.phone)    contacts.push(esc(d.phone));
    if (d.location) contacts.push(esc(d.location));
    if (d.website)  contacts.push(esc(d.website));
    if (contacts.length) {
      html += '<div class="rp-contact">';
      contacts.forEach(function (c) { html += "<span>" + c + "</span>"; });
      html += "</div>";
    }
    html += "</div>"; // rp-header

    /* Summary */
    if (d.summary) {
      html += "<h3>Summary</h3>";
      html += '<p class="rp-summary">' + esc(d.summary) + "</p>";
    }

    /* Experience */
    var exp = parseLines(d.experience);
    if (exp.length) {
      html += "<h3>Experience</h3>";
      exp.forEach(function (row) {
        html += '<div class="rp-exp-item">';
        html += '<div class="rp-exp-header">';
        html += '<span class="rp-exp-role">' + esc(row[1] || "") + " &mdash; " + esc(row[0] || "") + "</span>";
        if (row[2]) html += '<span class="rp-exp-company">' + esc(row[2]) + "</span>";
        html += "</div>";
        if (row[3]) html += '<div class="rp-exp-desc">' + esc(row[3]) + "</div>";
        html += "</div>";
      });
    }

    /* Education */
    var edu = parseLines(d.education);
    if (edu.length) {
      html += "<h3>Education</h3>";
      edu.forEach(function (row) {
        html += '<div class="rp-edu-item">';
        html += '<div class="rp-edu-header">';
        html += "<span>" + esc(row[0] || "") + " — " + esc(row[1] || "") + "</span>";
        if (row[2]) html += "<span>" + esc(row[2]) + "</span>";
        html += "</div>";
        html += "</div>";
      });
    }

    /* Skills */
    if (d.skills) {
      html += "<h3>Skills</h3>";
      html += '<div class="rp-skills">';
      d.skills
        .split(",")
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .forEach(function (s) {
          html += '<span class="rp-skill-tag">' + esc(s) + "</span>";
        });
      html += "</div>";
    }

    /* Placeholder if empty */
    if (!html.trim()) {
      html = '<p class="rp-placeholder">Start filling the form to see your resume preview here…</p>';
    }

    els.preview.innerHTML = html;
  }

  /* ── Export to PDF (html2pdf) ───────────────────────── */
  function exportPDF() {
    var d = getData();
    var fileName = (d.fullName || "resume").replace(/\s+/g, "_") + ".pdf";

    var opt = {
      margin:      [10, 10, 10, 10],
      filename:    fileName,
      image:       { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF:       { unit: "mm", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(els.preview).save();
  }

  /* ── Export to DOCX (docx library) ──────────────────── */
  function exportDOCX() {
    if (typeof docx === "undefined") {
      alert("DOCX library failed to load. Check your internet connection.");
      return;
    }

    var d = getData();
    var children = [];

    /* Name (heading) */
    if (d.fullName) {
      children.push(new docx.TextRun({ text: d.fullName, bold: true, size: 32 }));
      children.push(new docx.Paragraph({ children: [] }));
    }

    /* Job Title */
    if (d.jobTitle) {
      children.push(new docx.TextRun({ text: d.jobTitle, italics: true, size: 24, color: "1A4D8F" }));
      children.push(new docx.Paragraph({ children: [] }));
    }

    /* Contact */
    var contactParts = [];
    if (d.email)    contactParts.push(d.email);
    if (d.phone)    contactParts.push(d.phone);
    if (d.location) contactParts.push(d.location);
    if (d.website)  contactParts.push(d.website);
    if (contactParts.length) {
      children.push(new docx.TextRun({ text: contactParts.join(" | "), size: 18, color: "57606A" }));
      children.push(new docx.Paragraph({ children: [] }));
    }

    /* Summary */
    if (d.summary) {
      children.push(sectionHeading("Summary"));
      children.push(new docx.TextRun({ text: d.summary, size: 20 }));
      children.push(new docx.Paragraph({ children: [] }));
    }

    /* Experience */
    var exp = parseLines(d.experience);
    if (exp.length) {
      children.push(sectionHeading("Experience"));
      exp.forEach(function (row) {
        children.push(new docx.TextRun({
          text: (row[1] || "") + " — " + (row[0] || ""),
          bold: true, size: 22,
        }));
        if (row[2]) {
          children.push(new docx.TextRun({ text: "  " + row[2], size: 18, color: "57606A" }));
        }
        children.push(new docx.Paragraph({}));
        if (row[3]) {
          children.push(new docx.TextRun({ text: row[3], size: 20 }));
          children.push(new docx.Paragraph({}));
        }
      });
    }

    /* Education */
    var edu = parseLines(d.education);
    if (edu.length) {
      children.push(sectionHeading("Education"));
      edu.forEach(function (row) {
        children.push(new docx.TextRun({
          text: (row[0] || "") + " — " + (row[1] || "") + (row[2] ? " (" + row[2] + ")" : ""),
          size: 20,
        }));
        children.push(new docx.Paragraph({}));
      });
    }

    /* Skills */
    if (d.skills) {
      children.push(sectionHeading("Skills"));
      children.push(new docx.TextRun({ text: d.skills, size: 20 }));
    }

    /* Build paragraphs from children runs */
    var paragraphs = [];
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c instanceof docx.Paragraph) {
        paragraphs.push(c);
      } else {
        paragraphs.push(new docx.Paragraph({ children: [c] }));
      }
    }

    var fileName = (d.fullName || "resume").replace(/\s+/g, "_") + ".docx";

    var doc = new docx.Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    docx.Packer.toBlob(doc).then(function (blob) {
      saveAs(blob, fileName);
    });
  }

  /* Helper: section heading as a paragraph with a bold run */
  function sectionHeading(text) {
    return new docx.Paragraph({
      children: [new docx.TextRun({ text: text, bold: true, size: 24, color: "1A4D8F" })],
      spacing: { before: 200, after: 100 },
    });
  }

  /* ── Event Listeners ────────────────────────────────── */

  // Re-render on any input change
  var formIds = ["fullName","jobTitle","email","phone","location","website","summary","experience","education","skills"];
  formIds.forEach(function (id) {
    els[id].addEventListener("input", renderPreview);
  });

  // Export buttons
  els.exportPdfBtn.addEventListener("click", exportPDF);
  els.exportDocxBtn.addEventListener("click", exportDOCX);

  // Initial render
  renderPreview();
})();
