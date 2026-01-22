# 🌐 GUIDE : Configuration Domaine Gandi.net → Vercel

## jeanpierrecharles.com - Transfert DNS & SSL

**Date** : 18 janvier 2026  
**Registrar** : Gandi.net (France - Conforme RGPD)  
**Hébergement** : Vercel

---

## 📋 Prérequis

- [ ] Compte Gandi.net actif
- [ ] Domaine enregistré (ex: `jeanpierrecharles.com`)
- [ ] Projet Vercel déployé : `jeanpierrecharles69-oss-jeanpier.vercel.app`
- [ ] Accès admin Vercel Dashboard

---

## 🎯 Objectif

Faire pointer `jeanpierrecharles.com` et `www.jeanpierrecharles.com` vers votre site Vercel avec :

- ✅ SSL automatique (HTTPS)
- ✅ Redirection www → non-www (ou inverse selon préférence)
- ✅ Propagation DNS rapide (< 1h)

---

## 🚀 ÉTAPE 1 : Configuration Vercel

### 1.1 Ajouter le Domaine Personnalisé

1. **Ouvrir Vercel Dashboard** :
   - Allez sur <https://vercel.com/dashboard>
   - Sélectionnez votre projet : `jeanpierrecharles-website`

2. **Settings → Domains** :
   - Cliquez sur **"Add"** ou **"Add Domain"**

3. **Entrer votre domaine** :

   ```
   jeanpierrecharles.com
   ```

   - Cliquez sur **"Add"**

4. **Vercel affichera** :

   ```
   Invalid Configuration
   Please add the following DNS records to your domain provider:
   
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   ⚠️ **NE FERMEZ PAS** cette fenêtre, vous aurez besoin de ces valeurs !

### 1.2 Copier les Enregistrements DNS

Notez les valeurs exactes fournies par Vercel :

```
A Record:
- Host: @ (ou vide)
- Value: 76.76.21.21

