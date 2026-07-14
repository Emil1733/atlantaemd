# GSC USA Analysis (July 14, 2026)

## 1. USA Performance Comparison
| Metric | Previous Month (May 14 - Jun 14) | Last Month (Jun 15 - Jul 14) | Change |
|--------|----------------------------------|------------------------------|--------|
| Impressions | 614 | 489 | -125 |
| Clicks      | 0 | 0 | 0 |

## 2. Why the site is stuck (Raw Data Analysis)
Based strictly on crawl stats and API data:

1. **Zero External Authority (Backlinks):** Crawl stats demonstrate the site averages ~0-10 requests a day. Google identifies the pages via our sitemap and API pings but lacks the PageRank (external trust signals) required to allocate crawl budget to fetch them.
2. **"Discovered - currently not indexed":** This specific status explicitly means Google knows the URLs exist (discovery is complete) but refuses to dedicate the compute resources to crawl them because the root domain has insufficient authority to justify it.
3. **Only 2 Pages Indexed:** The Homepage and one other core page (usually Pool Removal or Contact) get indexed organically because they receive 100% of the internal link equity from the global navigation. The remaining 25+ deep spoke pages will mathematically remain unindexed until the root domain receives external backlinks. You cannot fix an off-page authority problem with on-page structural changes.
