function isTruthyStr(value) {
  return typeof value === "string" && value.trim() !== "";
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function get(obj, ...keys) {
  let cur = obj;
  for (const key of keys) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[key];
  }
  return cur;
}

function mdEscape(text) {
  let out = String(text ?? "");
  out = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  out = out.replace(/[\t\u00a0]+/g, " ");
  return out;
}

function joinNonempty(parts, sep) {
  const out = [];
  for (const part of parts) {
    if (isTruthyStr(part)) out.push(part.trim());
  }
  return out.join(sep);
}

function writeLine(lines, line = "") {
  lines.push(line);
}

function writeHeading(lines, level, title) {
  writeLine(lines, `${"#".repeat(level)} ${title}`);
}

function writeKvInline(lines, label, value) {
  if (isTruthyStr(value)) {
    writeLine(lines, `- **${label}**: ${mdEscape(value.trim())}`);
  }
}

function writeBullets(lines, items) {
  let wroteAny = false;
  for (const item of items) {
    if (isTruthyStr(item)) {
      writeLine(lines, `- ${mdEscape(item.trim())}`);
      wroteAny = true;
    }
  }
  if (wroteAny) writeLine(lines);
}

function renderBasics(lines, data) {
  const basics = get(data, "basics");
  if (!basics || typeof basics !== "object") return;

  const name = basics.name;
  const label = basics.label;
  const headline = joinNonempty([name, label], " — ");

  if (isTruthyStr(headline)) {
    writeHeading(lines, 1, mdEscape(headline.trim()));
  } else if (isTruthyStr(name)) {
    writeHeading(lines, 1, mdEscape(name.trim()));
  } else {
    writeHeading(lines, 1, "Resume");
  }

  const summary = basics.summary;
  if (isTruthyStr(summary)) {
    writeLine(lines);
    writeLine(lines, mdEscape(summary.trim()));
  }

  const contactBits = [];
  for (const key of ["email", "phone", "url"]) {
    const val = basics[key];
    if (isTruthyStr(val)) contactBits.push(val.trim());
  }

  const location = basics.location;
  if (location && typeof location === "object") {
    const loc = joinNonempty(
      [
        location.address,
        location.postalCode,
        location.city,
        location.region,
        location.countryCode,
      ],
      ", "
    );
    if (isTruthyStr(loc)) contactBits.push(loc);
  }

  const profiles = asList(basics.profiles);
  const profileBits = [];
  for (const p of profiles) {
    if (!p || typeof p !== "object") continue;
    const network = p.network;
    const username = p.username;
    const url = p.url;
    const label = joinNonempty([network, username], ": ");
    if (isTruthyStr(url) && isTruthyStr(label)) {
      profileBits.push(`${label} (${url.trim()})`);
    } else if (isTruthyStr(url)) {
      profileBits.push(url.trim());
    } else if (isTruthyStr(label)) {
      profileBits.push(label);
    }
  }

  if (contactBits.length || profileBits.length) {
    writeLine(lines);
    if (contactBits.length) writeBullets(lines, contactBits);
    if (profileBits.length) writeBullets(lines, profileBits);
  }
}

function renderWork(lines, data) {
  const work = asList(get(data, "work"));
  if (!work.length) return;

  writeHeading(lines, 2, "Work Experience");
  writeLine(lines);

  for (const item of work) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const position = item.position;
    const url = item.url;
    const start = item.startDate;
    const end = item.endDate;

    let header = joinNonempty([position, name], " @ ");
    if (isTruthyStr(url)) {
      header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();
    }

    if (isTruthyStr(header)) {
      writeHeading(lines, 3, mdEscape(header.trim()));
    }

    const dateRange = joinNonempty([start, end], " → ");
    if (isTruthyStr(dateRange)) {
      writeLine(lines, mdEscape(dateRange));
    }

    const summary = item.summary;
    if (isTruthyStr(summary)) {
      writeLine(lines);
      writeLine(lines, mdEscape(summary.trim()));
    }

    const highlights = asList(item.highlights);
    if (highlights.length) {
      writeLine(lines);
      writeBullets(lines, highlights.map((h) => String(h)));
    } else {
      writeLine(lines);
    }
  }
}

