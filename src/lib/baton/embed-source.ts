/**
 * The embeddable script served at /embed.js. Hand-written, dependency-free,
 * ES2019 (no optional chaining), small enough to read in one sitting.
 *
 * It ships as a string so the route needs no file tracing. Leading whitespace
 * is stripped at load (nothing else is minified). Do not use backticks or `${`
 * inside it. engine.test.ts guards the size, the syntax and the "no innerHTML"
 * rule.
 */
const dark = "--bg:#15110e;--fg:#f2eee5;--muted:#aaa39a;--line:#2d2824;--ring:#ff9454";

/** Card styles: Relay bone paper by day, track-night by dark or `auto` + prefers-color-scheme. */
const css = `
  :host{display:block;overflow-wrap:anywhere;--bg:#f8f4eb;--fg:#130e0a;--muted:#5f564e;--line:#dad3c9;--ring:#aa3606;--signal:var(--baton-accent,#fb6c2b);--on:#170d08;--sans:var(--baton-font,system-ui,sans-serif);--mono:ui-monospace,Menlo,Consolas,monospace}
  :host([theme=dark]){${dark}}
  @media (prefers-color-scheme:dark){:host([theme=auto]){${dark}}}
  :host([mode=toast]){position:fixed;right:16px;bottom:16px;z-index:2147483000;width:360px;max-width:calc(100vw - 32px)}
  :host([mode=inline]){max-width:420px;margin:12px 0}
  .card{position:relative;padding:16px;border:1px solid var(--line);border-radius:var(--baton-radius,14px);color:var(--fg);
    background:var(--bg);
    box-shadow:0 12px 32px -8px #0005;font:14px/1.45 var(--sans)}
  :host([mode=toast]) .card{animation:in .34s cubic-bezier(.16,1,.3,1) both}
  @keyframes in{from{opacity:0;transform:translateY(16px)}}
  .top{display:flex;align-items:center;gap:8px;padding-right:32px}
  .pill{flex:none;padding:2px 9px;border-radius:999px;background:var(--signal);color:var(--on);font:700 11px/1.5 var(--sans)}
  .label{color:var(--muted);font:600 10.5px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}
  .title{margin:10px 0 0;font:750 17px/1.25 var(--sans)}
  .body{margin:4px 0 0;color:var(--muted)}
  .foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:14px}
  .cta{display:inline-flex;gap:6px;padding:9px 14px;border-radius:10px;background:var(--signal);color:var(--on);font-weight:700;text-decoration:none}
  .host,.via{color:var(--muted);font:11px var(--mono)}
  .via{margin-left:auto}
  .x{position:absolute;top:10px;right:10px;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:none;color:var(--muted);font:20px/1 var(--sans);cursor:pointer}
  :focus-visible{outline:2px solid var(--ring);outline-offset:2px}
  @media (prefers-reduced-motion:reduce){.card{animation:none!important}}
`
  .split("\n")
  .map((line) => line.trim())
  .join("");

const source = String.raw`(function () {
  'use strict';
  var script = document.currentScript || document.querySelector('script[data-key][src*="embed.js"]');
  if (!script || !script.src) return;
  var origin = new URL(script.src, location.href).origin;
  var attr = function (name) { return script.getAttribute(name) || ''; };
  var theme = attr('data-theme');
  if (theme !== 'light' && theme !== 'dark') theme = 'auto';
  var key = attr('data-key');
  var ctx0 = attr('data-ctx');
  var current = null;

  var CSS = __CSS__;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function safeUrl(value) { return /^https?:\/\//i.test(value) ? value : ''; }
  function link(cls, href, text) {
    var a = el('a', cls, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  class BatonCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    set data(d) { this._d = d; if (this.isConnected) this._render(); }
    connectedCallback() { if (this._d) this._render(); }
    disconnectedCallback() { this._unkey(); }
    _unkey() { document.removeEventListener('keydown', this._k); }
    _render() {
      var self = this, d = this._d, c = d.card, root = this.shadowRoot;
      this._unkey();
      root.textContent = '';
      root.appendChild(el('style', null, CSS));

      var card = el('aside', 'card');
      card.setAttribute('role', 'complementary');
      card.setAttribute('aria-label', 'Next step: ' + c.tool.name);

      var top = el('div', 'top');
      var via = c.via && c.via.length ? ' · via ' + c.via.slice(0, 2).join(', ') : '';
      top.appendChild(el('span', 'pill', 'baton'));
      top.appendChild(el('span', 'label', 'Next step' + via));
      card.appendChild(top);
      card.appendChild(el('p', 'title', c.title));
      if (c.body) card.appendChild(el('p', 'body', c.body));

      var foot = el('div', 'foot');
      var cta = link('cta', c.href, c.cta || 'Open');
      cta.appendChild(el('span', null, '→')).setAttribute('aria-hidden', 'true');
      foot.appendChild(cta);
      if (c.tool.host) foot.appendChild(el('span', 'host', c.tool.host));
      var powered = d.badge ? safeUrl(d.poweredBy) : '';
      if (powered) foot.appendChild(link('via', powered, 'passed by Baton'));
      card.appendChild(foot);

      var x = el('button', 'x', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Close');
      x.addEventListener('click', function () { self.remove(); });
      card.appendChild(x);
      root.appendChild(card);

      if (this.getAttribute('mode') === 'toast') {
        this._k = function (e) { if (e.key === 'Escape') self.remove(); };
        document.addEventListener('keydown', this._k);
      }
    }
  }
  if (!customElements.get('baton-card')) customElements.define('baton-card', BatonCard);

  function show(d, opts) {
    var c = d && d.card;
    if (!c || !c.title || !c.tool || !safeUrl(c.href)) return false;
    var target = opts.target;
    if (typeof target === 'string') {
      try { target = document.querySelector(target); } catch (e) { target = null; }
    }
    if (!(target instanceof Element)) target = null;
    var own = target && target.localName === 'baton-card';
    var node = own ? target : document.createElement('baton-card');
    if (!own && current) current.remove();
    var inline = !!target || attr('data-position') === 'inline';
    node.setAttribute('theme', theme);
    node.setAttribute('mode', inline ? 'inline' : 'toast');
    node.data = d;
    if (!own) {
      if (target) target.appendChild(node);
      else if (inline && script.parentNode) script.parentNode.insertBefore(node, script.nextSibling);
      else (document.body || document.documentElement).appendChild(node);
    }
    current = node;
    return true;
  }

  function pass(opts) {
    try {
      opts = opts || {};
      var ctx = opts.ctx || ctx0;
      if (!key) return Promise.resolve(false);
      var url = origin + '/api/baton/v1/card?key=' + encodeURIComponent(key) + (ctx ? '&ctx=' + encodeURIComponent(String(ctx)) : '');
      return fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' })
        .then(function (res) { return res.status === 200 ? res.json().then(function (d) { return show(d, opts); }) : false; })
        .catch(function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  window.baton = { pass: pass };
})();
`;

export const EMBED_SOURCE = source
  .replace("__CSS__", () => JSON.stringify(css))
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .join("\n");
