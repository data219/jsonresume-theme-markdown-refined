const test = require("node:test");
const assert = require("node:assert/strict");
const theme = require("../index.js");

test("renders contact info with emoji icons, markdown links, and country name mapping", () => {
  const resume = {
    basics: {
      name: "Jan Markmann",
      email: "jan@markmann.work",
      url: "https://data219.github.io",
      location: {
        city: "Eime",
        countryCode: "DE",
      },
      profiles: [
        {
          network: "LinkedIn",
          url: "https://www.linkedin.com/in/jan-markmann",
        },
      ],
    },
  };

  const output = theme.render(resume);
  const lines = output.split("\n");

  const expectedLines = [
    "- 📍 Eime, Germany",
    "- ✉️ [jan@markmann.work](mailto:jan@markmann.work)",
    "- 🔗 [data219.github.io](https://data219.github.io)",
    "- 👤 [www.linkedin.com/in/jan-markmann](https://www.linkedin.com/in/jan-markmann) (LinkedIn)",
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
        name: "Jan Markmann",
        location: {
          city: "Eime",
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
      lines.includes("- 📍 Eime, Deutschland"),
      "Expected German country name for DE"
    );
    assert.ok(
      lines.includes("2020-01 → heute"),
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
