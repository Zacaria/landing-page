// Synthetic test data: never copied by build.mjs or committed as published content.
import { pinSnapshot } from "../scripts/schema.mjs";
import { readFileSync } from "node:fs";
export function fixture() {
  const snapshot = JSON.parse(
    readFileSync(new URL("../content/published.json", import.meta.url)),
  );
  const article = {
    schemaVersion: 1,
    slug: "test-renderer",
    title: "Synthetic renderer fixture",
    excerpt: "A test of safe block rendering.",
    version: "a".repeat(64),
    publishedAt: "2000-01-01T00:00:00.000Z",
    topics: ["Rust", "Safety"],
    seo: {
      title: "Renderer fixture SEO",
      description: "Synthetic SEO for an isolated test.",
    },
    blocks: [
      { kind: "heading_1", spans: [{ text: "A safe heading" }] },
      {
        kind: "paragraph",
        spans: [
          { text: "Rich text", bold: true },
          {
            text: " with a link",
            href: "https://github.com/Zacaria",
            italic: true,
          },
        ],
      },
      { kind: "bulleted_list_item", spans: [{ text: "First bullet" }] },
      { kind: "bulleted_list_item", spans: [{ text: "Second bullet" }] },
      { kind: "numbered_list_item", spans: [{ text: "Numbered item" }] },
      { kind: "quote", spans: [{ text: "A quotation" }] },
      {
        kind: "code",
        language: "JavaScript",
        spans: [
          {
            text:
              '<script>alert("test")</script>\n' +
              "long-code-line-".repeat(100),
          },
        ],
      },
      { kind: "heading_2", spans: [{ text: "Smaller heading" }] },
      { kind: "heading_3", spans: [{ text: "Smallest heading" }] },
      { kind: "divider", spans: [] },
    ],
  };
  snapshot.articles = [
    article,
    {
      ...structuredClone(article),
      slug: "test-second",
      title: "Other synthetic note",
      topics: ["JavaScript"],
      publishedAt: "2000-01-02T00:00:00.000Z",
    },
  ];
  snapshot.site.selectedSlugs = [article.slug];
  return pinSnapshot(snapshot);
}
