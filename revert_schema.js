const fs = require('fs');

const filesToRevert = ['about.html', 'contact.html', 'cost.html', 'pool-demolition.html', 'pool-removal.html', 'atlanta-pool-removal-permits.html'];

const originalSchema = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Atlanta Pool Removal Pros",
    "image": "https://atlantapoolremoval.com/assets/hero.webp",
    "@id": "https://atlantapoolremoval.com/",
    "url": "https://atlantapoolremoval.com/",
    "telephone": "+14046490660",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1234 Roswell Rd NE",
      "addressLocality": "Atlanta",
      "addressRegion": "GA",
      "postalCode": "30319",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 33.856002,
      "longitude": -84.364376
    },
    "areaServed": [
      "Atlanta", "Marietta", "Sandy Springs", "Decatur", "Alpharetta", "Roswell"
    ]
  }
  </script>`;

filesToRevert.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const regex = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "Service"[\s\S]*?<\/script>/;
    if (regex.test(content)) {
      content = content.replace(regex, originalSchema);
      fs.writeFileSync(f, content);
      console.log('Reverted ' + f);
    }
  }
});
