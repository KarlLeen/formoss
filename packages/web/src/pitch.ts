/** Pitch deck page for Mojo / Monad Playground judges. */
export const pitchHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sealmoss — Pitch Deck</title>
  <meta name="description" content="Sealmoss: seal on Moss Receipts for Monad Agent trading. Demo, GitHub, and Monad integration." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: #101a14;
      --muted: #3d4f44;
      --paper: #e7efe9;
      --paper2: #d3e0d7;
      --accent: #0b4f42;
      --accent2: #1a7a64;
      --line: rgba(16,26,20,.18);
      --glow: rgba(26,122,100,.22);
      --display: "Syne", ui-sans-serif, system-ui, sans-serif;
      --serif: "Source Serif 4", ui-serif, Georgia, serif;
      --mono: "IBM Plex Mono", ui-monospace, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; }
    body {
      color: var(--ink);
      font-family: var(--serif);
      background: var(--paper);
    }
    .deck {
      height: 100vh;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;
    }
    .slide {
      min-height: 100vh;
      scroll-snap-align: start;
      display: grid;
      align-content: center;
      padding: clamp(1.5rem, 4vw, 3.5rem);
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--line);
    }
    .slide::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 55% 40% at 90% 10%, var(--glow), transparent 60%),
        linear-gradient(160deg, var(--paper), var(--paper2));
      z-index: 0;
    }
    .slide > * { position: relative; z-index: 1; max-width: 56rem; }
    .kicker {
      font-family: var(--mono);
      font-size: .72rem;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 1rem;
      opacity: 0;
      animation: rise .7s ease forwards;
    }
    .brand {
      font-family: var(--display);
      font-weight: 800;
      font-size: clamp(3.4rem, 12vw, 7rem);
      line-height: .88;
      letter-spacing: -.05em;
      color: var(--accent);
      margin: 0 0 1rem;
      opacity: 0;
      animation: rise .7s .08s ease forwards;
    }
    h2 {
      font-family: var(--display);
      font-weight: 700;
      font-size: clamp(2rem, 5.5vw, 3.4rem);
      line-height: 1.05;
      letter-spacing: -.03em;
      margin: 0 0 1rem;
      max-width: 18ch;
      opacity: 0;
      animation: rise .7s .06s ease forwards;
    }
    p, li {
      font-size: clamp(1.05rem, 2.2vw, 1.25rem);
      line-height: 1.45;
      color: var(--muted);
      margin: 0 0 .85rem;
      max-width: 40rem;
    }
    .lede {
      font-size: clamp(1.15rem, 2.6vw, 1.45rem);
      color: var(--ink);
      max-width: 34rem;
      opacity: 0;
      animation: rise .7s .16s ease forwards;
    }
    ul { margin: 0; padding: 0; list-style: none; display: grid; gap: .65rem; }
    li {
      padding-left: 1rem;
      border-left: 3px solid var(--accent2);
      margin: 0;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
      margin-top: 1.5rem;
      opacity: 0;
      animation: rise .7s .24s ease forwards;
    }
    a.cta {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      font-family: var(--mono);
      font-size: .8rem;
      font-weight: 500;
      text-decoration: none;
      color: #f3faf7;
      background: var(--accent);
      border: 1px solid var(--accent);
      padding: .75rem 1.05rem;
      transition: transform .2s ease, background .2s ease;
    }
    a.cta:hover { transform: translateY(-2px); background: var(--accent2); }
    a.cta.ghost {
      background: transparent;
      color: var(--ink);
      border-color: var(--line);
    }
    .meta {
      font-family: var(--mono);
      font-size: .78rem;
      color: var(--muted);
      margin-top: 1.25rem;
      word-break: break-all;
    }
    .flow {
      display: grid;
      gap: .55rem;
      margin: 1.25rem 0 0;
      font-family: var(--mono);
      font-size: .8rem;
    }
    .flow span {
      display: block;
      background: rgba(255,255,255,.45);
      border: 1px solid var(--line);
      padding: .7rem .85rem;
      color: var(--ink);
    }
    .checklist {
      display: grid;
      gap: .55rem;
      margin-top: 1.2rem;
      font-family: var(--mono);
      font-size: .82rem;
    }
    .checklist div {
      display: flex;
      gap: .6rem;
      align-items: baseline;
      color: var(--ink);
    }
    .checklist b { color: var(--accent2); }
    .nav {
      position: fixed;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      display: grid;
      gap: .4rem;
    }
    .nav a {
      width: .55rem;
      height: .55rem;
      border-radius: 999px;
      background: rgba(16,26,20,.25);
      text-indent: -999px;
      overflow: hidden;
    }
    .nav a:hover, .nav a:focus { background: var(--accent); }
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .7rem 1rem;
      font-family: var(--mono);
      font-size: .72rem;
      background: rgba(231,239,233,.78);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--line);
    }
    .topbar a { color: var(--accent); text-decoration: none; font-weight: 500; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: none; }
    }
    @media (max-width: 720px) {
      .nav { display: none; }
      .slide { padding-top: 4rem; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <span>Sealmoss · Pitch</span>
    <span>
      <a href="/">Workbench</a>
      ·
      <a href="https://sm.limlamleen.com" target="_blank" rel="noopener">Demo</a>
      ·
      <a href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
    </span>
  </div>
  <nav class="nav" aria-label="Slides">
    <a href="#s1">1</a><a href="#s2">2</a><a href="#s3">3</a>
    <a href="#s4">4</a><a href="#s5">5</a><a href="#s6">6</a><a href="#s7">7</a>
  </nav>
  <main class="deck">
    <section class="slide" id="s1">
      <p class="kicker">Monad Playground · Pitch Deck</p>
      <h1 class="brand">Sealmoss</h1>
      <p class="lede">The seal for Moss Capability trees — Agents must simulate, stop on Warnings, and align Receipt evidence with intent before any unsigned Capability is nested.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener">Open live demo →</a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub repo</a>
        <a class="cta ghost" href="/">Run workbench</a>
      </div>
      <p class="meta">Demo https://sm.limlamleen.com · Repo https://github.com/KarlLeen/formoss</p>
    </section>

    <section class="slide" id="s2">
      <p class="kicker">Problem</p>
      <h2>Agents can skip the evidence.</h2>
      <ul>
        <li>Moss builds and simulates unsigned Monad txs and emits ordered Receipt texts — but does not force Agents to use them.</li>
        <li>Skipping simulate, soft-ignoring Warnings, or mismatching intent vs Receipts is still possible if the consumer is undisciplined.</li>
        <li>Judges and humans need a hard gate before a Capability is presented as “verified.”</li>
      </ul>
    </section>

    <section class="slide" id="s3">
      <p class="kicker">Solution</p>
      <h2>Sealmoss makes skipping evidence hard.</h2>
      <ul>
        <li><b style="color:var(--ink)">Simulate is mandatory</b> — no verified envelope without Moss simulate evidence (or an offline fixture).</li>
        <li><b style="color:var(--ink)">Any Warning stops the flow</b> — failed-run envelope, <code style="font-family:var(--mono)">capability: null</code>.</li>
        <li><b style="color:var(--ink)">Ordered Receipt leaf texts ↔ intent</b> — approve spender, Kuru minOut / slippage floor, dual text+outcome checks.</li>
        <li>Only then: verified envelope with nested Capability + sha256 digest. Never signs or broadcasts.</li>
      </ul>
    </section>

    <section class="slide" id="s4">
      <p class="kicker">Monad integration</p>
      <h2>Moss on Monad; Sealmoss is the gate.</h2>
      <ul>
        <li><b style="color:var(--ink)">Chain:</b> Monad mainnet (chain id 143) via Moss Runtime + RPC.</li>
        <li><b style="color:var(--ink)">Engine:</b> <code style="font-family:var(--mono)">@themoss/*</code> — Registry <code style="font-family:var(--mono)">action</code> builds unsigned Capability trees; simulator produces ordered Changes / Receipts / Warnings.</li>
        <li><b style="color:var(--ink)">Protocols:</b> Kuru swap (+ nested ERC-20 approve), WMON wrap/unwrap — protocol-owned ABIs and Receipt parsers.</li>
        <li><b style="color:var(--ink)">Sealmoss:</b> consumes Moss as a library; table-driven align rules; presents verified or failed-run envelopes for human / wallet review.</li>
      </ul>
      <div class="flow">
        <span>Intent → Moss action → Moss simulate → Sealmoss align → verified envelope</span>
        <span>Signing stays outside — wallet / human after the seal</span>
      </div>
    </section>

    <section class="slide" id="s5">
      <p class="kicker">What to click</p>
      <h2>Demo &amp; repository</h2>
      <div class="checklist">
        <div><b>✓</b> Demo (fixture-only web) — <a href="https://sm.limlamleen.com" target="_blank" rel="noopener">sm.limlamleen.com</a></div>
        <div><b>✓</b> GitHub — <a href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">github.com/KarlLeen/formoss</a></div>
        <div><b>✓</b> Pitch deck — this page (<a href="/pitch">/pitch</a>)</div>
        <div><b>✓</b> Workbench UI — <a href="/">/</a> (same host)</div>
      </div>
      <p class="lede" style="margin-top:1.4rem;animation-delay:.2s">Try Load happy path → Run pipeline → Download envelope. Then Load warning / min-out to see capability omitted.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener">Launch demo</a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">Open GitHub</a>
      </div>
    </section>

    <section class="slide" id="s6">
      <p class="kicker">Hard boundary</p>
      <h2>Seal on Moss Receipts — not a scanner.</h2>
      <ul>
        <li>Not Blockaid-style wallet scanning.</li>
        <li>Not a key vault, signer, or broadcaster.</li>
        <li>Not an MEV protector.</li>
        <li>Hosted demo is fixture-only; live RPC is local CLI / opt-in server flag.</li>
      </ul>
    </section>

    <section class="slide" id="s7">
      <p class="kicker">Closing</p>
      <h2>Moss provides evidence. Sealmoss forces Agents to use it.</h2>
      <p class="lede">Built for Monad Agent trading workbenches — verifiable envelopes before any human signs.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener">Demo</a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
        <a class="cta ghost" href="/">Workbench</a>
      </div>
      <p class="meta">Sealmoss · Monad Playground · never signs · never broadcasts</p>
    </section>
  </main>
</body>
</html>`;
