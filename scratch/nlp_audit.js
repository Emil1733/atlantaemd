const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/tevat/atlantaemd';
const hubs = [
    'gwinnett-county-pool-removal.html',
    'fulton-county-pool-removal.html',
    'marietta-pool-removal.html',
    'alpharetta-pool-removal.html',
    'peachtree-city-pool-removal.html'
];

const entities = [
    'Nuclear Density Testing',
    'Modified Proctor',
    'Geotechnical Engineer',
    'Silt Fence',
    'Saprolite',
    'Micaceous Silt',
    'Hydraulic Breaker',
    'Sheepsfoot Roller',
    'Compaction Affidavit',
    'Watershed Protection'
];

console.log('--- ENTITY DENSITY & NLP AUDIT ---');

hubs.forEach(hub => {
    const filePath = path.join(directoryPath, hub);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\nHub: ${hub}`);
        entities.forEach(entity => {
            const regex = new RegExp(entity, 'gi');
            const count = (content.match(regex) || []).length;
            const status = count > 0 ? '✅' : '❌';
            console.log(`  ${status} ${entity}: ${count} matches`);
        });
    }
});

console.log('\n--- NLP AUDIT COMPLETE ---');
