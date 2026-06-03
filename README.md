# Mahabodhi Health & Fitness Center — Website

Marketing site for Mahabodhi Health & Fitness Center, Solo (Surakarta), Indonesia.
Static site (HTML/CSS/JS), deployed on Vercel, with a git-based content editor (Decap CMS).

## Structure
```
index.html              Home (hero, about, services, classes, eatery, gallery, community, contact)
group-training.html     Group activities + weekly schedule  (renders from content/)
restaurant.html         Venues + menu                        (renders from content/)
team.html               Coaches & therapists                 (renders from content/)
styles.css              All styling (orange/black brand theme)
script.js               Nav, reveal animations, counters, form
i18n.js                 English / Indonesian / Javanese translations
content.js              Renders the editable sections from content/*.json
content/                Client-editable data (activities, schedule, team, restaurant)
admin/                  Decap CMS editor (/admin) + config.yml
assets/                 Brand-graded images and logo
build-photos.py         Dev tool: duotone-grades source photos into assets/
extract-logo.py         Dev tool: extracts the orange tree logo to a transparent PNG
```

## Editing content
Non-technical edits (group training, schedule, team, restaurant menu) are done in the
**`/admin`** editor — no code required. See **[CMS-SETUP.md](CMS-SETUP.md)** for how to
run it locally and how to connect it for live publishing.

## Local preview
```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy
Connected to Vercel. With the GitHub repo linked, every push to `main` auto-deploys.
(Manual fallback: `npx vercel deploy --prod`.)
