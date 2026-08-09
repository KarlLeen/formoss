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
    .flow span {
      display: block;
      background: rgba(255,255,255,.45);
      border: 1px solid var(--line);
      padding: .65rem .8rem;
      color: var(--ink);
    }
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
    <a href="#s7">7</a><a href="#s8">8</a><a href="#s9">9</a>
  </nav>
  <main class="deck">

    <!-- 1 Hero -->
    <section class="slide" id="s1">
      <p class="kicker">
        <span class="zh">Monad Playground · Pitch Deck</span>
        <span class="en">Monad Playground · Pitch Deck</span>
      </p>
      <h1 class="brand">Sealmoss</h1>
      <p class="lede zh">给 Moss Capability 树盖章：Agent 必须 simulate、遇 Warning 即停，并把有序 Receipt 证据与 intent 对齐后，才嵌套未签名 Capability。</p>
      <p class="lede en">The seal for Moss Capability trees — Agents must simulate, stop on Warnings, and align ordered Receipt evidence with intent before any unsigned Capability is nested.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener"><span class="zh">打开 Demo →</span><span class="en">Open live demo →</span></a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
        <a class="cta ghost" href="/"><span class="zh">Workbench</span><span class="en">Workbench</span></a>
      </div>
      <p class="meta">Demo https://sm.limlamleen.com · Repo https://github.com/KarlLeen/formoss · Pitch /pitch</p>
    </section>

    <!-- 2 What is Moss -->
    <section class="slide" id="s2">
      <p class="kicker">
        <span class="zh">Moss 是什么</span>
        <span class="en">What is Moss</span>
      </p>
      <h2 class="zh">先把 Monad 协议操作变成可调用的「能力包」</h2>
      <h2 class="en">Turn Monad protocol ops into Agent-callable packages</h2>
      <p class="zh">Moss 不让 Agent 自己拼 calldata。它把 Kuru swap、WMON wrap 等操作做成协议自带的 Capability，并强制走模拟以产出证据。</p>
      <p class="en">Moss does not let Agents hand-write calldata. It turns ops like Kuru swap and WMON wrap into protocol-owned Capabilities, and simulates to produce evidence.</p>
      <ul>
        <li class="zh"><span class="term">discover / load</span> — 能做什么、参数规则是什么</li>
        <li class="en"><span class="term">discover / load</span> — what methods exist and their parameter contracts</li>
        <li class="zh"><span class="term">action</span> — 生成一棵<strong>未签名</strong>交易树（Capability）</li>
        <li class="en"><span class="term">action</span> — build an <strong>unsigned</strong> Capability tree</li>
        <li class="zh"><span class="term">simulate</span> — 产出 Warning、有序 Receipt 文本 / Outcome（试跑报告）</li>
        <li class="en"><span class="term">simulate</span> — emit Warnings and ordered Receipt texts / Outcomes</li>
      </ul>
      <p class="zh">Moss <strong>从不签名、从不广播</strong>。可以把它想成：<strong>施工图纸（Capability）+ 试跑报告（Receipt / Warning）</strong>。</p>
      <p class="en">Moss <strong>never signs or broadcasts</strong>. Think: <strong>blueprint (Capability) + dry-run report (Receipt / Warning)</strong>.</p>
      <p class="meta"><a href="https://github.com/nishuzumi/moss" target="_blank" rel="noopener">github.com/nishuzumi/moss</a></p>
    </section>

    <!-- 3 What is Sealmoss -->
    <section class="slide" id="s3">
      <p class="kicker">
        <span class="zh">Sealmoss 是什么</span>
        <span class="en">What is Sealmoss</span>
      </p>
      <h2 class="zh">盖在 Moss 前面的闸门</h2>
      <h2 class="en">The gate in front of Moss</h2>
      <p class="zh">Moss 把证据交出来了，但默认<strong>不强制</strong> Agent「必须用证据」。Sealmoss 把纪律变成硬条件：证据没用到位，就不给出可嵌套的 Capability。</p>
      <p class="en">Moss produces evidence but does not force Agents to use it. Sealmoss turns that discipline into a hard gate: no nested Capability unless the evidence was used.</p>
      <div class="flow">
        <span class="zh">Intent → Moss action → Moss simulate → Sealmoss align → verified envelope</span>
        <span class="en">Intent → Moss action → Moss simulate → Sealmoss align → verified envelope</span>
        <span class="zh">失败 → failed-run envelope，capability: null（不能软忽略后还拿走可签树）</span>
        <span class="en">Fail → failed-run envelope with capability: null (no soft-ignore path to a signable tree)</span>
      </div>
      <p class="lede zh" style="margin-top:1.2rem">一句话：Moss 造证据；Sealmoss 不把证据用到位，就不放行。</p>
      <p class="lede en" style="margin-top:1.2rem">In one line: Moss makes evidence; Sealmoss withholds the Capability until evidence is used.</p>
    </section>

    <!-- 4 Problem + real-world evidence -->
    <section class="slide" id="s4">
      <p class="kicker">
        <span class="zh">问题 · 真实世界信号</span>
        <span class="en">Problem · real-world signals</span>
      </p>
      <h2 class="zh">Moss 交出证据后，Agent 仍可能</h2>
      <h2 class="en">After Moss returns evidence, Agents can still</h2>
      <ul>
        <li class="zh">不 <span class="term">simulate</span> 就往下走</li>
        <li class="en">Skip <span class="term">simulate</span> and continue</li>
        <li class="zh">看到 <span class="term">Warning</span> 装作没看见</li>
        <li class="en">Soft-ignore <span class="term">Warning</span>s</li>
        <li class="zh">不对照用户 Intent 与有序 <span class="term">Receipt</span> 文本</li>
        <li class="en">Never align user Intent with ordered <span class="term">Receipt</span> texts</li>
      </ul>
      <p class="zh" style="margin-top:1rem">这不是空想——行业已经在用文档规则、钱包管线、MCP 模式反复碰到同一缺口：</p>
      <p class="en" style="margin-top:1rem">This is not hypothetical — the industry keeps hitting the same gap via docs, wallet pipelines, and MCP patterns:</p>
      <div class="evidence">
        <a href="https://github.com/nishuzumi/moss/blob/main/docs/agent-skill.md" target="_blank" rel="noopener">
          <strong>Moss Agent safety rules (skill)</strong>
          <span class="zh">Moss 要求 MCP Agent「必须 simulate、Warning 即停、Receipt 对齐 Intent」——写在 skill 文档里，属于约定，不是运行时闸门。</span>
          <span class="en">Moss tells MCP Agents that simulate / stop-on-Warning / align Receipts are mandatory — as skill docs, not a runtime gate.</span>
        </a>
        <a href="https://cloud.google.com/blog/products/identity-security/using-mcp-with-web3-how-to-secure-blockchain-interacting-agents" target="_blank" rel="noopener">
          <strong>Google Cloud · MCP × Web3</strong>
          <span class="zh">指出多数加密 MCP 仍依赖配置私钥；更安全的路径是 Agent 只构造未签名交易、交回用户签名——关键是「证据与放行」谁来强制。</span>
          <span class="en">Notes that many crypto MCP servers still expect a private key; safer patterns return unsigned txs for humans to sign — the open question is who enforces evidence before release.</span>
        </a>
        <a href="https://github.com/nikicat/mcp-wallet-signer" target="_blank" rel="noopener">
          <strong>mcp-wallet-signer</strong>
          <span class="zh">生态共识：多数 blockchain MCP 要求把私钥写进配置，Agent 可无监督访问资金——说明「默认信任 Agent」仍是常态。</span>
          <span class="en">States the common case: most blockchain MCPs ask for a private key in config, giving Agents unsupervised fund access.</span>
        </a>
        <a href="https://docs.metamask.io/agent-wallet/" target="_blank" rel="noopener">
          <strong>MetaMask Agent Wallet</strong>
          <span class="zh">钱包侧把 simulation 做成默认强制管线（并叠加威胁扫描）——侧面证明：Agent 交易不能只靠「自觉」。</span>
          <span class="en">Makes transaction simulation a default mandatory pipeline (plus threat scanning) — evidence that Agent trades cannot rely on good faith alone.</span>
        </a>
      </div>
      <p class="meta zh">Sealmoss 的切口：不扫链、不管钥匙——只在 Moss Receipt 证据上盖章放行。</p>
      <p class="meta en">Sealmoss niche: not a scanner or key vault — a seal on Moss Receipt evidence.</p>
    </section>

    <!-- 5 Gates -->
    <section class="slide" id="s5">
      <p class="kicker">
        <span class="zh">Sealmoss 怎么做</span>
        <span class="en">How Sealmoss works</span>
      </p>
      <h2 class="zh">三道硬门，然后才给信封</h2>
      <h2 class="en">Three hard gates, then the envelope</h2>
      <ul>
        <li class="zh"><strong style="color:var(--ink)">Simulate 强制</strong> — 没有 Moss simulate 证据（或 offline fixture）就没有 verified</li>
        <li class="en"><strong style="color:var(--ink)">Simulate mandatory</strong> — no verified run without Moss simulate evidence (or an offline fixture)</li>
        <li class="zh"><strong style="color:var(--ink)">Warning 即停</strong> — failed-run envelope，<code>capability: null</code></li>
        <li class="en"><strong style="color:var(--ink)">Stop on Warning</strong> — failed-run envelope, <code>capability: null</code></li>
        <li class="zh"><strong style="color:var(--ink)">Receipt ↔ Intent</strong> — 有序叶子文本对齐（spender、Kuru minOut / slippage floor 等）</li>
        <li class="en"><strong style="color:var(--ink)">Receipt ↔ Intent</strong> — ordered leaf texts must match (spender, Kuru minOut / slippage floor, …)</li>
        <li class="zh">全过才写 verified envelope：Intent + texts + align + Capability + sha256 digest</li>
        <li class="en">Only then: verified envelope = Intent + texts + align + Capability + sha256 digest</li>
      </ul>
      <p class="zh">签名仍在信封之外——人类 / 钱包审阅后再签。Sealmoss 从不签名、从不广播。</p>
      <p class="en">Signing stays outside the envelope — humans / wallets review, then sign. Sealmoss never signs or broadcasts.</p>
    </section>

    <!-- 6 Monad -->
    <section class="slide" id="s6">
      <p class="kicker">
        <span class="zh">Monad 相关集成</span>
        <span class="en">Monad integration</span>
      </p>
      <h2 class="zh">Moss 跑在 Monad 上；Sealmoss 是闸门</h2>
      <h2 class="en">Moss runs on Monad; Sealmoss is the gate</h2>
      <ul>
        <li class="zh"><strong style="color:var(--ink)">Chain：</strong>Monad mainnet（chain id 143），经 Moss Runtime + RPC</li>
        <li class="en"><strong style="color:var(--ink)">Chain:</strong> Monad mainnet (chain id 143) via Moss Runtime + RPC</li>
        <li class="zh"><strong style="color:var(--ink)">Engine：</strong><code>@themoss/*</code> Registry <code>action</code> 建树；simulator 产出有序 Change / Receipt / Warning</li>
        <li class="en"><strong style="color:var(--ink)">Engine:</strong> <code>@themoss/*</code> Registry <code>action</code> builds trees; simulator emits ordered Changes / Receipts / Warnings</li>
        <li class="zh"><strong style="color:var(--ink)">Protocols：</strong>Kuru swap（含嵌套 ERC-20 approve）、WMON wrap / unwrap</li>
        <li class="en"><strong style="color:var(--ink)">Protocols:</strong> Kuru swap (nested ERC-20 approve), WMON wrap / unwrap</li>
        <li class="zh"><strong style="color:var(--ink)">Sealmoss：</strong>以库方式消费 Moss；表驱动 align rules；输出 verified / failed-run envelope</li>
        <li class="en"><strong style="color:var(--ink)">Sealmoss:</strong> consumes Moss as a library; table-driven align rules; emits verified / failed-run envelopes</li>
      </ul>
    </section>

    <!-- 7 Links checklist -->
    <section class="slide" id="s7">
      <p class="kicker">
        <span class="zh">提交材料</span>
        <span class="en">Submission links</span>
      </p>
      <h2 class="zh">Demo · GitHub · Pitch</h2>
      <h2 class="en">Demo · GitHub · Pitch</h2>
      <div class="checklist">
        <div><b>✓</b> <span class="zh">Demo（fixture-only Web）</span><span class="en">Demo (fixture-only web)</span> — <a href="https://sm.limlamleen.com" target="_blank" rel="noopener">sm.limlamleen.com</a></div>
        <div><b>✓</b> GitHub — <a href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">github.com/KarlLeen/formoss</a></div>
        <div><b>✓</b> Pitch Deck — <a href="/pitch">/pitch</a></div>
        <div><b>✓</b> Workbench — <a href="/">/</a></div>
      </div>
      <p class="lede zh" style="margin-top:1.3rem">建议路径：Load happy path → Run → Download envelope；再试 warning / min-out，看 capability 被省略。</p>
      <p class="lede en" style="margin-top:1.3rem">Try Load happy path → Run → Download envelope; then warning / min-out to see capability omitted.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener"><span class="zh">启动 Demo</span><span class="en">Launch demo</span></a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
      </div>
    </section>

    <!-- 8 Boundary -->
    <section class="slide" id="s8">
      <p class="kicker">
        <span class="zh">硬边界</span>
        <span class="en">Hard boundary</span>
      </p>
      <h2 class="zh">Seal on Moss Receipts — 不是扫描器</h2>
      <h2 class="en">Seal on Moss Receipts — not a scanner</h2>
      <ul>
        <li class="zh">不是 Blockaid 式钱包扫链</li>
        <li class="en">Not Blockaid-style wallet scanning</li>
        <li class="zh">不是 key vault / signer / broadcaster</li>
        <li class="en">Not a key vault, signer, or broadcaster</li>
        <li class="zh">不是 MEV 保护器</li>
        <li class="en">Not an MEV protector</li>
        <li class="zh">托管 Demo 默认 fixture-only；live RPC 仅本地 CLI / 显式环境开关</li>
        <li class="en">Hosted demo is fixture-only; live RPC stays on local CLI / explicit env flag</li>
      </ul>
    </section>

    <!-- 9 Close -->
    <section class="slide" id="s9">
      <p class="kicker">
        <span class="zh">结尾</span>
        <span class="en">Closing</span>
      </p>
      <h2 class="zh">Moss 提供证据。Sealmoss 强迫 Agent 用它。</h2>
      <h2 class="en">Moss provides evidence. Sealmoss forces Agents to use it.</h2>
      <p class="lede zh">面向 Monad 上的 Agent 交易工作台——在人类签名之前，先有可验证信封。</p>
      <p class="lede en">Built for Monad Agent trading workbenches — a verifiable envelope before any human signs.</p>
      <div class="links">
        <a class="cta" href="https://sm.limlamleen.com" target="_blank" rel="noopener">Demo</a>
        <a class="cta ghost" href="https://github.com/KarlLeen/formoss" target="_blank" rel="noopener">GitHub</a>
        <a class="cta ghost" href="/">Workbench</a>
      </div>
      <p class="meta">Sealmoss · Monad Playground · never signs · never broadcasts</p>
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