function renderProjects(lines, data) {
  const projects = asList(get(data, "projects"));
  if (!projects.length) return;

  writeHeading(lines, 2, "Projects");
  writeLine(lines);

  for (const item of projects) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const description = item.description;
    const url = item.url;
    const start = item.startDate;
    const end = item.endDate;

    let header = isTruthyStr(name) ? name.trim() : "Project";
    if (isTruthyStr(url)) header = `${header} (${url.trim()})`;
    writeHeading(lines, 3, mdEscape(header));

    const dateRange = joinNonempty([start, end], " → ");
    if (isTruthyStr(dateRange)) writeLine(lines, mdEscape(dateRange));

    if (isTruthyStr(description)) {
      writeLine(lines);
      writeLine(lines, mdEscape(description.trim()));
    }

    const highlights = asList(item.highlights);
    if (highlights.length) {
      writeLine(lines);
      writeBullets(lines, highlights.map((h) => String(h)));
    } else {
      writeLine(lines);
    }
  }
}

function renderEducation(lines, data) {
  const education = asList(get(data, "education"));
  if (!education.length) return;

  writeHeading(lines, 2, "Education");
  writeLine(lines);

  for (const item of education) {
    if (!item || typeof item !== "object") continue;

    const institution = item.institution;
    const area = item.area;
    const studyType = item.studyType;
    const start = item.startDate;
    const end = item.endDate;

    let header = joinNonempty([studyType, area], " ");
    if (isTruthyStr(institution) && isTruthyStr(header)) {
      header = `${header} — ${institution.trim()}`;
    } else if (isTruthyStr(institution)) {
      header = institution.trim();
    }

    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    const dateRange = joinNonempty([start, end], " → ");
    if (isTruthyStr(dateRange)) writeLine(lines, mdEscape(dateRange));

    const gpa = item.gpa;
    writeLine(lines);
    writeKvInline(lines, "GPA", gpa !== undefined && gpa !== null ? String(gpa) : null);

    const courses = asList(item.courses);
    if (courses.length) {
      writeLine(lines);
      writeBullets(lines, courses.map((c) => String(c)));
    } else {
      writeLine(lines);
    }
  }
}

function renderSkills(lines, data) {
  const skills = asList(get(data, "skills"));
  if (!skills.length) return;

  writeHeading(lines, 2, "Skills");
  writeLine(lines);

  for (const item of skills) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const level = item.level;
    const keywords = asList(item.keywords);

    const header = joinNonempty([name, level], " — ");
    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    if (keywords.length) {
      writeLine(lines);
      writeBullets(lines, keywords.map((k) => String(k)));
    } else {
      writeLine(lines);
    }
  }
}

function renderLanguages(lines, data) {
  const languages = asList(get(data, "languages"));
  if (!languages.length) return;

  writeHeading(lines, 2, "Languages");
  writeLine(lines);

  for (const item of languages) {
    if (!item || typeof item !== "object") continue;

    const language = item.language;
    const fluency = item.fluency;
    const val = joinNonempty([language, fluency], " — ");
    if (isTruthyStr(val)) writeLine(lines, `- ${mdEscape(val.trim())}`);
  }

  writeLine(lines);
}

function renderInterests(lines, data) {
  const interests = asList(get(data, "interests"));
  if (!interests.length) return;

  writeHeading(lines, 2, "Interests");
  writeLine(lines);

  for (const item of interests) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const keywords = asList(item.keywords);
    if (isTruthyStr(name)) {
      if (keywords.length) {
        const kw = keywords
          .map((k) => String(k))
          .filter((k) => isTruthyStr(k))
          .map((k) => mdEscape(k.trim()))
          .join(", ");
        writeLine(lines, `- **${mdEscape(name.trim())}**: ${kw}`);
      } else {
        writeLine(lines, `- ${mdEscape(name.trim())}`);
      }
    }
  }

  writeLine(lines);
}

