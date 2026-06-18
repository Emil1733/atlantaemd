const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'sc-domain:atlantapoolremoval.com';
const KEY_FILE = path.join(__dirname, '../_secrets/gsc_credentials.json');
const OUTPUT_DIR = path.join(__dirname, '../gsc/06-18-2026');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runComparison() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  // Date ranges
  const today = new Date('2026-06-18T00:00:00Z');
  
  const endCurrent = new Date(today);
  const startCurrent = new Date(today);
  startCurrent.setDate(startCurrent.getDate() - 30);
  
  const endPrev = new Date(startCurrent);
  endPrev.setDate(endPrev.getDate() - 1);
  const startPrev = new Date(endPrev);
  startPrev.setDate(startPrev.getDate() - 30);

  const fmt = d => d.toISOString().split('T')[0];

  console.log(`Current Period: ${fmt(startCurrent)} to ${fmt(endCurrent)}`);
  console.log(`Previous Period: ${fmt(startPrev)} to ${fmt(endPrev)}`);

  async function pullData(startDate, endDate, dimensions) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: 100,
        dimensionFilterGroups: [{
          filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
        }]
      }
    });
    return res.data.rows || [];
  }

  // 1. Overall stats
  const curOverall = await pullData(fmt(startCurrent), fmt(endCurrent), ['date']);
  const prevOverall = await pullData(fmt(startPrev), fmt(endPrev), ['date']);

  const sumStats = (rows) => rows.reduce((acc, row) => {
    acc.clicks += row.clicks;
    acc.impressions += row.impressions;
    return acc;
  }, { clicks: 0, impressions: 0 });

  const curTotals = sumStats(curOverall);
  const prevTotals = sumStats(prevOverall);

  // 2. By Query
  const curQueries = await pullData(fmt(startCurrent), fmt(endCurrent), ['query']);
  const prevQueries = await pullData(fmt(startPrev), fmt(endPrev), ['query']);

  // 3. By Page
  const curPages = await pullData(fmt(startCurrent), fmt(endCurrent), ['page']);
  const prevPages = await pullData(fmt(startPrev), fmt(endPrev), ['page']);

  const report = {
    dates: {
      current: { start: fmt(startCurrent), end: fmt(endCurrent) },
      previous: { start: fmt(startPrev), end: fmt(endPrev) }
    },
    totals: {
      current: curTotals,
      previous: prevTotals
    },
    queries: { current: curQueries, previous: prevQueries },
    pages: { current: curPages, previous: prevPages }
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'compare_30d.json'), JSON.stringify(report, null, 2));
  console.log('✅ Data saved to compare_30d.json');
}

runComparison().catch(console.error);
