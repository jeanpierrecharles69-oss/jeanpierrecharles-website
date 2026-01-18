# 🏗️ Stratégie Règlements Construction & Bâtiment

## 🎯 Défi

Un professionnel du BTP cherche les règlements applicables à :

- Matériaux de construction
- Équipements (ascenseurs, portes, fenêtres...)
- Infrastructures
- Travaux publics

---

## 📋 Règlements et Normes Applicables

### 1. **Règlements Produits Construction (RPC)**

#### ✅ Règlement (UE) 305/2011 - RPC (Règlement Produits Construction)

**Remplacement prévu par CPR 2.0 en 2026-2027**

**Applicable à** :

- Matériaux de construction
- Composants (fenêtres, portes, isolants...)
- Équipements de sécurité incendie

**Exigences clés** :

- Marquage CE obligatoire
- Déclaration de Performance (DoP)
- 7 exigences essentielles (résistance mécanique, sécurité incendie, hygiène, économie d'énergie...)

---

### 2. **ESPR (2024/1781) - Impact Construction**

**Applicable à** :

- Matériaux de construction durable
- Produits avec impact environnemental

**Exigences spécifiques BTP** :

- DPP (Digital Product Passport) pour matériaux
- Traçabilité carbone incorporé
- Recyclabilité des matériaux
- Circularité dans la démolition

**Timeline** : Application progressive 2026-2028

---

### 3. **Directive Efficacité Énergétique Bâtiments (EPBD)**

#### ✅ Directive 2024/1275 - EPBD recast (refonte 2024)

**Applicable à** :

- Bâtiments neufs
- Rénovations importantes
- Équipements techniques (chauffage, ventilation, éclairage)

**Exigences** :

- Performance énergétique minimale (classe E d'ici 2030)
- Certificats de Performance Énergétique (CPE)
- Bâtiments zéro émission (NZEB) pour le neuf dès 2030

---

### 4. **Directive Déchets de Construction et Démolition**

**Applicable à** :

- Gestion des déchets de chantier
- Déconstruction sélective

**Exigences** :

- 70% de valorisation des déchets
- Traçabilité des matériaux de démolition

---

### 5. **Règlements Équipements Spécifiques**

| Équipement | Règlement | Marquage |
|------------|-----------|----------|
| Ascenseurs | Directive 2014/33/UE | CE |
| Équipements sous pression | 2014/68/UE | CE |
| Machines de chantier | Règlement Machines 2023/1230 | CE |
| Produits explosifs (génie civil) | 2013/29/UE | CE |

---

## 🎯 Stratégie pour Assistant Aegis

### Option 1 : Badge Dédié "🏗️ Construction"

Créer un 7ème badge avec questionnaire spécialisé :

**Questions** :

1. Type de produit ? (Matériau / Équipement / Infrastructure)
2. Usage ? (Structure / Isolation / Finition / MEP)
3. Exportez-vous hors UE ?
4. Projet neuf ou rénovation ?

**Règlements analysés** :

- RPC (305/2011)
- ESPR (2024/1781)
- EPBD (2024/1275)
- CRA (si produit connecté - ex: domotique)
- AI Act (si système IA - ex: BIM automatisé)

---

### Option 2 : Base de Données Étendue

Ajouter à `reglements-europeens-2024.json` :

```json
{
  "rpc": {
    "id": "305/2011",
    "titre": "RPC - Règlement Produits Construction",
    "emoji": "🏗️",
    "secteurs": ["Construction", "Matériaux", "BTP"],
    "resume_critique": {
      "points": [
        "Marquage CE obligatoire pour produits construction",
        "Déclaration de Performance (DoP) requise",
        "7 exigences essentielles (résistance, feu, hygiène...)",
        "Normes harmonisées EN spécifiques par produit",
        "Surveillance marché renforcée"
      ]
    },
    "questions": [
      {
        "id": "q1",
        "question": "Type de produit construction ?",
        "options": [
          "Matériau structure (béton, acier...)",
          "Isolation thermique/acoustique",
          "Fenêtres/portes/vitrages",
          "Équipement sécurité incendie",
          "Revêtements sols/murs",
          "Autre"
        ]
      },
      {
        "id": "q2",
        "question": "Avez-vous le marquage CE ?",
        "options": ["Oui", "En cours", "Non", "Je ne sais pas"]
      },
      {
        "id": "q3",
        "question": "Connaissez-vous la norme harmonisée applicable ?",
        "options": ["Oui (EN XXXX)", "Partiellement", "Non"]
      }
    ]
  },
  "epbd": {
    "id": "2024/1275",
    "titre": "EPBD - Efficacité Énergétique Bâtiments",
    "emoji": "🌡️",
    "secteurs": ["Bâtiment", "Énergie", "Construction"],
    "resume_critique": {
      "points": [
        "Bâtiments neufs zéro émission dès 2030",
        "Rénovations : classe E minimum d'ici 2030 (résidentiel)",
        "Certificat Performance Énergétique (CPE) obligatoire",
        "Passeport Rénovation Bâtiment",
        "Extinction progressive chaudières fossiles"
      ]
    }
  }
}
```

---

### Option 3 : Détection Automatique Secteur

Améliorer `enrichPromptWithRegulation` pour détecter le secteur :

```typescript
export function detectSector(userPrompt: string): string[] {
  const sectors = {
    construction: /construction|bâtiment|BTP|matériau|béton|acier|isolation|fenêtre/i,
    energie: /énergie|électrique|solaire|chauffage|thermique/i,
    sante: /santé|médical|dispositif médical|hôpital/i,
    transport: /véhicule|automobile|train|avion|mobilité/i
  };
  
  const detected = [];
  for (const [sector, pattern] of Object.entries(sectors)) {
    if (pattern.test(userPrompt)) {
      detected.push(sector);
    }
  }
  
  return detected;
}

// Auto-suggérer les règlements pertinents
if (sectors.includes('construction')) {
  // Proposer : RPC, ESPR, EPBD, CRA si pertinent
}
```

---

## 🚀 Plan d'Action Recommandé

### Immédiat (cette semaine)

1. ✅ Ajouter RPC et EPBD à la base de connaissances JSON
2. ✅ Créer badge 🏗️ Construction

### Court terme (mois prochain)

3. 🔄 Détection automatique secteur dans les questions
2. 🔄 Liens directs vers normes EN applicables

### Moyen terme

5. 🔄 Intégration base de données normes harmonisées
2. 🔄 Comparateur multi-règlements pour un produit

---

## 📚 Ressources Officielles BTP

- **EUR-Lex** : <https://eur-lex.europa.eu/> (règlements UE)
- **Commission Européenne - Construction** : <https://single-market-economy.ec.europa.eu/sectors/construction_en>
- **AFNOR / CEN** : Normes harmonisées EN
- **CSTB** : Centre Scientifique et Technique du Bâtiment (France)

---

**Voulez-vous que j'ajoute maintenant le badge Construction avec RPC + EPBD ?**
