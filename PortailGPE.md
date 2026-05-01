# 📦 PortailGPE — Documentation Technique du Projet

> **GO PLUS EXPRESS** — Portail web logistique complet  
> Hébergement : **Cloudflare Pages** (déploiement automatique via GitHub `main`)  
> URL : [goplusexpress.com](http://goplusexpress.com)  
> Dernière mise à jour : mai 2026

---

## 🗂️ Structure du Projet

```
GO PLUS EXPRESS WEBSITE/
├── index.html                  # Page principale (site vitrine)
├── espace-client.html          # Portail client (SPA — Single Page App)
├── guide-emballage.html        # Guide d'emballage
├── offline.html                # Page hors ligne (PWA)
├── manifest.json               # Configuration PWA
├── sw.js                       # Service Worker
├── hscodes_data.js             # Base de données codes SH douaniers
│
├── css/
│   ├── style.css               # Styles site vitrine
│   ├── espace-client.css       # Styles portail client
│   └── crm.css                 # Styles module CRM
│
├── js/
│   ├── main.js                 # Scripts site principal
│   ├── simulators.js           # Moteur de simulation (fret, maritime, express)
│   ├── espace-client.js        # Logique portail client (auth, modules, session)
│   ├── admin.js                # Module administration (tarifs, utilisateurs)
│   ├── crm.js                  # Module CRM Prospects
│   ├── express-tarifs.js       # Tarifs express DHL/FedEx/Aramex
│   ├── airports-ports-data.js  # Base aéroports IATA + ports ONU
│   ├── maroc-authorizations.js # Autorisations douanières Maroc
│   ├── postal-lookup.js        # Recherche codes postaux
│   ├── tracking.js             # Suivi colis
│   ├── hero-animation.js       # Animation page d'accueil
│   ├── i18n.js                 # Internationalisation (FR/EN/AR)
│   └── cms-loader.js           # Chargement contenu CMS
│
└── assets/
    ├── logo.png
    ├── logos/                  # DHL, FedEx, Aramex, IATA, Douane Maroc…
    └── icons/                  # Icônes PWA (192px, 512px, maskable, SVG)
```

**Volume de code :** ~22 000 lignes au total

---

## 🌐 Site Vitrine (`index.html`)

### Sections principales
| Section | Contenu |
|---|---|
| Hero | Animation interactive, accroche commerciale |
| Services | Express, Maritime, Routier, Fret Aérien, Dédouanement |
| Simulateur de tarif | Express (DHL/FedEx/Aramex) + Maritime + Fret Aérien |
| Tracking | Suivi AWB/LTA — redirection vers portail transporteur |
| Partenaires | DHL, FedEx, Aramex, IATA, JCTrans, Douane Maroc |
| Guide emballage | Lien vers `guide-emballage.html` |
| Contact | Formulaire + coordonnées |

### Simulateurs (`simulators.js`)
- **Express** : tarifs DHL, FedEx, Aramex par zone/poids
- **Maritime** : FCL/LCL par port d'origine/destination
- **Fret Aérien** : calcul poids taxable (volumétrique vs réel), tarifs RAM + Airlines partenaires
- **Groupage** : tarifs consolidation
- **Routier** : tarifs terrestre
- Support **double affichage** (index.html + espace-client.html) via suffixe `-ec` sur les IDs

---

## 🔐 Espace Client (`espace-client.html`)

Application SPA complète avec authentification, session 8h, et modules métier.

### Authentification

#### Comptes disponibles
| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| **Admin** | `admin@goplusexpress.ma` | `Admin#GPE2026!` | Total — tarifs, utilisateurs, opérations |
| **Commercial** | `yassine.anaflous@goplusexpress.com` | `Gpe@2026` | CRM, prospects, devis, outils logistiques |
| **Démo Client** | `demo@goplusexpress.com` | `demo2024` | Outils logistiques uniquement |
| **Client** | Inscription en ligne | Défini à l'inscription | Outils logistiques uniquement |

#### Sécurité
- Rate limiting : 5 tentatives → blocage 5 minutes
- Session : 8 heures (stockée en `localStorage`)
- Hachage passwords : SHA-256 (HTTPS) ou FNV-1a fallback (HTTP)
- Séparation des rôles : affichage conditionnel des modules selon `user.role`

### Modules par rôle

| Module | Client | Commercial | Admin/Backend |
|---|---|---|---|
| Tableau de bord | ✅ | ✅ | ✅ |
| Simulateur de prix | ✅ | ✅ | ✅ |
| Fret Cargo Aérien | ✅ | ✅ | ✅ |
| Codes Aéroports & Ports | ✅ | ✅ | ✅ |
| Codes SH Douaniers | ✅ | ✅ | ✅ |
| OCR Facture Commerciale | ✅ | ✅ | ✅ |
| Simulateur DDP/DAP | ✅ | ✅ | ✅ |
| Guide d'emballage | ✅ | ✅ | ✅ |
| Créer une expédition | ✅ | ✅ | ✅ |
| **Prospects & CRM** | ❌ | ✅ | ✅ |
| **Administration** | ❌ | ❌ | ✅ |

---

## 📋 Module CRM Prospects (`crm.js` + `crm.css`)

Réservé aux rôles **Commercial** et **Admin**.

### Fonctionnalités
- **Pipeline commercial** : 7 étapes (Prospect → Contacté → RDV → Proposition → Négociation → Gagné → Perdu)
- **Cartes prospects** : nom, société, secteur, CA estimé, destinations, nb expéditions/an
- **Qualification** : type flux (Export/Import), budget, destinations clés
- **Calendrier RDV** : vue mensuelle, ajout/suppression rendez-vous
- **Commentaires visites** : timeline chronologique par prospect
- **Module Devis** : aérien, maritime, groupage, express — lignes de coût détaillées
- **Import Excel** : via SheetJS (xlsx.full.min.js CDN)
- **Agent IA** : recherche de sociétés marocaines par secteur/ville (simulation 4s, base de 40+ entreprises réelles : OCP, Copag, Cosumar, Renault, Sothema…)

### Données
- Stockage : `localStorage` clé `gpe_crm_v2`
- Pas de backend requis

---

## ⚙️ Module Administration (`admin.js`)

Réservé aux rôles **Admin** et **Backend**.

### Panneaux disponibles
| Panneau | Description |
|---|---|
| Carburant | Taux surcharge fuel par transporteur |
| Express | Marges DHL / FedEx / Aramex par zone |
| Maritime | Grilles tarifaires FCL/LCL import/export |
| Fret Cargo | Tarifs aériens par compagnie/route |
| Routier | Tarifs terrestre |
| Groupage | Tarifs consolidation |
| CMS | Édition contenu site |
| Utilisateurs | Gestion comptes clients enregistrés |

---

## 📱 PWA (Progressive Web App)

### Configuration (`manifest.json`)
```json
{
  "name": "GO PLUS EXPRESS",
  "short_name": "GO PLUS",
  "display": "standalone",
  "theme_color": "#00a99d",
  "background_color": "#0f172a",
  "start_url": "/"
}
```

### Icônes disponibles
| Fichier | Taille | Usage |
|---|---|---|
| `icon-192.png` | 192×192 | Android home screen |
| `icon-512.png` | 512×512 | Splash screen |
| `icon-maskable.png` | 512×512 | Android adaptive icon |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `icon.svg` | any | Navigateurs modernes |

### Raccourcis PWA
- **Espace Client** → `/espace-client.html`
- **Tracking Colis** → `/#tracking`
- **Simulateur de Tarif** → `/#simulators`

### Service Worker (`sw.js`)
- **Version cache** : `gpe-v20260430g`
- **Stratégies** :
  - Fichiers JS/CSS versionnés (`?v=...`) → **Network-first** (jamais de cache pour éviter les versions obsolètes)
  - Images/fonts → **Cache-first**
  - Pages HTML → **Network-first** + fallback offline
  - CDN (Google Fonts, cdnjs, unpkg) → **Cache-first**
- **Mise à jour** : `skipWaiting()` à l'installation + force-update à chaque chargement de page

---

## 🚀 Déploiement

### Infrastructure
- **Hébergement** : Cloudflare Pages
- **Dépôt** : GitHub (`abdelmaekzentar/goplusexpress`)
- **Branche** : `main`
- **Déploiement** : automatique à chaque `git push origin main`

### Procédure de mise en production
```bash
git add <fichiers modifiés>
git commit -m "description du changement"
git push origin main   # ← déclenche le déploiement Cloudflare automatiquement
```

> ⚠️ **Règle projet** : toujours demander confirmation avant `git push`

### Versionnage des assets
Tous les fichiers JS/CSS utilisent un paramètre `?v=YYYYMMDD[lettre]` pour invalider les caches navigateur :
```html
<script src="js/espace-client.js?v=20260501d"></script>
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
|---|---|
| Frontend | HTML5 / CSS3 / JavaScript ES6+ (vanilla, pas de framework) |
| Icônes | Font Awesome 6 Pro |
| Cartographie | Leaflet.js 1.9.4 |
| Excel import | SheetJS (xlsx.full.min.js 0.18.5) |
| Fonts | Google Fonts (Inter, Noto Sans Arabic) |
| Hébergement | Cloudflare Pages |
| PWA | Service Worker + Web App Manifest |
| Stockage client | localStorage (sessions, CRM, préférences) |
| Hachage | Web Crypto API (SHA-256) + FNV-1a fallback |

---

## 📞 Contacts & Support

| Rôle | Email |
|---|---|
| Support technique | `support@goplusexpress.ma` |
| Contact commercial | `contact@goplusexpress.ma` |

---

## 📝 Historique des versions récentes

| Version | Date | Description |
|---|---|---|
| v20260501d | 01/05/2026 | Fallback EC_ROLES inline — CRM visible commercial/admin |
| v20260501c | 01/05/2026 | CRM masqué par défaut dans le HTML (display:none) |
| v20260501b | 01/05/2026 | Login hardcodé indépendant des vars globales — TESTÉ OK |
| v20260501a | 01/05/2026 | const → var pour toutes les constantes auth |
| v20260430g | 30/04/2026 | SW network-first pour JS versionnés — fix cache TDZ |
| v20260430e | 30/04/2026 | ecShowDashboard null-safe + loginSuccess helper |
| v20260430d | 30/04/2026 | try-finally garantit restoreBtn() |
| v20260430c | 30/04/2026 | hashPass fix HTTP (isSecureContext + timeout 2s) |
| v20260429c | 29/04/2026 | Module Fret Cargo dans Espace Client (IDs suffixés -ec) |
| v20260429a | 29/04/2026 | Module CRM Prospects + compte commercial Yassine |
