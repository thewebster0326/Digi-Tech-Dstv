const services = require("./services.json");
const towns = require("./towns.json");
const copy = require("./serviceTownCopy.json");

const SELECTED_SERVICE_SLUGS = [
  "dstv-installation",
  "dstv-repairs",
  "signal-fixing",
  "dish-alignment",
  "extra-view-setup",
];

module.exports = function () {
  const locations = [
    ...towns.filter((t) => t.servicePages !== false).map((t) => ({
      name: t.name,
      slug: t.slug,
      hubUrl: `/areas/${t.slug}/`,
      regionName: t.regionName,
      regionUrl: `/areas/${t.region}/`,
    })),
    {
      name: "Cape Town",
      slug: "cape-town",
      hubUrl: "/areas/cape-town/",
      regionName: null,
      regionUrl: null,
    },
  ];

  const selectedServices = services.filter((s) =>
    SELECTED_SERVICE_SLUGS.includes(s.slug)
  );

  const firstSentence = (text) => {
    const m = text.match(/^.+?[.!?](?=\s|$)/);
    return (m ? m[0] : text).trim();
  };

  const pages = [];
  for (const location of locations) {
    for (const service of selectedServices) {
      const paragraph = (copy[location.slug] && copy[location.slug][service.slug]) || "";
      pages.push({
        location,
        service,
        paragraph,
        description: firstSentence(paragraph),
      });
    }
  }
  return pages;
};
