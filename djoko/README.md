# 🍔 DJÔKÔ — Fast-food Béninois Premium
## Guide de déploiement Vercel

---

## Structure du projet

```
djoko/
├── index.html          ← Page d'accueil
├── apropos.html        ← À propos
├── menu.html           ← Menu / Produits
├── contact.html        ← Contact
├── css/
│   └── style.css       ← CSS personnalisé (jamais en ligne)
├── js/
│   └── script.js       ← JavaScript (Bonus 1 + Chatbot)
├── api/
│   └── chat.js         ← Proxy sécurisé Gemini (Serverless Function)
└── vercel.json         ← Configuration Vercel
```

---

## Déploiement sur Vercel (étape par étape)

### 1. Créer un compte Vercel
Rendez-vous sur [vercel.com](https://vercel.com) et créez un compte gratuit.

### 2. Installer Vercel CLI (optionnel)
```bash
npm install -g vercel
```

### 3. Déployer via GitHub (recommandé)
1. Poussez le dossier `djoko/` sur un dépôt GitHub
2. Sur Vercel → "New Project" → importez votre repo GitHub
3. Vercel détecte automatiquement la configuration via `vercel.json`

### 4. ⚠️ CONFIGURER LA CLÉ API GEMINI (OBLIGATOIRE)

**La clé API n'est JAMAIS dans le code.** Elle est stockée dans les variables d'environnement Vercel :

1. Dans votre projet Vercel → **Settings** → **Environment Variables**
2. Ajouter :
   - **Name** : `GEMINI_API_KEY`
   - **Value** : votre clé Gemini (obtenue sur [aistudio.google.com](https://aistudio.google.com))
   - **Environment** : Production + Preview + Development
3. Cliquer **Save**
4. **Redéployer** le projet (Deployments → Redeploy)

> 🔒 **Sécurité** : La clé est uniquement accessible côté serveur (dans `api/chat.js`).
> Le navigateur ne peut jamais la lire. Personne ne peut la voler depuis le code source.

### 5. Obtenir une clé Gemini gratuite
1. Aller sur [aistudio.google.com](https://aistudio.google.com)
2. Se connecter avec un compte Google
3. Cliquer sur **"Get API key"** → **"Create API key"**
4. Copier la clé générée

---

## Test en local

Pour tester le chatbot localement, installez Vercel CLI :

```bash
npm install -g vercel
cd djoko/
vercel dev
```

Ou pour tester sans le chatbot (pages statiques seulement) :
```bash
cd djoko/
python3 -m http.server 8080
# Ouvrir http://localhost:8080
```

---

## Fonctionnalités

| Fonctionnalité | Technologie | Statut |
|---|---|---|
| Navbar responsive | Bootstrap 5 | ✅ |
| Grille / layout | Bootstrap Grid + Flexbox | ✅ |
| Carrousel images | Bootstrap Carousel | ✅ |
| Animations survol | CSS transitions | ✅ |
| Design cohérent | CSS custom (variables) | ✅ |
| Site responsive | Bootstrap + Media Queries | ✅ |
| **Bonus 1** : JS professionnel | Vanilla JS (script.js) | ✅ |
| **Bonus 2** : Chatbot IA | Gemini API (proxy sécurisé) | ✅ |

## Bonus 1 — JavaScript
- Effet scroll navbar (devient opaque après 60px)
- Révélation éléments au scroll (IntersectionObserver)
- Compteurs animés (page À propos)
- Filtres menu par catégorie (Burgers / Boxes / Boissons…)
- Validation formulaire de contact (temps réel + à la soumission)

## Bonus 2 — Chatbot Djômi
- Bulle flottante bas droite, panel animé
- Proxy Vercel Serverless Function → clé API jamais exposée
- Contexte métier transmis à Gemini (menu, horaires, histoire)
- Historique de conversation (8 derniers échanges)
- Indicateur de frappe animé
- Gestion d'erreurs gracieuse

---

## Images
Toutes les images proviennent d'**Unsplash** (libres de droits).
