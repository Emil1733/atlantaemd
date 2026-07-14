# 30-Point Technical & On-Page SEO Checklist

## Architecture & Crawlability
1. [ ] **robots.txt Valid**: Exists, valid syntax, doesn't block essential pages.
2. [ ] **sitemap.xml Valid**: Exists, matches exactly the live HTML files, valid XML.
3. [ ] **No `noindex` Tags**: Ensure no accidental `<meta name="robots" content="noindex">` tags exist.
4. [ ] **Canonical Tags**: `<link rel="canonical" href="...">` exists on every page and is self-referencing.
5. [ ] **Broken Internal Links**: Zero 404 links within the site navigation or body content.
6. [ ] **URL Structure**: URLs are lowercase, use hyphens (no underscores), and don't contain parameters.
7. [ ] **Click Depth**: All pages are reachable within 3 clicks from the homepage.
8. [ ] **HTTPS / Mixed Content**: All internal links use `https://` (no `http://`).

## HTML Elements & Meta Tags
9. [ ] **Title Tags Present**: Every page has a `<title>`.
10. [ ] **Title Tag Length & Duplication**: Titles are 30-60 characters and completely unique across the site.
11. [ ] **Meta Description Present**: Every page has a `<meta name="description">`.
12. [ ] **Meta Description Length**: Descriptions are 120-160 characters.
13. [ ] **Viewport Meta Tag**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present for mobile rendering.
14. [ ] **Charset Declared**: `<meta charset="UTF-8">` is present.
15. [ ] **Language Declared**: `<html lang="en">` is present.
16. [ ] **Favicon Linked**: Favicon is correctly linked to prevent 404s.

## Content & Headings
17. [ ] **H1 Presence**: Every page has exactly one `<h1>` tag.
18. [ ] **Heading Hierarchy**: H2 and H3 tags are used logically, not skipping levels.
19. [ ] **Thin Content Check**: Every page has at least 500 words of text content.
20. [ ] **Image Alt Text**: Every `<img>` tag has a descriptive `alt="..."` attribute.
21. [ ] **Anchor Text Descriptiveness**: No generic "click here" or "read more" links.
22. [ ] **Keyword Cannibalization**: Primary target keyword is unique per page (no competing pages).

## Structured Data & Social
23. [ ] **Schema.org Markup**: Valid JSON-LD (LocalBusiness or Service) on every page.
24. [ ] **OpenGraph Tags**: `og:title`, `og:description`, `og:url`, `og:image` are present.
25. [ ] **Twitter Cards**: `twitter:card` is present.

## Performance & Rendering
26. [ ] **Image Optimization**: All images are modern formats (WebP) or compressed PNG/JPG.
27. [ ] **Asset File Sizes**: No massive (1MB+) uncompressed image files.
28. [ ] **CSS/JS Blocking**: Minimal inline blocking scripts; CSS is externalized where possible.
29. [ ] **HTML Validation**: No severely malformed HTML tags that break DOM rendering.
30. [ ] **Trailing Slash Consistency**: Links either consistently use or do not use trailing slashes.
