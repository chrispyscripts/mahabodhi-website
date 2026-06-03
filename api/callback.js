// GitHub OAuth — step 2: exchange the code for a token and hand it back to Decap CMS.
module.exports = async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  const { code, state } = req.query || {};

  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  const cookieState = m ? m[1] : null;

  function send(status, obj) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderMessage(status, obj));
  }

  if (!clientId || !clientSecret) {
    send("error", { error: "Server is missing GitHub OAuth environment variables." });
    return;
  }
  if (!code) {
    send("error", { error: "Missing authorization code." });
    return;
  }
  if (cookieState && state && cookieState !== state) {
    send("error", { error: "State mismatch — please try again." });
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, state }),
    });
    const data = await tokenRes.json();
    if (data.access_token) {
      send("success", { token: data.access_token, provider: "github" });
    } else {
      send("error", { error: data.error_description || data.error || "No access token returned." });
    }
  } catch (e) {
    send("error", { error: String((e && e.message) || e) });
  }
};

// HTML that posts the result back to the Decap CMS window (Netlify CMS handshake).
function renderMessage(status, obj) {
  const content = JSON.stringify(obj);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:sans-serif;background:#0c0c0d;color:#f5f3ef;display:grid;place-items:center;height:100vh">
<p>Completing sign-in…</p>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:${status}:${content}', e.origin);
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;
}
