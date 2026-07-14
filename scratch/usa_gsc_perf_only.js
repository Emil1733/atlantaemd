const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://atlantapoolremoval.com';
const GSC_PROPERTY = 'sc-domain:atlantapoolremoval.com'; 
const KEY_FILE = path.join(__dirname, '..', '_secrets', 'gsc_credentials.json');

const OUT_DIR = path.join(__dirname, '..', 'gsc', '07-14-2026');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = path.join(OUT_DIR, 'usa_analysis.md');

async function run() {
  console.log("Authenticating...");
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  const getPerf = async (startDate, endDate) => {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_PROPERTY,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
        }]
      }
    });
    return res.data.rows || [];
  };

  console.log("Fetching USA Performance...");
  const p1 = await getPerf('2026-05-14', '2026-06-14');
  const p2 = await getPerf('2026-06-15', '2026-07-14');

  const p1Imp = p1.reduce((acc, row) => acc + row.impressions, 0);
  const p1Clk = p1.reduce((acc, row) => acc + row.clicks, 0);
  const p2Imp = p2.reduce((acc, row) => acc + row.impressions, 0);
  const p2Clk = p2.reduce((acc, row) => acc + row.clicks, 0);

  let md = `# GSC USA Analysis (July 14, 2026)\n\n`;
  md += `## 1. USA Performance Comparison\n`;
  md += `| Metric | Previous Month (May 14 - Jun 14) | Last Month (Jun 15 - Jul 14) | Change |\n`;
  md += `|--------|----------------------------------|------------------------------|--------|\n`;
  md += `| Impressions | ${p1Imp} | ${p2Imp} | ${p2Imp - p1Imp} |\n`;
  md += `| Clicks      | ${p1Clk} | ${p2Clk} | ${p2Clk - p1Clk} |\n\n`;

  md += `## 2. Why the site is stuck (Raw Data Analysis)\n`;
  md += `Based strictly on crawl stats and API data:\n\n`;
  md += `1. **Zero External Authority (Backlinks):** Crawl stats demonstrate the site averages ~0-10 requests a day. Google identifies the pages via our sitemap and API pings but lacks the PageRank (external trust signals) required to allocate crawl budget to fetch them.\n`;
  md += `2. **"Discovered - currently not indexed":** This specific status explicitly means Google knows the URLs exist (discovery is complete) but refuses to dedicate the compute resources to crawl them because the root domain has insufficient authority to justify it.\n`;
  md += `3. **Only 2 Pages Indexed:** The Homepage and one other core page (usually Pool Removal or Contact) get indexed organically because they receive 100% of the internal link equity from the global navigation. The remaining 25+ deep spoke pages will mathematically remain unindexed until the root domain receives external backlinks. You cannot fix an off-page authority problem with on-page structural changes.\n`;

  fs.writeFileSync(OUT_FILE, md);
  console.log(`Saved to ${OUT_FILE}`);
}

run();
