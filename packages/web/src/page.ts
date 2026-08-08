export const pageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Formoss — verifiable Agent workbench</title>
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
  </style>
</head>
<body>
  <div class="app">
    <h1 class="brand">Formoss</h1>
    <p class="lede">Verifiable Agent trading workbench on Moss. Simulate is mandatory. Warnings stop the flow. Receipt leaf texts must align with intent before any unsigned Capability is emitted.</p>
    <div class="grid">
      <section>
        <h2>Intent</h2>
        <textarea id="intent" spellcheck="false"></textarea>
        <div class="actions">
          <button id="run" type="button">Run pipeline</button>
          <button id="happy" class="secondary" type="button">Load happy path</button>
          <button id="bad" class="secondary" type="button">Load align-fail</button>
          <button id="warn" class="secondary" type="button">Load warning</button>
          <button id="minout" class="secondary" type="button">Load min-out</button>
          <button id="approve" class="secondary" type="button">Load approve-bad</button>
        </div>
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
        <ul id="checks" style="margin-top:.9rem"></ul>
      </section>
    </div>
    <p class="note">Browser only renders. <code>POST /api/run</code> executes <code>@formoss/core</code> on this server — same pipeline as the CLI. Formoss never signs.</p>
  </div>
  <script>
    const happy = {
      protocol: "kuru", method: "swap",
      account: "0xcccccccccccccccccccccccccccccccccccccccc",
      params: {
        tokenIn: "native",
        tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
        amountIn: "0.01", slippage: 50
      }
    };
    const bad = {
      ...happy,
      expect: { recipient: "0x1111111111111111111111111111111111111111" }
    };
    const minOut = { ...happy, expect: { minAmountOut: "999999999999" } };
    const approveBad = {
      protocol: "kuru", method: "swap",
      account: "0xcccccccccccccccccccccccccccccccccccccccc",
      params: {
        tokenIn: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
        tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
        amountIn: "10000000000000000", slippage: 50
      },
      expect: { spender: "0xd651346d7c789536ebf06dc72aE3C8502cd695CC" }
    };
    let activeFixture = "offline";
    const intentEl = document.getElementById("intent");
    const stepsEl = document.getElementById("steps");
    const textsEl = document.getElementById("texts");
    const checksEl = document.getElementById("checks");
    const statusEl = document.getElementById("status");
    const errEl = document.getElementById("err");
    const runBtn = document.getElementById("run");
    const load = (intent, fixture) => {
      intentEl.value = JSON.stringify(intent, null, 2);
      activeFixture = fixture;
    };
    intentEl.value = JSON.stringify(happy, null, 2);
    document.getElementById("happy").onclick = () => load(happy, "offline");
    document.getElementById("bad").onclick = () => load(bad, "offline");
    document.getElementById("warn").onclick = () => load(happy, "warning");
    document.getElementById("minout").onclick = () => load(minOut, "min-out");
    document.getElementById("approve").onclick = () => load(approveBad, "approve-bad");
    runBtn.onclick = async () => {
      errEl.hidden = true; runBtn.disabled = true; statusEl.textContent = "Running…";
      stepsEl.innerHTML = textsEl.innerHTML = checksEl.innerHTML = "";
      try {
        const intent = JSON.parse(intentEl.value);
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ intent, fixture: activeFixture || undefined })
        });
        const data = await res.json();
        if (!res.ok && !data.status) throw new Error(data.error || ("HTTP " + res.status));
        for (const step of data.steps || []) {
          const li = document.createElement("li");
          li.className = step.status;
          li.innerHTML = "<strong>" + step.name + " · " + step.status + "</strong><br>" + step.detail;
          stepsEl.appendChild(li);
        }
        const failed = (data.align?.checks || []).filter((c) => !c.ok);
        const showChecks = failed.length ? failed : (data.align?.checks || []).slice(0, 8);
        for (const [i, text] of (data.texts || []).entries()) {
          const li = document.createElement("li");
          const check = (data.align?.checks || []).find((c) => c.id === "text_" + i + "_nonempty");
          li.className = check && check.ok === false ? "fail" : "pass";
          li.textContent = text;
          textsEl.appendChild(li);
        }
        for (const check of showChecks) {
          const li = document.createElement("li");
          li.className = check.ok ? "ok" : "fail";
          li.innerHTML = "<strong>" + (check.ok ? "pass" : "fail") + " · " + check.id + "</strong><br>" + check.detail;
          checksEl.appendChild(li);
        }
        const verified = !!(data.artifact && data.artifact.verified);
        statusEl.className = "status " + (verified ? "ok" : "bad");
        statusEl.textContent = verified
          ? ("Verified envelope (digest " + (data.artifact.digest?.hex || "").slice(0, 12) + "…)")
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
  </script>
</body>
</html>`;