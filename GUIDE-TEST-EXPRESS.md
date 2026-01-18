# 🧪 GUIDE TEST EXPRESS - 17 janvier 2026

## Objectif

Tester rapidement les 6 badges + fonctionnalité générale en 15 minutes

---

## 🚀 Étape 1 : Démarrer le serveur (1 min)

```powershell
# Terminal PowerShell
cd C:\Projects\jeanpierrecharles
npm run dev
```

**Attendu** : Serveur démarre sur <http://localhost:5173>

---

## 🎯 Étape 2 : Test Assistant (3 min)

1. **Ouvrir** : <http://localhost:5173>
2. **Cliquer** : Bouton Assistant (icône sparkle en bas à droite)
3. **Vérifier** : Modal s'ouvre avec message de bienvenue
4. **Vérifier** : 7 badges affichés (6 actifs + Data Act bonus)

---

## 📋 Étape 3 : Test des 6 Badges (10 min)

### Test Badge 1 : 🤖 AI Act

1. Cliquer sur badge "AI Act"
2. **✅ Vérifier** : Modal questionnaire s'ouvre
3. **✅ Vérifier** : Header affiche "AI Act - Règlement sur l'Intelligence Artificielle" + "JOE UE"
4. **✅ Vérifier** : Résumé critique affiché (5 points)
5. Cliquer "Commencer le questionnaire"
6. **✅ Vérifier** : 4 questions affichées
7. **✅ Vérifier** : Q1 contient "Je ne sais pas"
8. Sélectionner : Q1="Oui, système IA intégré", Q2="Fabrication", Q3="Oui avec validation", Q4=cocher 2 options
9. Cliquer "Générer l'analyse"
10. **✅ Vérifier** : Réponse générée (~250 mots)
11. **✅ Vérifier** : Format respecté (Priorité, Situation, Actions, Timeline, Conseil)
12. **✅ Vérifier** : Pas d'hallucination (mentionné AI Act, classification risques...)

**Temps** : ~2 min

---

### Test Badge 2 : ⚙️ Machinery (Accéléré)

1. Fermer modal actuel (X)
2. Cliquer badge "Machinery"
3. **✅ Vérifier** : Résumé critique OK
4. Cliquer "Commencer"
5. **✅ Vérifier** : "Je ne sais pas" présent sur Q1, Q2, Q4
6. Sélectionner options random
7. Générer analyse
8. **✅ Vérifier** : Réponse cohérente sur Règlement Machines

**Temps** : ~1 min

---

### Test Badges 3-6 : Mode Rapide

**Pour chaque badge** (GDPR, CRA, ESPR, Data Act) :

1. Cliquer badge
2. Vérifier résumé s'affiche
3. "Commencer questionnaire"
4. Vérifier "Je ne sais pas" présent
5. Sélectionner 2-3 options
6. Générer
7. Vérifier ~250 mots, format OK

**Temps total** : ~5 min (1 min 15s par badge)

---

## ✅ Critères de Succès

| Critère | OK ? |
| :--- | :--- |
| 6 badges s'ouvrent | ☐ |
| Résumés critiques affichés | ☐ |
| "Je ne sais pas" partout | ☐ |
| Questionnaires fonctionnels | ☐ |
| Réponses ~250 mots | ☐ |
| Format structuré respecté | ☐ |
| Pas d'hallucinations | ☐ |
| Référence JOE affichée | ☐ |

---

## 🔴 Si problème

**Modal ne s'ouvre pas** :

- F12 → Console → Vérifier erreurs JavaScript
- Vérifier que `npm run dev` tourne bien

**Réponse trop longue/courte** :

- C'est un bug de prompt → Vérifier `AiAssistant.tsx` ligne 84-127

**Hallucinationsfonctionnelles (invente infos)** :

- Bug de `regulationKnowledgeService.ts`
- Vérifier console logs

**"Je ne sais pas" manquant** :

- Vérifier `regulation-questionnaires.json`
- Devrait être ajouté à toutes questions choice

---

## 📊 Résultat Attendu

**TOUS LES CRITÈRES ✅** → Prêt pour Phase B (Cosmétique)

**1-2 bugs mineurs** → Corriger puis Phase B  

**Bugs majeurs** → Me contacter avec screenshot erreurs

---

## Bon test ! 🚀
