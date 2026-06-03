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
Decap needs an OAuth helper so the client can log in with GitHub. Two easy routes:
- **Easiest:** host the site (or just the auth helper) on **Netlify** and enable
  *Identity + Git Gateway* — then switch the backend to `name: git-gateway` and the
  client logs in with an email/password you invite. (Netlify can deploy the same repo.)
- **Stay on Vercel:** deploy a tiny OAuth provider (free, ~5 min) such as
  `decap-cms-github-oauth` on Cloudflare Workers or Vercel, create a **GitHub OAuth App**
  (Settings → Developer settings → OAuth Apps) for the client's account, and add its URL:
  ```yaml
  backend:
    name: github
    repo: OWNER/REPO
    branch: main
    base_url: https://your-oauth-helper-url
  ```

> The client never needs the GitHub *password* day-to-day — they just click
> "Login with GitHub" once and stay signed in. Only authorised accounts can edit.

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
