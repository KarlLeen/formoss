/** Bilingual pitch deck (zh / en). Chinese keeps English for technical terms. */
export const pitchHtml = `<!doctype html>
<html lang="zh-Hans">
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
      --serif: "Source Serif 4", "Noto Serif SC", ui-serif, Georgia, serif;
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
      padding-top: clamp(3.5rem, 8vw, 5rem);
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
    .slide > * { position: relative; z-index: 1; max-width: 58rem; }
    .kicker {
      font-family: var(--mono);
      font-size: .72rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 1rem;
    }
    .brand {
      font-family: var(--display);
      font-weight: 800;
      font-size: clamp(3.2rem, 11vw, 6.5rem);
      line-height: .88;
      letter-spacing: -.05em;
      color: var(--accent);
      margin: 0 0 1rem;
    }
    h2 {
      font-family: var(--display);
      font-weight: 700;
      font-size: clamp(1.75rem, 4.8vw, 3rem);
      line-height: 1.08;
      letter-spacing: -.03em;
      margin: 0 0 1rem;
      max-width: 22ch;
    }
    p, li {
      font-size: clamp(1rem, 2.1vw, 1.2rem);
      line-height: 1.5;
      color: var(--muted);
      margin: 0 0 .75rem;
      max-width: 42rem;
    }
    .lede {
      font-size: clamp(1.1rem, 2.4vw, 1.35rem);
      color: var(--ink);
      max-width: 36rem;
    }
    ul { margin: 0; padding: 0; list-style: none; display: grid; gap: .55rem; }
    li {
      padding-left: 1rem;
      border-left: 3px solid var(--accent2);
      margin: 0;
    }
    code, .term {
      font-family: var(--mono);
      font-size: .88em;
      color: var(--accent);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
      margin-top: 1.35rem;
    }
    a.cta {
      display: inline-flex;
      align-items: center;
      font-family: var(--mono);
      font-size: .78rem;
      font-weight: 500;
      text-decoration: none;
      color: #f3faf7;
      background: var(--accent);
      border: 1px solid var(--accent);
      padding: .7rem 1rem;
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
      font-size: .74rem;
      color: var(--muted);
      margin-top: 1.1rem;
      word-break: break-all;
    }
    .flow {
      display: grid;
      gap: .5rem;
      margin: 1.1rem 0 0;
      font-family: var(--mono);
      font-size: .78rem;
    }
    .flow span, .cmds code {
      display: block;
      background: rgba(255,255,255,.45);
      border: 1px solid var(--line);
      padding: .65rem .8rem;
      color: var(--ink);
    }
    .cmds {
      display: grid;
      gap: .45rem;
      margin: 1rem 0 0;
      font-family: var(--mono);
      font-size: .72rem;
    }
    .cmds code { white-space: pre-wrap; word-break: break-word; }
    .checklist {
      display: grid;
      gap: .5rem;
      margin-top: 1rem;
      font-family: var(--mono);
      font-size: .8rem;
    }
    .checklist div {
      display: flex;
      gap: .55rem;
      align-items: baseline;
      color: var(--ink);
    }
    .checklist b { color: var(--accent2); }
    .evidence {
      display: grid;
      gap: .65rem;
      margin-top: 1rem;
    }
    .evidence a {
      display: block;
      text-decoration: none;
      color: inherit;
      background: rgba(255,255,255,.5);
      border: 1px solid var(--line);
      padding: .75rem .9rem;
      transition: border-color .2s ease, transform .2s ease;
    }
    .evidence a:hover {
      border-color: var(--accent2);
      transform: translateY(-1px);
    }
    .evidence strong {
      display: block;
      font-family: var(--mono);
      font-size: .72rem;
      color: var(--accent);
      margin-bottom: .25rem;
      font-weight: 500;
    }
    .evidence span {
      font-size: .95rem;
      color: var(--muted);
      line-height: 1.4;
    }
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
      gap: .75rem;
      padding: .65rem 1rem;
      font-family: var(--mono);
      font-size: .72rem;
      background: rgba(231,239,233,.82);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--line);
    }
    .topbar a { color: var(--accent); text-decoration: none; font-weight: 500; }
    .lang-switch {
      display: inline-flex;
      border: 1px solid var(--line);
      overflow: hidden;
    }
    .lang-switch button {
      font-family: var(--mono);
      font-size: .7rem;
      border: 0;
      background: transparent;
      color: var(--muted);
      padding: .35rem .55rem;
      cursor: pointer;
    }
    .lang-switch button[aria-pressed="true"] {
      background: var(--accent);
      color: #f3faf7;
    }
    html[data-lang="en"] .zh { display: none !important; }
    html[data-lang="zh"] .en { display: none !important; }
    @media (max-width: 720px) {
      .nav { display: none; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <span>Sealmoss · Pitch</span>
    <span style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;justify-content:flex-end">
      <span class="lang-switch" role="group" aria-label="Language">
        <button type="button" id="lang-zh" aria-pressed="true">中文</button>
        <button type="button" id="lang-en" aria-pressed="false">EN</button>
      </span>
      <span>
        <a href="/">Workbench</a>
        ·
        <a href="https://sm.limlamleen.com" target="_blank" rel="noopener">Demo</a>
        ·
        <a href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
      </span>
    </span>
  </div>
  <nav class="nav" aria-label="Slides">
    <a href="#s1">1</a><a href="#s2">2</a><a href="#s3">3</a>
    <a href="#s4">4</a><a href="#s5">5</a><a href="#s6">6</a>
  </nav>
  <main class="deck">

    <!-- 1 Hero -->
    <section class="slide" id="s1">
      <p class="kicker">
        <span class="zh">Monad Playground · Pitch Deck</span>
        <span class="en">Monad Playground · Pitch Deck</span>
      </p>
      <h1 class="brand">Sealmoss</h1>
      <p class="lede zh">给 Moss Capability 树盖章：Agent 必须 simulate、遇 Warning 即停，并把有序 Receipt 与 Intent 对齐后，才嵌套未签名 Capability。</p>
      <p class="lede en">The seal for Moss Capability trees — Agents must simulate, stop on Warnings, and align ordered Receipts with Intent before any unsigned Capability is nested.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener"><span class="zh">打开 Demo →</span><span class="en">Open live demo →</span></a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
        <a class="cta ghost" href="/">Workbench</a>
      </div>
      <p class="meta">sm.limlamleen.com · github.com/KarlLeen/formoss · /pitch</p>
    </section>

    <!-- 2 Moss + Sealmoss (was s2+s3) -->
    <section class="slide" id="s2">
      <p class="kicker">
        <span class="zh">Moss · Sealmoss</span>
        <span class="en">Moss · Sealmoss</span>
      </p>
      <h2 class="zh">Moss 造证据；Sealmoss 强制用证据</h2>
      <h2 class="en">Moss makes evidence; Sealmoss forces its use</h2>
      <p class="zh">Moss 把 Kuru swap、WMON wrap 等做成协议自带 Capability：<span class="term">action</span> 建<strong>未签名</strong>树，<span class="term">simulate</span> 产出 Warning 与有序 Receipt——从不签名、从不广播。</p>
      <p class="en">Moss turns ops like Kuru swap and WMON wrap into protocol-owned Capabilities: <span class="term">action</span> builds an <strong>unsigned</strong> tree; <span class="term">simulate</span> emits Warnings and ordered Receipts — never signs or broadcasts.</p>
      <p class="zh">Moss 默认<strong>不强制</strong> Agent 用证据。Sealmoss 把纪律变成硬闸门：证据没用到位，就不给出可嵌套的 Capability。</p>
      <p class="en">Moss does not force Agents to use that evidence. Sealmoss hard-gates it: no nested Capability unless the evidence was used.</p>
      <div class="flow">
        <span>Intent → Moss action → Moss simulate → Sealmoss align → verified envelope</span>
        <span class="zh">失败 → failed-run，capability: null（不能软忽略后还拿走可签树）</span>
        <span class="en">Fail → failed-run, capability: null (no soft-ignore path to a signable tree)</span>
      </div>
      <p class="meta"><a href="https://github.com/nishuzumi/moss" target="_blank" rel="noopener">github.com/nishuzumi/moss</a></p>
    </section>

    <!-- 3 Problem + gates + evidence (was s4+s5) -->
    <section class="slide" id="s3">
      <p class="kicker">
        <span class="zh">缺口 · 三道硬门</span>
        <span class="en">Gap · three hard gates</span>
      </p>
      <h2 class="zh">证据交出来了，Agent 仍可能绕过</h2>
      <h2 class="en">Evidence exists — Agents can still bypass it</h2>
      <ul>
        <li class="zh"><strong style="color:var(--ink)">Simulate 强制</strong> — 堵住「不 simulate 就往下走」；无 Moss 证据 / fixture 就没有 verified</li>
        <li class="en"><strong style="color:var(--ink)">Simulate mandatory</strong> — blocks skipping simulate; no verified run without Moss evidence or a fixture</li>
        <li class="zh"><strong style="color:var(--ink)">Warning 即停</strong> — 堵住「装作没看见」；failed-run，<code>capability: null</code></li>
        <li class="en"><strong style="color:var(--ink)">Stop on Warning</strong> — blocks soft-ignore; failed-run, <code>capability: null</code></li>
        <li class="zh"><strong style="color:var(--ink)">Receipt ↔ Intent</strong> — 堵住「不对照用户意图」；有序叶子文本对齐（spender、Kuru minOut 等）后才写 verified envelope（含 sha256 digest）</li>
        <li class="en"><strong style="color:var(--ink)">Receipt ↔ Intent</strong> — blocks skipping alignment; ordered leaf texts must match before a verified envelope (with sha256 digest)</li>
      </ul>
      <p class="zh" style="margin-top:.9rem">签名仍在信封外；行业信号也指向同一缺口（约定 ≠ 运行时闸门）：</p>
      <p class="en" style="margin-top:.9rem">Signing stays outside the envelope. Industry signals point to the same gap (docs ≠ a runtime gate):</p>
      <div class="evidence">
        <a href="https://github.com/nishuzumi/moss/blob/main/docs/agent-skill.md" target="_blank" rel="noopener">
          <strong>Moss agent-skill</strong>
          <span class="zh">必须 simulate / Warning 即停 / Receipt 对齐 — 写在 skill，不是硬闸门</span>
          <span class="en">simulate / stop-on-Warning / align — skill docs, not a hard gate</span>
        </a>
        <a href="https://cloud.google.com/blog/products/identity-security/using-mcp-with-web3-how-to-secure-blockchain-interacting-agents" target="_blank" rel="noopener">
          <strong>Google Cloud · MCP × Web3</strong>
          <span class="zh">更安全路径：Agent 只交未签名交易；谁强制「证据再放行」仍开放</span>
          <span class="en">Safer path: unsigned txs for humans; who enforces evidence-before-release is open</span>
        </a>
        <a href="https://github.com/nikicat/mcp-wallet-signer" target="_blank" rel="noopener">
          <strong>mcp-wallet-signer</strong>
          <span class="zh">多数 blockchain MCP 仍把私钥写进配置</span>
          <span class="en">Most blockchain MCPs still put private keys in config</span>
        </a>
        <a href="https://docs.metamask.io/agent-wallet/" target="_blank" rel="noopener">
          <strong>MetaMask Agent Wallet</strong>
          <span class="zh">钱包侧把 simulation 做成默认强制管线</span>
          <span class="en">Makes simulation a default mandatory pipeline</span>
        </a>
      </div>
    </section>

    <!-- 4 Lightweight + boundary (was s9+s10) -->
    <section class="slide" id="s4">
      <p class="kicker">
        <span class="zh">为什么轻量 · 硬边界</span>
        <span class="en">Why lightweight · hard boundary</span>
      </p>
      <h2 class="zh">可嵌入的证据闸门 — 不是整套控制台</h2>
      <h2 class="en">An embeddable evidence gate — not a full console</h2>
      <p class="zh">同类完整平台做端到端体验（Agent 控制台、攻击演示、签名门禁 UI）。Sealmoss 只做<strong>可搬运的闸门</strong>：</p>
      <p class="en">Full platforms own the end-to-end experience (Agent console, attack demos, signing-gate UI). Sealmoss ships only a <strong>portable gate</strong>:</p>
      <ul>
        <li class="zh"><strong style="color:var(--ink)">无 LLM 在环</strong> — Intent 是 JSON；裁决是按 <code>protocol.method</code> 挂的规则表，不托管模型 / Agent harness</li>
        <li class="en"><strong style="color:var(--ink)">No LLM in the loop</strong> — Intent is JSON; verdicts are a coded rule list by <code>protocol.method</code> — no hosted model or Agent harness</li>
        <li class="zh"><strong style="color:var(--ink)">库 + CLI</strong> — <code>@sealmoss/core</code> / <code>sealmoss run</code> 可塞进既有 MCP、脚本或别人的 UI</li>
        <li class="en"><strong style="color:var(--ink)">Library + CLI</strong> — drop into an existing MCP, script, or another UI</li>
        <li class="zh"><strong style="color:var(--ink)">离线可复现 · 审计面小</strong> — fixture 无 RPC；核心是 align + envelope digest，不是「平台 + Agent + 演示」整栈</li>
        <li class="en"><strong style="color:var(--ink)">Offline + small audit surface</strong> — fixtures need no RPC; core is align + envelope digest, not a full platform stack</li>
        <li class="zh"><strong style="color:var(--ink)">不是</strong>扫链器 / key vault / signer / broadcaster / MEV 保护；托管 Demo 默认 fixture-only</li>
        <li class="en"><strong style="color:var(--ink)">Not</strong> a scanner, key vault, signer, broadcaster, or MEV protector; hosted demo is fixture-only</li>
      </ul>
    </section>

    <!-- 5 Monad + CLI (was s6+s7) -->
    <section class="slide" id="s5">
      <p class="kicker">
        <span class="zh">Monad · CLI</span>
        <span class="en">Monad · CLI</span>
      </p>
      <h2 class="zh">Moss 跑在 Monad；CLI 把证据送进闸门</h2>
      <h2 class="en">Moss on Monad; CLI feeds the gate</h2>
      <ul>
        <li class="zh"><strong style="color:var(--ink)">Chain 143</strong> — Moss Runtime + RPC；Kuru swap（含 approve）、WMON wrap / unwrap</li>
        <li class="en"><strong style="color:var(--ink)">Chain 143</strong> — Moss Runtime + RPC; Kuru swap (nested approve), WMON wrap / unwrap</li>
        <li class="zh"><strong style="color:var(--ink)">进程内调用</strong> — Sealmoss 把 <code>@themoss/*</code> 当 npm 依赖：<code>action</code> → <code>simulate</code> → align → envelope（不另写模拟引擎）</li>
        <li class="en"><strong style="color:var(--ink)">In-process</strong> — Sealmoss imports <code>@themoss/*</code>: <code>action</code> → <code>simulate</code> → align → envelope (no reimplemented simulator)</li>
        <li class="zh"><strong style="color:var(--ink)">离线 / Live</strong> — fixture 跳过 RPC 仍走全闸门；<code>capture</code> 可抓主网再复用</li>
        <li class="en"><strong style="color:var(--ink)">Offline / Live</strong> — fixtures skip RPC but run the full gate; <code>capture</code> hits mainnet then reuses offline</li>
      </ul>
      <div class="cmds">
        <code>pnpm demo:offline   # exit 0
pnpm demo:warning   # exit 2
pnpm demo:min-out   # exit 3
pnpm sealmoss run --intent demos/swap-mon-usdc.json \\
  --fixture demos/fixtures/kuru-swap-ok.json
pnpm capture:kuru
pnpm sealmoss verify-envelope verified-capability.json</code>
      </div>
      <p class="meta zh">exit 0 = verified · 2 = Warning · 3 = align fail · 从不签名 / 广播</p>
      <p class="meta en">exit 0 = verified · 2 = Warning · 3 = align fail · never signs / broadcasts</p>
    </section>

    <!-- 6 Close + links (was s8+s11) -->
    <section class="slide" id="s6">
      <p class="kicker">
        <span class="zh">试一把</span>
        <span class="en">Try it</span>
      </p>
      <h2 class="zh">在人类签名之前，先有可验证信封</h2>
      <h2 class="en">A verifiable envelope before any human signs</h2>
      <div class="checklist">
        <div><b>✓</b> Demo — <a href="https://sm.limlamleen.com" target="_blank" rel="noopener">sm.limlamleen.com</a></div>
        <div><b>✓</b> GitHub — <a href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">github.com/KarlLeen/formoss</a></div>
        <div><b>✓</b> Pitch — <a href="/pitch">/pitch</a> · Workbench — <a href="/">/</a></div>
      </div>
      <p class="lede zh" style="margin-top:1.1rem">建议：Load happy path → Run → Download；再试 warning / min-out，看 capability 被省略。</p>
      <p class="lede en" style="margin-top:1.1rem">Try Load happy path → Run → Download; then warning / min-out to see capability omitted.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener">Demo</a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
        <a class="cta ghost" href="/">Workbench</a>
      </div>
      <p class="meta">Sealmoss · never signs · never broadcasts</p>
    </section>
  </main>
  <script>
    (function () {
      var root = document.documentElement;
      var zhBtn = document.getElementById("lang-zh");
      var enBtn = document.getElementById("lang-en");
      function setLang(lang) {
        root.setAttribute("data-lang", lang);
        root.lang = lang === "zh" ? "zh-Hans" : "en";
        zhBtn.setAttribute("aria-pressed", lang === "zh" ? "true" : "false");
        enBtn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
        try { localStorage.setItem("sealmoss-pitch-lang", lang); } catch (_) {}
      }
      zhBtn.onclick = function () { setLang("zh"); };
      enBtn.onclick = function () { setLang("en"); };
      var saved = null;
      try { saved = localStorage.getItem("sealmoss-pitch-lang"); } catch (_) {}
      setLang(saved === "en" || saved === "zh" ? saved : "zh");
    })();
  </script>
</body>
</html>`;
