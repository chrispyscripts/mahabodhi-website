# Mahabodhi — Content Editor (CMS) Setup

The site has a WordPress-style editor at **`/admin`** powered by **Decap CMS**.
Editable sections: **Group Training** (activities + schedule), **Our Team**, and the
**Restaurant** (venues + menu). Each lives as a JSON file in `content/` and the pages
render from those files, so an edit instantly changes the live page after publishing.

There are two ways to run it: **Local testing** (no accounts) and **Live/Production**.

---

## 1. Local testing (no GitHub, no login)

Great for trying the editor and confirming everything works.

```bash
# from the project folder
npx decap-server          # starts a small local editor backend on :8081
# in another terminal, serve the site, e.g.:
python3 -m http.server 4173
```

Open <http://localhost:4173/admin/>. Because `local_backend: true` is set in
`admin/config.yml`, edits save **directly to the JSON files** in `content/`.
Refresh the matching page to see the change. (Nothing is published online in this mode.)

---

## 2. Going live (client edits → auto-publish)

Edits will commit to GitHub, and Vercel will auto-redeploy (live in ~30s).

### Step A — Put the site in a GitHub repo
1. Create a repo (e.g. `mahabodhi-website`) under the client's GitHub account.
2. Push this folder to it (`main` branch).

### Step B — Connect the repo to Vercel
1. In Vercel → **Add New Project → Import** the GitHub repo.
2. Framework preset: **Other** (it's a static site). Deploy.
   - From now on, every commit auto-deploys. (No more `vercel deploy` from the CLI.)

### Step C — Point the editor at the repo
In `admin/config.yml`, change:
```yaml
backend:
  name: github
  repo: OWNER/REPO     # <-- set to e.g. mahabodhi-solo/mahabodhi-website
  branch: main
```

### Step D — Enable login (GitHub OAuth)
The OAuth helper is **already built into this project** as serverless functions
(`api/auth.js` + `api/callback.js`), and `admin/config.yml` already points at them.
You just need to create a GitHub OAuth App and give Vercel its two secrets.

1. **Create a GitHub OAuth App**
   GitHub → your avatar → **Settings → Developer settings → OAuth Apps → New OAuth App**
   - **Application name:** `Mahabodhi CMS`
   - **Homepage URL:** `https://mahabodhi-website.vercel.app`
   - **Authorization callback URL:** `https://mahabodhi-website.vercel.app/api/callback`
   - Click **Register**, then **Generate a new client secret**. Copy the **Client ID** and **Client secret**.

2. **Add them to Vercel**
   Vercel → project `mahabodhi-website` → **Settings → Environment Variables** → add:
   - `GITHUB_OAUTH_CLIENT_ID` = the Client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` = the Client secret
   Then **redeploy** (Deployments → ⋯ → Redeploy) so the functions pick up the values.

3. **Done.** Visit `/admin`, click **Login with GitHub**, authorise once, and edit away.

> If you move to a custom domain later, update `base_url` in `admin/config.yml` and the
> OAuth App's callback URL to match the new domain.
> Only GitHub accounts with write access to the repo can actually save changes.

---

## 3. How the client uses it
1. Go to **`https://<the-site>/admin/`** and log in.
2. Pick a section (Group Training / Our Team / Restaurant).
3. Click an item to edit, use **+** to add, or the trash icon to remove.
4. Click **Publish**. The live site updates automatically.

## Where content lives
| Section | File |
|---|---|
| Group activities | `content/activities.json` |
| Weekly schedule | `content/schedule.json` |
| Team members | `content/team.json` |
| Restaurant venues + menu | `content/restaurant.json` |

> Note: the homepage teaser sections are intentionally separate from these editable
> lists. The canonical, client-editable content is on the Group Training, Our Team,
> and Restaurant pages.
