module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/php": "." });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/googled2e3859791012b25.html": "googled2e3859791012b25.html" });
  eleventyConfig.ignores.add("src/googled2e3859791012b25.html");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addFilter("findTown", function (townsList, name, region) {
    return townsList.find((t) => t.name === name && t.region === region) || null;
  });

  const decodeEntities = (s) => {
    let out = String(s || "");
    for (let i = 0; i < 3; i++) {
      const next = out
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      if (next === out) break;
      out = next;
    }
    return out;
  };
  eleventyConfig.addFilter("attr", function (s) {
    let t = decodeEntities(s).replace(/\s+/g, " ").trim();
    if (t.length > 158) {
      t = t.slice(0, 155).replace(/\s+\S*$/, "").replace(/[,;:\-\s]+$/, "") + "…";
    }
    return t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });

  eleventyConfig.addFilter("nearby", function (townsList, slug, regionSlug, n) {
    const group = townsList.filter((t) => t.region === regionSlug);
    const i = group.findIndex((t) => t.slug === slug);
    const out = [];
    for (let k = 1; k < group.length && out.length < n; k++) out.push(group[(i + k) % group.length]);
    return out;
  });

  eleventyConfig.addFilter("nearbyService", function (pages, locationSlug, serviceSlug, n) {
    const group = pages.filter((p) => p.service.slug === serviceSlug);
    const i = group.findIndex((p) => p.location.slug === locationSlug);
    const out = [];
    for (let k = 1; k < group.length && out.length < n; k++) out.push(group[(i + k) % group.length]);
    return out;
  });

  eleventyConfig.addFilter("otherServices", function (pages, locationSlug, serviceSlug) {
    return pages.filter((p) => p.location.slug === locationSlug && p.service.slug !== serviceSlug);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
  };
};
