const fs = require('fs');

const dates = {
    "machinery": { "fr": "Application : 20 janvier 2027", "en": "Application: January 20, 2027" },
    "gdpr": { "fr": "En vigueur depuis : 25 mai 2018", "en": "In force since: May 25, 2018" },
    "cra": { "fr": "Application progressive : 11 décembre 2027", "en": "Progressive application: December 11, 2027" },
    "espr": { "fr": "Application : 18 juillet 2024", "en": "Application: July 18, 2024" },
    "data_act": { "fr": "Application : 12 septembre 2025", "en": "Application: September 12, 2025" },
    "batteries": { "fr": "Application progressive : 18 février 2024 - 18 août 2025", "en": "Progressive application: February 18, 2024 - August 18, 2025" },
    "cpr": { "fr": "En vigueur depuis : 1er juillet 2013", "en": "In force since: July 1, 2013" }
};

const data = JSON.parse(fs.readFileSync('c:\\\\Projects\\\\jeanpierrecharles\\\\data\\\\regulation-questionnaires.json', 'utf8'));

for (const [module, moduleDates] of Object.entries(dates)) {
    if (data[module]) {
        for (const [lang, date] of Object.entries(moduleDates)) {
            if (data[module][lang] && !data[module][lang].dateApplication) {
                data[module][lang].dateApplication = date;
            }
        }
    }
}

fs.writeFileSync('c:\\\\Projects\\\\jeanpierrecharles\\\\data\\\\regulation-questionnaires.json', JSON.stringify(data, null, 4), 'utf8');
console.log('✅ Dates added!');