function renderAwards(lines, data) {
  const awards = asList(get(data, "awards"));
  if (!awards.length) return;

  writeHeading(lines, 2, "Awards");
  writeLine(lines);

  for (const item of awards) {
    if (!item || typeof item !== "object") continue;

    const title = item.title;
    const awarder = item.awarder;
    const date = item.date;
    const summary = item.summary;

    const header = joinNonempty([title, awarder], " — ");
    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    if (isTruthyStr(date)) writeLine(lines, mdEscape(date.trim()));

    if (isTruthyStr(summary)) {
      writeLine(lines);
      writeLine(lines, mdEscape(summary.trim()));
    }

    writeLine(lines);
  }
}

function renderCertificates(lines, data) {
  const certs = asList(get(data, "certificates"));
  if (!certs.length) return;

  writeHeading(lines, 2, "Certificates");
  writeLine(lines);

  for (const item of certs) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const issuer = item.issuer;
    const date = item.date;
    const url = item.url;

    let header = joinNonempty([name, issuer], " — ");
    if (isTruthyStr(url)) header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();

    if (isTruthyStr(header)) {
      writeLine(lines, `- ${mdEscape(header.trim())}`);
      if (isTruthyStr(date)) writeLine(lines, `  - ${mdEscape(date.trim())}`);
    }
  }

  writeLine(lines);
}

function renderPublications(lines, data) {
  const pubs = asList(get(data, "publications"));
  if (!pubs.length) return;

  writeHeading(lines, 2, "Publications");
  writeLine(lines);

  for (const item of pubs) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const publisher = item.publisher;
    const release = item.releaseDate;
    const url = item.url;
    const summary = item.summary;

    let header = joinNonempty([name, publisher], " — ");
    if (isTruthyStr(url)) header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();

    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    if (isTruthyStr(release)) writeLine(lines, mdEscape(release.trim()));

    if (isTruthyStr(summary)) {
      writeLine(lines);
      writeLine(lines, mdEscape(summary.trim()));
    }

    writeLine(lines);
  }
}

function renderVolunteer(lines, data) {
  const volunteer = asList(get(data, "volunteer"));
  if (!volunteer.length) return;

  writeHeading(lines, 2, "Volunteer");
  writeLine(lines);

  for (const item of volunteer) {
    if (!item || typeof item !== "object") continue;

    const organization = item.organization;
    const position = item.position;
    const url = item.url;
    const start = item.startDate;
    const end = item.endDate;
    const summary = item.summary;
    const highlights = asList(item.highlights);

    let header = joinNonempty([position, organization], " @ ");
    if (isTruthyStr(url)) header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();

    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    const dateRange = joinNonempty([start, end], " → ");
    if (isTruthyStr(dateRange)) writeLine(lines, mdEscape(dateRange));

    if (isTruthyStr(summary)) {
      writeLine(lines);
      writeLine(lines, mdEscape(summary.trim()));
    }

    if (highlights.length) {
      writeLine(lines);
      writeBullets(lines, highlights.map((h) => String(h)));
    } else {
      writeLine(lines);
    }
  }
}

function renderReferences(lines, data) {
  const refs = asList(get(data, "references"));
  if (!refs.length) return;

  writeHeading(lines, 2, "References");
  writeLine(lines);

  for (const item of refs) {
    if (!item || typeof item !== "object") continue;

    const name = item.name;
    const reference = item.reference;
    if (isTruthyStr(name)) writeHeading(lines, 3, mdEscape(name.trim()));
    if (isTruthyStr(reference)) {
      writeLine(lines);
      writeLine(lines, mdEscape(reference.trim()));
    }
    writeLine(lines);
  }
}

function renderMarkdown(data) {
  const lines = [];

  renderBasics(lines, data);
  renderWork(lines, data);
  renderProjects(lines, data);
  renderVolunteer(lines, data);
  renderEducation(lines, data);
  renderSkills(lines, data);
  renderLanguages(lines, data);
  renderInterests(lines, data);
  renderAwards(lines, data);
  renderCertificates(lines, data);
  renderPublications(lines, data);
  renderReferences(lines, data);

  const text = lines.map((line) => line.replace(/\s+$/, "")).join("\n").replace(/\s+$/, "") + "\n";
  return text;
}

module.exports = {
  render: function (resume) {
    return renderMarkdown(resume || {});
  },
};
