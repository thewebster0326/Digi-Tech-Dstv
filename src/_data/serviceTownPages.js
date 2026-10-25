const services = require("./services.json");
const towns = require("./towns.json");
const copy = require("./serviceTownCopy.json");

const GUIDES = {
  "dstv-installation": [
    { url: "/blog/dstv-extra-view-explained/", title: "DSTV Extra View Explained: Watch Different Channels on Every TV" },
  ],
  "dstv-repairs": [
    { url: "/blog/dstv-no-signal-troubleshooting/", title: "DSTV No Signal? Here's How to Troubleshoot It" },
  ],
  "signal-fixing": [
    { url: "/blog/dstv-no-signal-troubleshooting/", title: "DSTV No Signal? Here's How to Troubleshoot It" },
    { url: "/blog/dstv-signal-strength-100-quality-0/", title: "DSTV Signal Strength 100% but Signal Quality 0: What It Means" },
  ],
  "dish-alignment": [
    { url: "/blog/signs-dish-needs-realignment/", title: "5 Signs Your DSTV Dish Needs Realignment" },
  ],
  "extra-view-setup": [
    { url: "/blog/dstv-extra-view-explained/", title: "DSTV Extra View Explained: Watch Different Channels on Every TV" },
    { url: "/blog/dstv-extra-view-connection-guide/", title: "How to Connect DSTV Extra View: Dish, Cables and Decoder Setup" },
  ],
};

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
      const detail = require("../_content/service-detail/" + location.slug + ".js")[service.slug];
      if (!detail || !detail.body || detail.body.length < 2 || !detail.faq || detail.faq.length < 2) {
        throw new Error("Missing service detail for " + location.slug + " / " + service.slug);
      }
      pages.push({
        location,
        service,
        paragraph,
        description: firstSentence(paragraph),
        body: detail.body,
        faq: detail.faq.map(([q, a]) => ({ q, a })),
        guides: GUIDES[service.slug] || [],
        order: SELECTED_SERVICE_SLUGS.indexOf(service.slug),
      });
    }
  }
  return pages;
};
