/* ============================================================
   Resume Builder — Modern JavaScript
   Features: dynamic entries, localStorage, themes, validation,
             live preview, PDF/DOCX export, sample data.
   ============================================================ */

(function () {
  "use strict";

  /* ── Constants ───────────────────────────────────────── */
  var STORAGE_KEY   = "resumeBuilder.data.v2";
  var THEME_KEY     = "resumeBuilder.theme";
  var SAVE_DEBOUNCE = 400; // ms

  /* ── DOM References ──────────────────────────────────── */
  var els = {
    form:         document.getElementById("resumeForm"),
    fullName:     document.getElementById("fullName"),
    jobTitle:     document.getElementById("jobTitle"),
    email:        document.getElementById("email"),
    phone:        document.getElementById("phone"),
    location:     document.getElementById("location"),
    website:      document.getElementById("website"),
    summary:      document.getElementById("summary"),
    skills:       document.getElementById("skills"),
    experienceList:  document.getElementById("experienceList"),
    educationList:   document.getElementById("educationList"),
    addExpBtn:    document.getElementById("addExperienceBtn"),
    addEduBtn:    document.getElementById("addEducationBtn"),
    preview:      document.getElementById("resumePreview"),
    exportPdf:    document.getElementById("exportPdfBtn"),
    exportDocx:   document.getElementById("exportDocxBtn"),
    loadSample:   document.getElementById("loadSampleBtn"),
    clearAll:     document.getElementById("clearBtn"),
    saveStatus:   document.getElementById("saveStatus"),
    themeDots:    document.querySelectorAll(".theme-dot"),
  };

  /* ── Utility: escape HTML ────────────────────────────── */
  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── Sample Data ─────────────────────────────────────── */
  var SAMPLE = {
    personal: {
      fullName: "Jane Smith",
      jobTitle: "Senior Software Engineer",
      email: "jane.smith@email.com",
      phone: "(608) 751-6459",
      location: "Madison, WI",
      website: "linkedin.com/in/janesmith",
      summary: "Results-driven senior software engineer with 8+ years of experience building scalable web applications. Passionate about clean architecture, mentorship, and delivering exceptional user experiences.",
      skills: "JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, GraphQL",
    },
    experience: [
      { company: "Acme Corp", role: "Senior Software Engineer", start: "2020", end: "Present", description: "Led a team of 5 engineers building a microservices platform serving 2M+ users. Reduced infrastructure costs by 30% through architectural optimization." },
      { company: "Beta LLC", role: "Software Engineer", start: "2018", end: "2020", description: "Developed and maintained internal tools using React and Node.js. Introduced CI/CD pipelines that cut deployment time by 60%." },
      { company: "StartupHub", role: "Junior Developer", start: "2016", end: "2018", description: "Built customer-facing features for a SaaS product. Collaborated closely with design and product teams." },
    ],
    education: [
      { school: "University of Wisconsin–Madison", degree: "B.S. Computer Science", year: "2016" },
      { school: "freeCodeCamp", degree: "Full-Stack Certification", year: "2017" },
    ],
  };

  /* ── State ───────────────────────────────────────────── */
  var state = { experience: [], education: [] };
  var saveTimer = null;

  /* ============================================================
     DYNAMIC ENTRIES — Experience
     ============================================================ */

  function createExperienceEntry(data) {
    data = data || {};
    var card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML =
      '<div class="field-grid">' +
        '<div class="field">' +
          '<label>Company</label>' +
          '<input type="text" class="exp-company" value="' + esc(data.company || "") + '" placeholder="Acme Corp">' +
        '</div>' +
        '<div class="field">' +
          '<label>Role</label>' +
          '<input type="text" class="exp-role" value="' + esc(data.role || "") + '" placeholder="Software Engineer">' +
        '</div>' +
        '<div class="field">' +
          '<label>Start</label>' +
          '<input type="text" class="exp-start" value="' + esc(data.start || "") + '" placeholder="2020">' +
        '</div>' +
        '<div class="field">' +
          '<label>End</label>' +
          '<input type="text" class="exp-end" value="' + esc(data.end || "") + '" placeholder="Present">' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label>Description</label>' +
        '<textarea class="exp-desc" rows="2" placeholder="Key achievements and responsibilities…">' + esc(data.description || "") + '</textarea>' +
      '</div>' +
      '<div class="entry-actions">' +
        '<button type="button" class="btn-remove">✕ Remove</button>' +
      '</div>';

    // Remove handler
    card.querySelector(".btn-remove").addEventListener("click", function () {
      card.remove();
      collectAndRender();
      save();
    });

    // Input listeners
    card.querySelectorAll("input, textarea").forEach(function (inp) {
      inp.addEventListener("input", function () { collectAndRender(); save(); });
    });

    els.experienceList.appendChild(card);
  }

  function addExperience(data) {
    createExperienceEntry(data);
  }

  function collectExperience() {
    var items = [];
    var cards = els.experienceList.querySelectorAll(".entry-card");
    cards.forEach(function (card) {
      items.push({
        company:     card.querySelector(".exp-company").value.trim(),
        role:        card.querySelector(".exp-role").value.trim(),
        start:       card.querySelector(".exp-start").value.trim(),
        end:         card.querySelector(".exp-end").value.trim(),
        description: card.querySelector(".exp-desc").value.trim(),
      });
    });
    return items.filter(function (e) {
      return e.company || e.role || e.start || e.end || e.description;
    });
  }

  /* ============================================================
     DYNAMIC ENTRIES — Education
     ============================================================ */

  function createEducationEntry(data) {
    data = data || {};
    var card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML =
      '<div class="field-grid">' +
        '<div class="field">' +
          '<label>School</label>' +
          '<input type="text" class="edu-school" value="' + esc(data.school || "") + '" placeholder="UW-Madison">' +
        '</div>' +
        '<div class="field">' +
          '<label>Degree</label>' +
          '<input type="text" class="edu-degree" value="' + esc(data.degree || "") + '" placeholder="B.S. Computer Science">' +
        '</div>' +
        '<div class="field" style="grid-column: span 2;">' +
          '<label>Year</label>' +
          '<input type="text" class="edu-year" value="' + esc(data.year || "") + '" placeholder="2018">' +
        '</div>' +
      '</div>' +
      '<div class="entry-actions">' +
        '<button type="button" class="btn-remove">✕ Remove</button>' +
      '</div>';

    card.querySelector(".btn-remove").addEventListener("click", function () {
      card.remove();
      collectAndRender();
      save();
    });

    card.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", function () { collectAndRender(); save(); });
    });

    els.educationList.appendChild(card);
  }

  function collectEducation() {
    var items = [];
    var cards = els.educationList.querySelectorAll(".entry-card");
    cards.forEach(function (card) {
      items.push({
        school: card.querySelector(".edu-school").value.trim(),
        degree: card.querySelector(".edu-degree").value.trim(),
        year:   card.querySelector(".edu-year").value.trim(),
      });
    });
    return items.filter(function (e) {
      return e.school || e.degree || e.year;
    });
  }

  /* ============================================================
     COLLECT & RENDER
     ============================================================ */

  function collectAndRender() {
    state.experience = collectExperience();
    state.education  = collectEducation();
    renderPreview();
  }

  function getPersonal() {
    return {
      fullName: els.fullName.value.trim(),
      jobTitle: els.jobTitle.value.trim(),
      email:    els.email.value.trim(),
      phone:    els.phone.value.trim(),
      location: els.location.value.trim(),
      website:  els.website.value.trim(),
      summary:  els.summary.value.trim(),
      skills:   els.skills.value.trim(),
    };
  }

  /* ── Render the live preview ─────────────────────────── */
  function renderPreview() {
    var d = getPersonal();
    var html = "";

    /* Header */
    var hasHeader = d.fullName || d.jobTitle;
    if (hasHeader) {
      html += '<div class="rp-header">';
      if (d.fullName) html += '<div class="rp-name">' + esc(d.fullName) + "</div>";
      if (d.jobTitle) html += '<div class="rp-title">' + esc(d.jobTitle) + "</div>";

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
      html += "</div>";
    }

    /* Summary */
    if (d.summary) {
      html += "<h3>Summary</h3>";
      html += '<p class="rp-summary">' + esc(d.summary) + "</p>";
    }

    /* Experience */
    if (state.experience.length) {
      html += "<h3>Experience</h3>";
      state.experience.forEach(function (e) {
        html += '<div class="rp-exp-item">';
        html += '<div class="rp-exp-header">';
        html += '<span class="rp-exp-role">' + esc(e.role || "") + (e.company ? " · " + esc(e.company) : "") + "</span>";
        if (e.start || e.end) {
          html += '<span class="rp-exp-date">' + esc(e.start) + (e.end ? " – " + esc(e.end) : "") + "</span>";
        }
        html += "</div>";
        if (e.description) {
          html += '<div class="rp-exp-desc">' + esc(e.description) + "</div>";
        }
        html += "</div>";
      });
    }

    /* Education */
    if (state.education.length) {
      html += "<h3>Education</h3>";
      state.education.forEach(function (e) {
        html += '<div class="rp-edu-item">';
        html += '<div>';
        if (e.degree) html += '<span class="rp-edu-degree">' + esc(e.degree) + "</span>";
        if (e.school) html += ' <span class="rp-edu-school">' + esc(e.school) + "</span>";
        html += '</div>';
        if (e.year) html += '<span class="rp-edu-year">' + esc(e.year) + "</span>";
        html += "</div>";
      });
    }

    /* Skills */
    if (d.skills) {
      var skills = d.skills.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      if (skills.length) {
        html += "<h3>Skills</h3>";
        html += '<div class="rp-skills">';
        skills.forEach(function (s) {
          html += '<span class="rp-skill-tag">' + esc(s) + "</span>";
        });
        html += "</div>";
      }
    }

    /* Placeholder */
    if (!html.trim()) {
      html = '<p class="rp-placeholder">Start filling out the form to see your resume come to life…</p>';
    }

    els.preview.innerHTML = html;
  }

  /* ============================================================
     LOCALSTORAGE PERSISTENCE
     ============================================================ */

  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var data = {
        personal: getPersonal(),
        experience: collectExperience(),
        education: collectEducation(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        showSaveStatus("Saved");
      } catch (e) {
        /* storage might be full or unavailable */
      }
    }, SAVE_DEBOUNCE);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function showSaveStatus(msg) {
    els.saveStatus.textContent = "✓ " + msg;
    els.saveStatus.classList.add("visible");
    setTimeout(function () {
      els.saveStatus.classList.remove("visible");
    }, 1500);
  }

  function applyData(data) {
    var p = data.personal || {};
    els.fullName.value = p.fullName || "";
    els.jobTitle.value = p.jobTitle || "";
    els.email.value    = p.email || "";
    els.phone.value    = p.phone || "";
    els.location.value = p.location || "";
    els.website.value  = p.website || "";
    els.summary.value  = p.summary || "";
    els.skills.value   = p.skills || "";

    // Clear existing dynamic entries
    els.experienceList.innerHTML = "";
    els.educationList.innerHTML = "";

    (data.experience || []).forEach(function (e) { createExperienceEntry(e); });
    (data.education || []).forEach(function (e) { createEducationEntry(e); });
  }

  /* ============================================================
     FORM VALIDATION
     ============================================================ */

  function validateField(input) {
    var errEl = document.querySelector('[data-err="' + input.id + '"]');
    var value = input.value.trim();
    var isValid = true;
    var msg = "";

    if (input.hasAttribute("required") && !value) {
      isValid = false;
      msg = "This field is required.";
    } else if (input.id === "email" && value) {
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) {
        isValid = false;
        msg = "Please enter a valid email address.";
      }
    } else if (input.id === "website" && value) {
      // Allow bare domains like linkedin.com/in/...
      if (value.indexOf(".") === -1) {
        isValid = false;
        msg = "Please enter a valid URL.";
      }
    }

    if (errEl) {
      errEl.textContent = msg;
    }
    input.classList.toggle("invalid", !isValid);
    return isValid;
  }

  function validateForm() {
    var requiredIds = ["fullName", "jobTitle", "email"];
    var allValid = true;
    requiredIds.forEach(function (id) {
      if (!validateField(els[id])) allValid = false;
    });
    return allValid;
  }

  /* ============================================================
     EXPORT — PDF
     ============================================================ */

  function exportPDF() {
    if (!validateForm()) {
      alert("Please fix the highlighted fields before exporting.");
      els.form.querySelector(".invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var d = getPersonal();
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

  /* ============================================================
     EXPORT — DOCX
     ============================================================ */

  function exportDOCX() {
    if (!validateForm()) {
      alert("Please fix the highlighted fields before exporting.");
      els.form.querySelector(".invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (typeof docx === "undefined") {
      alert("DOCX library failed to load. Check your internet connection.");
      return;
    }

    var d = getPersonal();
    var paragraphs = [];

    function push(textRun) {
      paragraphs.push(new docx.Paragraph({ children: [textRun] }));
    }
    function blank() {
      paragraphs.push(new docx.Paragraph({}));
    }
    function heading(text) {
      paragraphs.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: text, bold: true, size: 24, color: "0EA5E9" })],
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: "E0F2FE", space: 4 } },
      }));
    }

    /* Name */
    if (d.fullName) {
      push(new docx.TextRun({ text: d.fullName, bold: true, size: 36 }));
    }
    if (d.jobTitle) {
      push(new docx.TextRun({ text: d.jobTitle, italics: true, size: 24, color: "0EA5E9" }));
    }

    /* Contact */
    var contactParts = [];
    if (d.email)    contactParts.push(d.email);
    if (d.phone)    contactParts.push(d.phone);
    if (d.location) contactParts.push(d.location);
    if (d.website)  contactParts.push(d.website);
    if (contactParts.length) {
      push(new docx.TextRun({ text: contactParts.join("  |  "), size: 18, color: "64748B" }));
    }
    blank();

    /* Summary */
    if (d.summary) {
      heading("Summary");
      push(new docx.TextRun({ text: d.summary, size: 20 }));
    }

    /* Experience */
    if (state.experience.length) {
      heading("Experience");
      state.experience.forEach(function (e) {
        push(new docx.TextRun({ text: (e.role || "") + (e.company ? " · " + e.company : ""), bold: true, size: 22 }));
        if (e.start || e.end) {
          push(new docx.TextRun({ text: (e.start || "") + (e.end ? " – " + e.end : ""), italics: true, size: 18, color: "64748B" }));
        }
        if (e.description) {
          push(new docx.TextRun({ text: e.description, size: 20 }));
        }
        blank();
      });
    }

    /* Education */
    if (state.education.length) {
      heading("Education");
      state.education.forEach(function (e) {
        push(new docx.TextRun({
          text: (e.degree || "") + (e.school ? " · " + e.school : "") + (e.year ? "  (" + e.year + ")" : ""),
          size: 20,
        }));
      });
    }

    /* Skills */
    if (d.skills) {
      heading("Skills");
      push(new docx.TextRun({ text: d.skills, size: 20 }));
    }

    var fileName = (d.fullName || "resume").replace(/\s+/g, "_") + ".docx";

    var doc = new docx.Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    docx.Packer.toBlob(doc).then(function (blob) {
      saveAs(blob, fileName);
    });
  }

  /* ============================================================
     THEME SWITCHING
     ============================================================ */

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    els.themeDots.forEach(function (dot) {
      dot.classList.toggle("active", dot.getAttribute("data-theme") === theme);
    });
  }

  function initTheme() {
    var saved = "ocean";
    try { saved = localStorage.getItem(THEME_KEY) || "ocean"; } catch (e) {}
    setTheme(saved);
  }

  /* ============================================================
     SAMPLE / CLEAR
     ============================================================ */

  function loadSample() {
    applyData(SAMPLE);
    collectAndRender();
    save();
    showSaveStatus("Sample loaded");
  }

  function clearAll() {
    if (!confirm("Clear all fields? This cannot be undone.")) return;
    applyData({ personal: {}, experience: [], education: [] });
    collectAndRender();
    save();
    showSaveStatus("Cleared");
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */

  // Personal field listeners
  ["fullName", "jobTitle", "email", "phone", "location", "website", "summary", "skills"]
    .forEach(function (id) {
      els[id].addEventListener("input", function () {
        renderPreview();
        save();
      });
    });

  // Validate on blur
  ["fullName", "jobTitle", "email", "website"].forEach(function (id) {
    els[id].addEventListener("blur", function () { validateField(els[id]); });
    els[id].addEventListener("input", function () {
      if (els[id].classList.contains("invalid")) validateField(els[id]);
    });
  });

  // Add buttons
  els.addExpBtn.addEventListener("click", function () {
    createExperienceEntry();
    collectAndRender();
    save();
  });
  els.addEduBtn.addEventListener("click", function () {
    createEducationEntry();
    collectAndRender();
    save();
  });

  // Toolbar buttons
  els.exportPdf.addEventListener("click", exportPDF);
  els.exportDocx.addEventListener("click", exportDOCX);
  els.loadSample.addEventListener("click", loadSample);
  els.clearAll.addEventListener("click", clearAll);

  // Theme dots
  els.themeDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setTheme(dot.getAttribute("data-theme"));
    });
  });

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  initTheme();

  var saved = load();
  if (saved) {
    applyData(saved);
  } else {
    // Start with one empty entry each for guidance
    createExperienceEntry();
    createEducationEntry();
  }

  collectAndRender();
})();
