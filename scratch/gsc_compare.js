const { google } = require('googleapis');
const path = require('path');

const GSC_PROPERTY = 'sc-domain:atlantapoolremoval.com';
const KEY_FILE = path.join(__dirname, '..', '_secrets', 'gsc_credentials.json');

async function runCompare() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  let authClient;
  try {
    authClient = await auth.getClient();
  } catch (err) {
    console.error('Auth Failed:', err.message);
    process.exit(1);
  }

  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  // Period 1: Last 30 Days (2026-07-24 to 2026-08-23)
  // Period 2: Previous 30 Days (2026-06-24 to 2026-07-23)
  const p1Start = '2026-07-24';
  const p1End = '2026-08-23';
  const p2Start = '2026-06-24';
  const p2End = '2026-07-23';

  async function fetchStats(startDate, endDate) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_PROPERTY,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'country',
            operator: 'equals',
            expression: 'usa'
          }]
        }],
        rowLimit: 50
      }
    });
    
    const rows = res.data.rows || [];
    const totals = { clicks: 0, impressions: 0 };
    rows.forEach(r => {
      totals.clicks += r.clicks;
      totals.impressions += r.impressions;
    });
    return { totals, rows };
  }

  try {
    console.log(`Fetching Period 1 (${p1Start} to ${p1End})...`);
    const p1 = await fetchStats(p1Start, p1End);
    
    console.log(`Fetching Period 2 (${p2Start} to ${p2End})...`);
    const p2 = await fetchStats(p2Start, p2End);

    console.log('\n=== PERIOD 2 (Previous Month) ===');
    console.log(`Total Clicks: ${p2.totals.clicks}`);
    console.log(`Total Impressions: ${p2.totals.impressions}`);
    
    console.log('\n=== PERIOD 1 (Last Month) ===');
    console.log(`Total Clicks: ${p1.totals.clicks}`);
    console.log(`Total Impressions: ${p1.totals.impressions}`);
    
    console.log('\n=== TOP QUERIES (Last Month) ===');
    p1.rows.slice(0, 10).forEach(r => {
      console.log(`- "${r.keys[0]}": ${r.impressions} impr | ${r.clicks} clicks | pos ${r.position.toFixed(1)}`);
    });

  } catch (err) {
    console.error('API Error:', err.response?.data?.error?.message || err.message);
  }
}

runCompare();
