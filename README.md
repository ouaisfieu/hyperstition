# Hyperstition

Encyclopédie en français sur l’hyperstition : définition, histoire du Ccru, mécanique des boucles,
numogramme interactif, accélérationnismes, fiction sonore, finance, IA, atlas d’exemples, critiques.

**En ligne :** https://ouaisfieu.github.io/hyperstition/

## Déploiement

Site 100 % statique, sans étape de build : 101 pages HTML déjà prêtes.

1. Déposer le contenu de ce dossier à la racine de la branche publiée (par exemple `main`).
2. Dans *Settings → Pages*, choisir « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Le fichier `.nojekyll` empêche Jekyll de toucher aux fichiers.

Si l’adresse change (domaine personnel, autre dépôt), il faut remplacer
`https://ouaisfieu.github.io/hyperstition/` dans tous les fichiers (canonical, sitemap, flux, JSON-LD) :

```sh
grep -rl "https://ouaisfieu.github.io/hyperstition/" . | xargs sed -i "s#https://ouaisfieu.github.io/hyperstition/#https://nouvelle-adresse/#g"
```

## Contenu

- `index.html` et un dossier par page (`definition/`, `glossaire/numogramme/`…), URLs propres.
- `assets/` : une feuille de style, quatre petits scripts sans dépendance, polices auto-hébergées, images.
- `data/` : thésaurus SKOS (Turtle, JSON-LD), chronologie et atlas (JSON, CSV), index de recherche.
- `sitemap.xml`, `feed.xml` (Atom), `robots.txt`, `llms.txt`, `manifest.webmanifest`, `404.html`.

## Auteur et licences

Textes écrits par Claude (IA d’Anthropic) pour un éditeur anonyme.
Texte et données : CC BY-SA 4.0. Code : MIT. Polices : SIL OFL. Voir `LICENSE`.
