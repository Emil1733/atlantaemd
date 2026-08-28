const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html') && f !== 'index.html');

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace the LocalBusiness script block.
  // We'll use a regex that captures the entire <script type="application/ld+json"> ... LocalBusiness ... </script> block.
  const regex = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "LocalBusiness"[\s\S]*?<\/script>/;

  if (regex.test(content)) {
    // Extract the city/county name from the filename.
    let locationName = f.replace('-pool-removal.html', '').replace('-pool-demolition-project.html', '').replace('-case-study.html', '').replace(/-/g, ' ');
    locationName = locationName.replace(/\b\w/g, l => l.toUpperCase()); // Capitalize

    if (locationName === 'About' || locationName === 'Contact' || locationName === 'Cost' || locationName === 'Pool Demolition' || locationName === 'Pool Removal' || locationName === 'Atlanta Pool Removal Permits') {
        // Keep these general, or maybe just skip schema replacement for them
        return;
    }

    const newSchema = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "${locationName} Pool Removal & Site Engineering",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Atlanta Pool Removal Pros",
      "@id": "https://atlantapoolremoval.com/#organization",
      "url": "https://atlantapoolremoval.com/",
      "telephone": "+14046490660"
    },
    "areaServed": {
      "@type": "City",
      "name": "${locationName}"
    },
    "url": "https://atlantapoolremoval.com/${f}"
  }
  </script>`;

    content = content.replace(regex, newSchema);
    fs.writeFileSync(filePath, content);
    console.log('Updated Schema for ' + f);
  }
});
