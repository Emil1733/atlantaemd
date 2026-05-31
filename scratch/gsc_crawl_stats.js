/**
 * GSC Crawl Stats Audit
 * Pulls: site info, sitemaps, crawl error counts, crawl error samples
 */
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://atlantapoolremoval.com';
const GSC_PROPERTY_DOMAIN = 'sc-domain:atlantapoolremoval.com';
const KEY_FILE = path.join(__dirname, '../_secrets/gsc_credentials.json');
const OUTPUT_DIR = path.join(__dirname, '../gsc/05-30-2026');

async function runCrawlStats() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  const report = {};

  // ── 1. SITE LIST ──────────────────────────────────────────────────────────
  console.log('\n=== 1. VERIFIED SITES ===');
  try {
    const sites = await webmasters.sites.list();
    const siteList = sites.data.siteEntry || [];
    console.log(`Total verified properties: ${siteList.length}`);
    siteList.forEach(s => console.log(`  [${s.permissionLevel}] ${s.siteUrl}`));
    report.sites = siteList;
  } catch (err) {
    console.error('Sites list failed:', err.response?.data?.error?.message || err.message);
  }

  // ── 2. SITEMAPS ───────────────────────────────────────────────────────────
  console.log('\n=== 2. SITEMAPS ===');
  try {
    const sitemaps = await webmasters.sitemaps.list({ siteUrl: SITE_URL });
    const maps = sitemaps.data.sitemap || [];
    if (maps.length === 0) {
      console.log('❌ NO SITEMAPS SUBMITTED — this is likely why indexation is slow!');
      report.sitemaps = [];
    } else {
      maps.forEach(sm => {
        console.log(`  URL: ${sm.path}`);
        console.log(`  Type: ${sm.type} | Contents: ${sm.contents?.map(c => `${c.type}:${c.submitted}/${c.indexed}`).join(', ')}`);
        console.log(`  Last Submitted: ${sm.lastSubmitted} | Last Downloaded: ${sm.lastDownloaded}`);
        console.log(`  Errors: ${sm.errors || 0} | Warnings: ${sm.warnings || 0}`);
      });
      report.sitemaps = maps;
    }
  } catch (err) {
    console.error('Sitemaps failed:', err.response?.data?.error?.message || err.message);
    report.sitemaps = 'error';
  }

  // ── 3. CRAWL ERROR COUNTS ─────────────────────────────────────────────────
  console.log('\n=== 3. CRAWL ERROR COUNTS (Desktop) ===');
  const errorCategories = ['notFound', 'serverError', 'soft404', 'authPermissions', 'manyToOneRedirect', 'flashContent', 'notFollowed'];
  report.crawlErrors = {};

  for (const category of errorCategories) {
    try {
      const res = await webmasters.urlcrawlerrorscounts.query({
        siteUrl: SITE_URL,
        category,
        platform: 'web',
        latestCountsOnly: true
      });
      const count = res.data.countPerTypes?.[0]?.entries?.[0]?.count || 0;
      if (count > 0) {
        console.log(`  [!] ${category}: ${count} errors`);
      } else {
        console.log(`  [OK] ${category}: 0`);
      }
      report.crawlErrors[category] = count;
    } catch (err) {
      console.log(`  [SKIP] ${category}: ${err.response?.data?.error?.message || err.message}`);
      report.crawlErrors[category] = 'skip';
    }
  }

  // ── 4. CRAWL ERROR SAMPLES (notFound/404s) ────────────────────────────────
  console.log('\n=== 4. CRAWL ERROR SAMPLES (404s) ===');
  try {
    const samples = await webmasters.urlcrawlerrorssamples.list({
      siteUrl: SITE_URL,
      category: 'notFound',
      platform: 'web'
    });
    const urls = samples.data.urlCrawlErrorDetail || [];
    if (urls.length === 0) {
      console.log('  ✅ No 404 crawl errors detected.');
    } else {
      console.log(`  Found ${urls.length} 404 error URL(s):`);
      urls.forEach(u => console.log(`    - ${u.pageUrl} (first detected: ${u.firstDetected})`));
    }
    report.crawlError404Samples = urls;
  } catch (err) {
    console.log('  404 samples:', err.response?.data?.error?.message || err.message);
    report.crawlError404Samples = 'error';
  }

  // ── 5. SEARCH ANALYTICS COVERAGE OVERVIEW ────────────────────────────────
  console.log('\n=== 5. SEARCH ANALYTICS — 30-DAY OVERVIEW ===');
  try {
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() - 30);
    const fmt = d => d.toISOString().split('T')[0];

    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_PROPERTY_DOMAIN,
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(today),
        dimensions: ['page'],
        rowLimit: 50,
        dimensionFilterGroups: [{
          filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
        }]
      }
    });

    const rows = res.data.rows || [];
    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
    const pagesWithImpressions = rows.filter(r => r.impressions > 0).length;

    console.log(`  Pages with GSC impressions (USA): ${pagesWithImpressions}`);
    console.log(`  Total Impressions (30d): ${totalImpressions}`);
    console.log(`  Total Clicks (30d): ${totalClicks}`);
    console.log(`  Avg CTR: ${totalImpressions > 0 ? ((totalClicks/totalImpressions)*100).toFixed(2) : 0}%`);
    console.log('\n  Page breakdown:');
    rows.sort((a,b) => b.impressions - a.impressions).forEach(r => {
      const page = r.keys[0].replace('https://atlantapoolremoval.com', '') || '/';
      console.log(`    ${page.padEnd(55)} impressions: ${String(r.impressions).padStart(4)} | pos: ${r.position.toFixed(1)}`);
    });

    report.searchAnalytics30d = { totalClicks, totalImpressions, pagesWithImpressions, rows };
  } catch (err) {
    console.error('Search analytics failed:', err.response?.data?.error?.message || err.message);
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'crawl_stats.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\n✅ Saved crawl_stats.json to gsc/05-30-2026/');
  console.log('\n=== AUDIT COMPLETE ===');
}

runCrawlStats().catch(console.error);
