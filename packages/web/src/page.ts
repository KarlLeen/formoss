export const pageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sealmoss — verifiable Agent workbench</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500;9..40,700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg0: #eef2ef;
      --bg1: #dfe8e2;
      --ink: #152019;
      --muted: #4d5c52;
      --line: #9aafa2;
      --ok: #1f6b3c;
      --fail: #9b2f2f;
      --panel: rgba(255, 255, 255, 0.55);
      --field: #f7faf8;
      --accent: #0f5c4c;
      --mono: "IBM Plex Mono", ui-monospace, monospace;
      --sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      font-family: var(--sans);
      min-height: 100vh;
      background:
        radial-gradient(ellipse 70% 45% at 100% 0%, rgba(15,92,76,.1), transparent 55%),
        repeating-linear-gradient(
          -12deg,
          transparent,
          transparent 11px,
          rgba(21,32,25,.03) 11px,
          rgba(21,32,25,.03) 12px
        ),
        linear-gradient(165deg, var(--bg0), var(--bg1));
    }
    .app { max-width: 1120px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
    .brand {
      font-size: clamp(2.6rem, 7vw, 4rem);
      line-height: .92;
      letter-spacing: -.04em;
      margin: 0 0 .45rem;
      font-weight: 700;
      color: var(--accent);
    }
    .lede { margin: 0 0 1.75rem; max-width: 38rem; color: var(--muted); font-weight: 500; }
    .grid { display: grid; gap: 1.1rem; }
    @media (min-width: 960px) { .grid { grid-template-columns: 1.1fr .9fr 1.1fr; } }
    section {
      background: var(--panel);
      border: 1px solid var(--line);
      padding: 1rem 1rem 1.1rem;
      backdrop-filter: blur(4px);
    }
    section h2 {
      margin: 0 0 .75rem;
      font-family: var(--mono);
      font-size: .72rem;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 500;
    }
    textarea {
      width: 100%;
      min-height: 220px;
      border: 1px solid var(--line);
      background: var(--field);
      color: var(--ink);
      font-family: var(--mono);
      font-size: .78rem;
      line-height: 1.45;
      padding: .75rem;
      resize: vertical;
    }
    .actions { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .75rem; }
    button {
      border: 1px solid var(--accent);
      background: var(--accent);
      color: #f4faf7;
      font-family: var(--mono);
      font-size: .75rem;
      font-weight: 500;
      padding: .55rem .85rem;
      cursor: pointer;
    }
    button.secondary {
      background: transparent;
      color: var(--ink);
      border-color: var(--line);
    }
    button:disabled { opacity: .45; cursor: not-allowed; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .55rem; }
    li {
      font-family: var(--mono);
      font-size: .72rem;
      border-left: 3px solid var(--line);
      padding-left: .65rem;
      word-break: break-word;
      color: var(--muted);
    }
    li.ok, li.pass { border-color: var(--ok); color: var(--ink); }
    li.fail { border-color: var(--fail); color: var(--ink); }
    .status { margin-top: 1rem; font-family: var(--mono); font-size: .8rem; color: var(--muted); }
    .status.ok { color: var(--ok); }
    .status.bad { color: var(--fail); }
    .note { margin-top: 1.5rem; color: var(--muted); font-size: .92rem; max-width: 42rem; }
    code { font-family: var(--mono); font-size: .85em; color: var(--accent); }
    .checks-meta { font-family: var(--mono); font-size: .72rem; color: var(--muted); margin: .75rem 0 0; }
    .digest { font-family: var(--mono); font-size: .68rem; word-break: break-all; color: var(--ink); margin: .5rem 0 0; }
    .sub { margin: .9rem 0 .4rem; font-family: var(--mono); font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  </style>
</head>
<body>
  <div class="app">
    <h1 class="brand">Sealmoss</h1>
    <p class="lede">Seal on Moss Receipts: simulate is mandatory, Warnings stop the flow, and ordered leaf texts must align with intent before any unsigned Capability is nested. Not a wallet scanner, key vault, or MEV protector.</p>
    <p class="note" id="host-note">Hosted / default demo mode is <strong>fixture-only</strong> (no live Monad RPC). Live simulate stays on local CLI or <code>SEALMOSS_WEB_ALLOW_LIVE=1</code>.</p>
    <div class="grid">
      <section>
        <h2>Intent</h2>
        <textarea id="intent" spellcheck="false"></textarea>
        <div class="actions" id="demo-actions">
          <button id="run" type="button">Run pipeline</button>
        </div>
        <label class="live-toggle" style="display:flex;gap:.5rem;align-items:center;margin-top:.75rem;font-family:var(--mono);font-size:.72rem;color:var(--muted)">
          <input id="live" type="checkbox" />
          Allow live RPC (requires server SEALMOSS_WEB_ALLOW_LIVE=1)
        </label>
        <p id="err" class="status bad" hidden></p>
      </section>
      <section>
        <h2>Pipeline</h2>
        <ul id="steps"></ul>
        <p id="status" class="status">No run yet.</p>
      </section>
      <section>
        <h2>Receipt alignment</h2>
        <ul id="texts"></ul>
        <p class="sub">Warnings</p>
        <ul id="warnings"></ul>
        <p id="checks-meta" class="checks-meta"></p>
        <ul id="checks"></ul>
        <p class="sub">Digest</p>
        <p id="digest" class="digest"></p>
        <div class="actions">
          <button id="copy-digest" class="secondary" type="button" disabled>Copy digest</button>
          <button id="download" class="secondary" type="button" disabled>Download envelope</button>
        </div>
      </section>
    </div>
    <p class="note">Demo buttons always send a catalog <code>fixture</code> (no RPC). <code>POST /api/run</code> rejects live unless the server allows it. Failed align checks shown by default — same as CLI. Download the envelope JSON after a run.</p>
  </div>
  <script>
    let activeFixture = "offline";
    let lastArtifact = null;
    let lastDigestHex = "";
    const intentEl = document.getElementById("intent");
    const stepsEl = document.getElementById("steps");
    const textsEl = document.getElementById("texts");
    const warningsEl = document.getElementById("warnings");
    const checksEl = document.getElementById("checks");
    const checksMetaEl = document.getElementById("checks-meta");
    const digestEl = document.getElementById("digest");
    const statusEl = document.getElementById("status");
    const errEl = document.getElementById("err");
    const runBtn = document.getElementById("run");
    const liveEl = document.getElementById("live");
    const copyBtn = document.getElementById("copy-digest");
    const downloadBtn = document.getElementById("download");
    const actionsEl = document.getElementById("demo-actions");

    async function loadDemo(id) {
      const res = await fetch("/api/demos/" + encodeURIComponent(id));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
      intentEl.value = JSON.stringify(data.intent, null, 2);
      activeFixture = data.fixture || "";
    }

    async function boot() {
      const res = await fetch("/api/catalog");
      const catalog = await res.json();
      if (!res.ok) throw new Error(catalog.error || ("HTTP " + res.status));
      for (const demo of catalog.demos || []) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "secondary";
        btn.textContent = demo.label;
        btn.onclick = () => loadDemo(demo.id).catch((e) => {
          errEl.hidden = false;
          errEl.textContent = e.message || String(e);
        });
        actionsEl.appendChild(btn);
      }
      const first = (catalog.demos || [])[0];
      if (first) await loadDemo(first.id);
    }

    copyBtn.onclick = async () => {
      if (!lastDigestHex) return;
      try { await navigator.clipboard.writeText(lastDigestHex); } catch (_) {}
    };
    downloadBtn.onclick = () => {
      if (!lastArtifact) return;
      const name = lastArtifact.verified ? "verified-capability.json" : "failed-run.json";
      const blob = new Blob([JSON.stringify(lastArtifact, null, 2) + "\\n"], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    };

    runBtn.onclick = async () => {
      errEl.hidden = true; runBtn.disabled = true; statusEl.textContent = "Running…";
      stepsEl.textContent = textsEl.textContent = warningsEl.textContent = checksEl.textContent = "";
      checksMetaEl.textContent = "";
      digestEl.textContent = "";
      lastArtifact = null;
      lastDigestHex = "";
      copyBtn.disabled = true;
      downloadBtn.disabled = true;
      try {
        const intent = JSON.parse(intentEl.value);
        const live = !!(liveEl && liveEl.checked);
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            intent,
            fixture: activeFixture || undefined,
            live: live || undefined
          })
        });
        const data = await res.json();
        if (!res.ok && !data.status) throw new Error(data.error || ("HTTP " + res.status));
        for (const step of data.steps || []) {
          const li = document.createElement("li");
          li.className = step.status;
          li.textContent = step.name + " · " + step.status + " — " + step.detail;
          stepsEl.appendChild(li);
        }
        const warns = data.warnings || [];
        if (warns.length === 0) {
          const li = document.createElement("li");
          li.textContent = "none";
          warningsEl.appendChild(li);
        } else {
          for (const w of warns) {
            const li = document.createElement("li");
            li.className = "fail";
            li.textContent = w;
            warningsEl.appendChild(li);
          }
        }
        const allChecks = data.align?.checks || [];
        const failed = allChecks.filter((c) => !c.ok);
        const passed = allChecks.filter((c) => c.ok);
        for (const [i, text] of (data.texts || []).entries()) {
          const li = document.createElement("li");
          const check = allChecks.find((c) => c.id === "text_" + i + "_nonempty");
          li.className = check && check.ok === false ? "fail" : "pass";
          li.textContent = text;
          textsEl.appendChild(li);
        }
        if (failed.length > 0) {
          checksMetaEl.textContent = failed.length + " failed / " + passed.length + " passed — failures:";
          for (const check of failed) {
            const li = document.createElement("li");
            li.className = "fail";
            li.textContent = "fail · " + check.id + " — " + check.detail;
            checksEl.appendChild(li);
          }
        } else if (passed.length > 0) {
          checksMetaEl.textContent = passed.length + " checks passed";
        } else {
          checksMetaEl.textContent = "Alignment skipped or empty";
        }
        lastArtifact = data.artifact || null;
        lastDigestHex = (data.artifact && data.artifact.digest && data.artifact.digest.hex) || "";
        digestEl.textContent = lastDigestHex
          ? ("sha256:" + lastDigestHex)
          : "no digest";
        copyBtn.disabled = !lastDigestHex;
        downloadBtn.disabled = !lastArtifact;
        const verified = !!(data.artifact && data.artifact.verified);
        statusEl.className = "status " + (verified ? "ok" : "bad");
        statusEl.textContent = verified
          ? ("Verified envelope · digest below")
          : ("Not verified (" + data.status + ")" + (data.error ? ": " + data.error : ""));
      } catch (e) {
        errEl.hidden = false;
        errEl.textContent = e.message || String(e);
        statusEl.textContent = "Failed.";
        statusEl.className = "status bad";
      } finally {
        runBtn.disabled = false;
      }
    };

    boot().catch((e) => {
      errEl.hidden = false;
      errEl.textContent = e.message || String(e);
    });
  </script>
</body>
</html>`;
