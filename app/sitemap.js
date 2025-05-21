export default function sitemap() {
  return [
    {
      url: "https://coursetracker.ca/",
      lastModified: new Date().toISOString(),
      priority: 1.0,
    },
    {
      url: "https://coursetracker.ca/faq",
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
  ];
}
