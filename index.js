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

function displayUrl(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function getCountryLang() {
  const raw = process.env.JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG;
  if (!isTruthyStr(raw)) return "en";
  const lang = raw.trim().toLowerCase();
  return lang === "de" ? "de" : "en";
}

function getPresentLabel() {
  return getCountryLang() === "de" ? "heute" : "present";
}

function getCountryName(code) {
  if (!isTruthyStr(code)) return "";
  const region = code.trim().toUpperCase();
  if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
    try {
      const displayNames = new Intl.DisplayNames([getCountryLang()], {
        type: "region",
      });
      const name = displayNames.of(region);
      if (isTruthyStr(name) && name !== region) return name;
    } catch (_) {
      // Fall through to raw region code.
    }
  }
  return region;
}

function formatDateRange(start, end) {
  const startVal = isTruthyStr(start) ? start.trim() : "";
  let endVal = isTruthyStr(end) ? end.trim() : "";
  if (startVal && !endVal) endVal = getPresentLabel();
  return joinNonempty([startVal, endVal], " → ");
}

function formatDateRangeWithSep(start, end, sep) {
  const startVal = isTruthyStr(start) ? start.trim() : "";
  let endVal = isTruthyStr(end) ? end.trim() : "";
  if (startVal && !endVal) endVal = getPresentLabel();
  return joinNonempty([startVal, endVal], sep);
}

function joinNonempty(parts, sep) {
  const out = [];
  for (const part of parts) {
    if (isTruthyStr(part)) out.push(part.trim());
  }
  return out.join(sep);
}

function linkLabel(label, url) {
  if (!isTruthyStr(label)) return "";
  const cleanLabel = label.trim();
  if (isTruthyStr(url)) return `[${cleanLabel}](${url.trim()})`;
  return cleanLabel;
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

  const contactLines = [];

  const location = basics.location;
  if (location && typeof location === "object") {
    const countryName = isTruthyStr(location.countryCode)
      ? getCountryName(location.countryCode)
      : "";
    const loc = joinNonempty(
      [
        location.address,
        location.postalCode,
        location.city,
        location.region,
        countryName,
      ],
      ", "
    );
    if (isTruthyStr(loc)) {
      contactLines.push(`📍 ${mdEscape(loc)}`);
    }
  }

  const email = basics.email;
  if (isTruthyStr(email)) {
    const emailValue = email.trim();
    const emailText = `[${mdEscape(emailValue)}](mailto:${emailValue})`;
    contactLines.push(`✉️ ${emailText}`);
  }

  const phone = basics.phone;
  if (isTruthyStr(phone)) {
    const phoneValue = phone.trim();
    const phoneText = `[${mdEscape(phoneValue)}](tel:${phoneValue})`;
    contactLines.push(`📞 ${phoneText}`);
  }

  const url = basics.url;
  if (isTruthyStr(url)) {
    const urlValue = url.trim();
    const display = displayUrl(urlValue) || urlValue;
    const urlText = `[${mdEscape(display)}](${urlValue})`;
    contactLines.push(`🔗 ${urlText}`);
  }

  const profiles = asList(basics.profiles);
  for (const p of profiles) {
    if (!p || typeof p !== "object") continue;
    const network = isTruthyStr(p.network) ? p.network.trim() : "";
    const username = isTruthyStr(p.username) ? p.username.trim() : "";
    const profileUrl = isTruthyStr(p.url) ? p.url.trim() : "";

    let display = "";
    if (profileUrl) {
      display = displayUrl(profileUrl) || profileUrl;
    } else if (username) {
      display = username;
    } else if (network) {
      display = network;
    }

    if (!display) continue;

    const suffix = network ? ` (${mdEscape(network)})` : "";
    let profileText = "";

    if (profileUrl) {
      profileText = `[${mdEscape(display)}](${profileUrl})${suffix}`;
    } else if (username && network) {
      profileText = `${mdEscape(username)} (${mdEscape(network)})`;
    } else {
      profileText = mdEscape(display);
    }

    contactLines.push(`👤 ${profileText}`);
  }

  if (contactLines.length) {
    writeLine(lines);
    writeBullets(lines, contactLines);
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
    const location = item.location;

    let header = "";
    if (isTruthyStr(position)) {
      header = position.trim();
    } else if (isTruthyStr(name)) {
      header = linkLabel(name, url);
    } else if (isTruthyStr(url)) {
      header = url.trim();
    }

    if (isTruthyStr(header)) {
      writeHeading(lines, 3, mdEscape(header.trim()));
    }

    if (isTruthyStr(position) && isTruthyStr(name)) {
      const linkedName = linkLabel(name, url);
      writeLine(lines, `**${mdEscape(linkedName)}**`);
    }

    const dateRange = formatDateRange(start, end);
    if (isTruthyStr(dateRange)) {
      writeLine(lines);
      writeLine(lines, `*${mdEscape(dateRange)}*`);
    }

    if (isTruthyStr(location)) {
      writeLine(lines, mdEscape(location.trim()));
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

    let header = isTruthyStr(name) ? linkLabel(name, url) : "Project";
    if (!isTruthyStr(name) && isTruthyStr(url)) header = `${header} (${url.trim()})`;
    writeHeading(lines, 3, mdEscape(header.trim()));

    const dateRange = formatDateRange(start, end);
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

    const institutionLine = isTruthyStr(institution) ? institution.trim() : "";
    if (isTruthyStr(institutionLine)) writeHeading(lines, 3, mdEscape(institutionLine));

    if (isTruthyStr(area)) writeLine(lines, `**${mdEscape(area.trim())}**`);

    const dateRange = formatDateRangeWithSep(start, end, " - ");
    if (isTruthyStr(dateRange)) writeLine(lines, `*${mdEscape(dateRange)}*`);

    if (isTruthyStr(studyType)) writeLine(lines, mdEscape(studyType.trim()));

    const courses = asList(item.courses);
    if (courses.length) {
      const courseLine = courses
        .map((c) => String(c))
        .filter((c) => isTruthyStr(c))
        .map((c) => mdEscape(c.trim()))
        .join(", ");
      if (isTruthyStr(courseLine)) writeLine(lines, courseLine);
    }

    writeLine(lines);
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
      const keywordLine = keywords
        .map((k) => String(k))
        .filter((k) => isTruthyStr(k))
        .map((k) => mdEscape(k.trim()))
        .join(", ");
      writeLine(lines, keywordLine);
      writeLine(lines);
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

    const linkedName = linkLabel(name, url);
    let header = joinNonempty([linkedName, issuer], " — ");
    if (!isTruthyStr(name) && isTruthyStr(url)) {
      header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();
    }

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

    const linkedOrg = linkLabel(organization, url);
    let header = joinNonempty([position, linkedOrg], " @ ");
    if (!isTruthyStr(organization) && isTruthyStr(url)) {
      header = isTruthyStr(header) ? `${header} (${url.trim()})` : url.trim();
    }

    if (isTruthyStr(header)) writeHeading(lines, 3, mdEscape(header.trim()));

    const dateRange = formatDateRange(start, end);
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