CNAME Record:
- Host: www
- Value: cname.vercel-dns.com
```

---

## 🌍 ÉTAPE 2 : Configuration Gandi.net

### 2.1 Connexion à Gandi

1. **Se connecter** : <https://admin.gandi.net/>
2. **Naviguer** : Nom de domaine → `jeanpierrecharles.com`
3. **Cliquer** sur **"Enregistrements DNS"** (ou **"DNS Records"**)

### 2.2 Configuration DNS Gandi

#### Option A : Mode Simple (Recommandé pour débutants)

1. **Dans "Enregistrements DNS"** :
   - Cliquez sur **"Modifier la zone"** ou **"Edit the zone"**

2. **Ajouter l'enregistrement A** :
   - **Type** : `A`
   - **TTL** : `10800` (3 heures) ou `300` (5 min pour test)
   - **Nom** : `@` (représente le domaine racine)
   - **Valeur** : `76.76.21.21` (valeur Vercel)
   - Cliquez **"Ajouter"**

3. **Ajouter l'enregistrement CNAME pour www** :
   - **Type** : `CNAME`
   - **TTL** : `10800`
   - **Nom** : `www`
   - **Valeur** : `cname.vercel-dns.com.` (attention au point final !)
   - Cliquez **"Ajouter"**

4. **Supprimer les anciens enregistrements A/CNAME** (si existants) :
   - Recherchez les lignes avec `@` ou `www` ayant d'anciennes valeurs
   - Cliquez sur **"Supprimer"** pour chacune

5. **Sauvegarder** :
   - Cliquez sur **"Valider les modifications"**
   - Confirmez

#### Option B : Mode Avancé (Fichier de zone)

Si vous utilisez le mode fichier de zone Gandi :

```dns
@ 10800 IN A 76.76.21.21
www 10800 IN CNAME cname.vercel-dns.com.
```

**Exemple complet de zone DNS** :

```dns
@ 10800 IN A 76.76.21.21
@ 10800 IN MX 10 spool.mail.gandi.net.
@ 10800 IN MX 50 fb.mail.gandi.net.
@ 10800 IN TXT "v=spf1 include:_mailcust.gandi.net ?all"
www 10800 IN CNAME cname.vercel-dns.com.
```

### 2.3 Vérification Gandi

Après sauvegarde, Gandi affichera :

```
✓ Zone DNS modifiée avec succès
Propagation en cours (peut prendre jusqu'à 24h, généralement < 1h)
```

---

## ⏱️ ÉTAPE 3 : Attendre la Propagation DNS

### 3.1 Temps de Propagation

- **Minimum** : 5-15 minutes (si TTL=300)
- **Moyen** : 30 minutes - 2 heures
- **Maximum** : 24-48 heures (rare)

### 3.2 Vérifier la Propagation

**Outil en ligne** :

- <https://dnschecker.org/>
- Entrez `jeanpierrecharles.com`
- Vérifiez que l'IP `76.76.21.21` apparaît

**Ligne de commande (Windows PowerShell)** :

```powershell
# Vérifier A Record
nslookup jeanpierrecharles.com

# Résultat attendu :
# Name:    jeanpierrecharles.com
# Address: 76.76.21.21

# Vérifier CNAME www
nslookup www.jeanpierrecharles.com

# Résultat attendu :
# www.jeanpierrecharles.com   canonical name = cname.vercel-dns.com
```

---

## 🔒 ÉTAPE 4 : Configuration SSL (Automatique Vercel)

### 4.1 Vérification SSL dans Vercel

1. **Retourner sur Vercel Dashboard** → Domains
2. Une fois DNS propagé, Vercel affichera :

   ```
   ✓ jeanpierrecharles.com
   SSL Certificate: Valid
   ```

3. **Attendre 2-5 minutes** pour génération certificat SSL (Let's Encrypt)

### 4.2 Forcer HTTPS

Dans **Vercel → Settings → Domains** :

- ✅ Activez **"Force HTTPS"** (déjà activé par défaut)
- ✅ Activez **"Redirect www to non-www"** (ou inverse selon préférence)

---

## ✅ ÉTAPE 5 : Tests Finaux

### 5.1 Vérifications à faire

- [ ] **<http://jeanpierrecharles.com>** → Redirige vers HTTPS ✅
- [ ] **<https://jeanpierrecharles.com>** → Site s'affiche ✅
- [ ] **<https://www.jeanpierrecharles.com>** → Redirige vers non-www ✅
- [ ] **Cadenas SSL vert** dans navigateur ✅
- [ ] **Performance** : Test Lighthouse > 90 ✅

### 5.2 Tests Avancés

**Test SSL** :

- <https://www.ssllabs.com/ssltest/analyze.html?d=jeanpierrecharles.com>
- Grade attendu : **A** ou **A+**

**Test Performance** :

- <https://pagespeed.web.dev/>
- Score attendu : **> 90/100**

**Test Mobile** :

- Ouvrir sur smartphone
- Vérifier responsive design

---

## 🔧 Configuration Optionnelle

### Option 1 : Sous-domaines

Si vous voulez `blog.jeanpierrecharles.com` ou `aegis.jeanpierrecharles.com` :

**Dans Gandi** :

```dns
blog 10800 IN CNAME cname.vercel-dns.com.
aegis 10800 IN CNAME cname.vercel-dns.com.
```

**Dans Vercel** :

- Ajouter chaque sous-domaine individuellement
- Configurer dans Vercel Dashboard → Domains

### Option 2 : Email avec Gandi Mail

Si vous voulez `contact@jeanpierrecharles.com` avec Gandi Mail :

**Conserver les MX records Gandi** :

```dns
@ 10800 IN MX 10 spool.mail.gandi.net.
@ 10800 IN MX 50 fb.mail.gandi.net.
```

**Prix Gandi Mail** :

- Standard : 3,49€ HT/mois (1 boîte, 3 Go)
- Premium : 5,99€ HT/mois (1 boîte, 50 Go)

### Option 3 : Redirection Apex Alternative

Si vous préférez www comme domaine principal :

**Dans Vercel** :

- Configurer redirection : `jeanpierrecharles.com` → `www.jeanpierrecharles.com`

**Dans Gandi** :

```dns
@ 10800 IN A 76.76.21.21
www 10800 IN CNAME cname.vercel-dns.com.
```

---

## ⚠️ Troubleshooting

### Problème 1 : DNS ne se propage pas

**Solution** :

1. Vider cache DNS local :

   ```powershell
   ipconfig /flushdns
   ```

2. Tester avec DNS public :

   ```powershell
   nslookup jeanpierrecharles.com 8.8.8.8
   ```

3. Attendre 24h supplémentaires

### Problème 2 : SSL invalide

**Solution** :

1. Dans Vercel, supprimer puis ré-ajouter le domaine
2. Attendre 5 minutes
3. Forcer renouvellement : Settings → Domains → Refresh

### Problème 3 : Erreur "Invalid Configuration" Vercel

**Solution** :

- Vérifier que les DNS Gandi sont bien :
  - `A` record : `76.76.21.21`
  - `CNAME` www : `cname.vercel-dns.com.` (avec le point final)

### Problème 4 : Site inaccessible après 24h

**Solution** :

1. Vérifier les nameservers Gandi :

   ```
   Nameserver 1: ns-129-a.gandi.net
   Nameserver 2: ns-186-b.gandi.net
   Nameserver 3: ns-16-c.gandi.net
   ```

2. Si changés récemment, attendre 48h de propagation

---

## 📊 Checklist de Migration Complète

### Avant Migration

- [ ] Sauvegarder ancienne configuration DNS Gandi (screenshot)
- [ ] Noter l'ancienne IP (si site existant)
- [ ] Vérifier aucun email critique en transit
- [ ] Planifier migration hors heures de pointe

### Pendant Migration

- [ ] Configurer DNS Gandi (A + CNAME)
- [ ] Ajouter domaine dans Vercel
- [ ] Attendre propagation DNS (1-2h)
- [ ] Vérifier SSL généré

### Après Migration

- [ ] Tester tous les liens (http/https/www)
- [ ] Vérifier emails fonctionnent (si Gandi Mail)
- [ ] Update Google Search Console (nouveau domaine)
- [ ] Update LinkedIn URL profil
- [ ] Update signatures email

---

## 🎯 Timeline Réaliste

| Étape | Durée | Cumulé |
|-------|-------|--------|
| Configuration Vercel | 5 min | 5 min |
| Configuration Gandi DNS | 10 min | 15 min |
| Propagation DNS | 30 min - 2h | 2h15 max |
| Génération SSL Vercel | 5 min | 2h20 |
| Tests finaux | 10 min | **2h30 total** |

**Estimation réaliste** : **2-3 heures** du début à la fin.

---

## 💰 Coûts Gandi.net

### Domaine .com

- **Enregistrement** : ~12€ HT/an (~14,40€ TTC)
- **Renouvellement** : ~15€ HT/an (~18€ TTC)

### Services Optionnels

- **Email Gandi Mail** : 3,49-5,99€ HT/mois
- **SSL Wildcard** : Inutile (Vercel fournit SSL gratuit)
- **DNS Premium** : Inutile pour votre usage

### Total Année 1

```
Domaine .com : 14,40€
Vercel Hobby : 0€ (gratuit)
Crisp Chat Pro : 300€ (25€ x 12 mois)
---
TOTAL : 314,40€/an (~26€/mois)
```

---

## 🔐 Sécurité & Conformité

### RGPD

- ✅ **Gandi.net** : Entreprise française, conforme RGPD
- ✅ **Vercel** : Data Processing Agreement (DPA) disponible
- ✅ **DNS** : Enregistrements publics (normaux)

### Whois Privacy

Dans **Gandi → Domaine → Informations** :

- ✅ Activer **"Whois Privacy Protection"** (gratuit chez Gandi)
- Masque vos coordonnées personnelles dans whois public

### Backup

- [ ] Exporter zone DNS Gandi (bouton "Exporter")
- [ ] Sauvegarder dans fichier local
- [ ] Versionner dans Git (optionnel)

---

## 📞 Support

### Gandi Support

- **Email** : <support@gandi.net>
- **Chat** : <https://www.gandi.net/fr/contact>
- **Téléphone** : +33 1 70 37 76 61 (FR)
- **Horaires** : 9h-18h (jours ouvrés)

### Vercel Support

- **Discord** : <https://vercel.com/discord>
- **Docs** : <https://vercel.com/docs/projects/domains>
- **Email** : <support@vercel.com> (Pro plan uniquement)

---

## ✅ Prêt à Configurer ?

**Étapes immédiates** :

1. Connectez-vous à Gandi : <https://admin.gandi.net/>
2. Notez votre domaine exact (jeanpierrecharles.com ?)
3. Préparez accès Vercel Dashboard
4. **Suivez ÉTAPE 1 → ÉTAPE 5** ci-dessus

---

**Voulez-vous que nous fassions cette configuration ensemble maintenant ?** 🚀

**Ou avez-vous besoin d'acheter le domaine d'abord sur Gandi ?**
