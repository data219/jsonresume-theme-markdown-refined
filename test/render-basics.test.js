const test = require("node:test");
const assert = require("node:assert/strict");
const theme = require("../index.js");

test("renders contact info with emoji icons, markdown links, and country name mapping", () => {
  const resume = {
    basics: {
      name: "Alex Doe",
      email: "alex@example.com",
      url: "https://example.dev",
      location: {
        city: "Sampletown",
        countryCode: "DE",
      },
      profiles: [
        {
          network: "LinkedIn",
          url: "https://www.linkedin.com/in/alex-doe",
        },
      ],
    },
  };

  const output = theme.render(resume);
  const lines = output.split("\n");

  const expectedLines = [
    "- 📍 Sampletown, Germany",
    "- ✉️ [alex@example.com](mailto:alex@example.com)",
    "- 🔗 [example.dev](https://example.dev)",
    "- 👤 [www.linkedin.com/in/alex-doe](https://www.linkedin.com/in/alex-doe) (LinkedIn)",
  ];

  let lastIndex = -1;
  for (const expected of expectedLines) {
    const index = lines.indexOf(expected);
    assert.ok(index > lastIndex, `Expected line not found in order: ${expected}`);
    lastIndex = index;
  }
});

test("uses german labels for country name and present date when env is set", () => {
  const originalLang = process.env.JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG;
  process.env.JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG = "DE";

  try {
    const resume = {
      basics: {
        name: "Alex Doe",
        location: {
          city: "Sampletown",
          countryCode: "DE",
        },
      },
      work: [
        {
          name: "ACME",
          position: "Engineer",
          startDate: "2020-01",
        },
      ],
    };

    const output = theme.render(resume);
    const lines = output.split("\n");

    assert.ok(
      lines.includes("- 📍 Sampletown, Deutschland"),
      "Expected German country name for DE"
    );
    assert.ok(
      lines.includes("*2020-01 → heute*"),
      "Expected German present label for missing end date"
    );
  } finally {
    if (originalLang === undefined) {
      delete process.env.JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG;
    } else {
      process.env.JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG = originalLang;
    }
  }
});

test("links entity names when urls are present in work, projects, volunteer, and certificates", () => {
  const resume = {
    basics: {
      name: "Alex Doe",
    },
    work: [
      {
        name: "Graph-IT GmbH",
        position: "Senior Software Developer",
        url: "https://graph-it.com/",
        startDate: "2021-01",
        endDate: "2023-06",
        location: "Berlin, Germany",
      },
    ],
    projects: [
      {
        name: "Resume Revamp",
        url: "https://example.com/project",
      },
    ],
    volunteer: [
      {
        organization: "Code Club",
        position: "Mentor",
        url: "https://codeclub.example",
      },
    ],
    certificates: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon",
        url: "https://aws.example",
      },
    ],
  };

  const output = theme.render(resume);
  const lines = output.split("\n");

  assert.ok(
    lines.includes("### Senior Software Developer"),
    "Expected work heading to include position only"
  );
  assert.ok(
    lines.includes("**[Graph-IT GmbH](https://graph-it.com/)**"),
    "Expected work company name to be bold and linked"
  );
  assert.ok(
    lines.includes("*2021-01 → 2023-06*"),
    "Expected work date range to be italic"
  );
  assert.ok(
    lines.includes("Berlin, Germany"),
    "Expected work location line after date"
  );
  assert.ok(
    lines.includes("### [Resume Revamp](https://example.com/project)"),
    "Expected project name to be linked"
  );
  assert.ok(
    lines.includes("### Mentor @ [Code Club](https://codeclub.example)"),
    "Expected volunteer organization to be linked"
  );
  assert.ok(
    lines.includes(
      "- [AWS Certified Developer](https://aws.example) — Amazon"
    ),
    "Expected certificate name to be linked"
  );
});

test("renders skill keywords as a single comma-separated line with empty line when missing", () => {
  const resume = {
    basics: {
      name: "Alex Doe",
    },
    skills: [
      {
        name: "Backend",
        level: "Senior",
        keywords: ["PHP", "Symfony", "PostgreSQL"],
      },
      {
        name: "Cloud",
      },
    ],
  };

  const output = theme.render(resume);
  const lines = output.split("\n");

  assert.ok(
    lines.includes("### Backend — Senior"),
    "Expected skill heading for Backend"
  );
  assert.ok(
    lines.includes("PHP, Symfony, PostgreSQL"),
    "Expected keywords to be comma-separated on one line"
  );
  const cloudIndex = lines.indexOf("### Cloud");
  assert.ok(cloudIndex !== -1, "Expected skill heading for Cloud");
  assert.strictEqual(
    lines[cloudIndex + 1],
    "",
    "Expected empty line after Cloud when no keywords"
  );
});

test("renders education entries with institution heading, bold area, italic dates, and study type", () => {
  const resume = {
    basics: {
      name: "Alex Doe",
    },
    education: [
      {
        institution: "State University",
        area: "Computer Science",
        studyType: "BSc",
        startDate: "2016",
        endDate: "2020",
        courses: ["Algorithms", "Distributed Systems"],
      },
    ],
  };

  const output = theme.render(resume);
  const lines = output.split("\n");

  assert.ok(
    lines.includes("### State University"),
    "Expected institution heading"
  );
  assert.ok(lines.includes("**Computer Science**"), "Expected bold area line");
  assert.ok(
    lines.includes("*2016 - 2020*"),
    "Expected italic date range with hyphen"
  );
  assert.ok(lines.includes("BSc"), "Expected study type line");
  assert.ok(
    lines.includes("Algorithms, Distributed Systems"),
    "Expected courses as final line"
  );
});
