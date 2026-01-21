import json

# Dates d'application par module
dates = {
    "ai_act": {
        "fr": "Application progressive : 2 août 2026 - 2 août 2027",
        "en": "Progressive application: August 2, 2026 - August 2, 2027"
    },
    "machinery": {
        "fr": "Application : 20 janvier 2027",
        "en": "Application: January 20, 2027"
    },
    "gdpr": {
        "fr": "En vigueur depuis : 25 mai 2018",
        "en": "In force since: May 25, 2018"
    },
    "cra": {
        "fr": "Application progressive : 11 décembre 2027 - 11 septembre 2026",
        "en": "Progressive application: December 11, 2027 - September 11, 2026"
    },
    "espr": {
        "fr": "Application : 18 juillet 2024",
        "en": "Application: July 18, 2024"
    },
    "data_act": {
        "fr": "Application : 12 septembre 2025",
        "en": "Application: September 12, 2025"
    },
    "batteries": {
        "fr": "Application progressive : 18 février 2024 - 18 août 2025",
        "en": "Progressive application: February 18, 2024 - August 18, 2025"
    },
    "cpr": {
        "fr": "En vigueur depuis : 1er juillet 2013",
        "en": "In force since: July 1, 2013"
    }
}

# Charger le JSON
with open(r'c:\Projects\jeanpierrecharles\data\regulation-questionnaires.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ajouter les dates
for module_key, module_dates in dates.items():
    if module_key in data:
        for lang in ['fr', 'en']:
            if lang in data[module_key]:
                # Insérer dateApplication après emoji
                data[module_key][lang]['dateApplication'] = module_dates[lang]

# Sauvegarder
with open(r'c:\Projects\jeanpierrecharles\data\regulation-questionnaires.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Dates d'application ajoutées à tous les modules !")
