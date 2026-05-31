const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const GSC_PROPERTY = 'sc-domain:atlantapoolremoval.com';
const KEY_FILE = path.join(__dirname, '../_secrets/gsc_credentials.json');

async function pullPerformance() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  // Query window: May 23, 2026 to May 30, 2026
  const startDate = '2026-05-23';
  const endDate = '2026-05-30';

  console.log(`Pulling US performance data from ${startDate} to ${endDate}...`);

  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_PROPERTY,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query', 'page', 'country'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'country',
                operator: 'equals',
                expression: 'usa'
              }
            ]
          }
        ],
        rowLimit: 200
      }
    });

    const outputDir = path.join(__dirname, '../gsc/05-30-2026');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'raw_performance_7d_us.json'),
      JSON.stringify(res.data, null, 2)
    );

    console.log('Successfully saved raw performance data to gsc/05-30-2026/raw_performance_7d_us.json');
  } catch (err) {
    console.error('Failed to pull GSC data:', err.response?.data?.error?.message || err.message);
  }
}

pullPerformance();
