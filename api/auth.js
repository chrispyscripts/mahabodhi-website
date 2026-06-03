// GitHub OAuth — step 1: redirect the editor to GitHub's consent screen.
// Used by Decap CMS at /admin (backend.base_url + auth_endpoint = /api/auth).
const crypto = require("crypto");

module.exports = function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("Missing GITHUB_OAUTH_CLIENT_ID environment variable.");
    return;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/callback`;
  const state = crypto.randomBytes(16).toString("hex");
  const scope = (req.query && req.query.scope) || "repo,user";

  const authUrl =
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    }).toString();

  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  res.writeHead(302, { Location: authUrl });
  res.end();
};
