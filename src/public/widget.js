(function () {
  'use strict';

  // ── Bootstrap ──────────────────────────────────────────────
  const scriptEl = document.currentScript || document.querySelector('script[data-pet-id]');
  if (!scriptEl) return;

  const PET_ID = scriptEl.getAttribute('data-pet-id');
  if (!PET_ID) return;

  const API_BASE = scriptEl.src.replace('/widget.js', '');
  let petConfig = null;
  let isOpen = false;
  let visitorId = localStorage.getItem('pawly_visitor_id') || ('visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  let conversationId = null;
  localStorage.setItem('pawly_visitor_id', visitorId);

  // ── Fetch pet config ───────────────────────────────────────
  async function init() {
    try {
      const res = await fetch(API_BASE + '/api/pets/' + PET_ID + '/settings');
      if (!res.ok) return;
      petConfig = await res.json();
      injectWidget();
    } catch (e) {
      console.warn('[Pawly] Failed to load config:', e);
    }
  }

  // ── SVG Pet ────────────────────────────────────────────────
  function petSVG(color, size) {
    size = size || 70;
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="106" rx="26" ry="5" fill="${color}" opacity="0.2"/>
      <ellipse cx="60" cy="72" rx="32" ry="28" fill="${color}"/>
      <ellipse cx="60" cy="75" rx="18" ry="16" fill="white" opacity="0.12"/>
      <circle cx="60" cy="45" r="28" fill="${color}"/>
      <polygon points="34,24 26,8 44,20" fill="${color}"/>
      <polygon points="86,24 94,8 76,20" fill="${color}"/>
      <polygon points="35,22 29,12 42,20" fill="#f472b6" opacity="0.6"/>
      <polygon points="85,22 91,12 78,20" fill="#f472b6" opacity="0.6"/>
      <ellipse cx="49" cy="43" rx="6" ry="7" fill="white"/>
      <ellipse cx="71" cy="43" rx="6" ry="7" fill="white"/>
      <circle cx="51" cy="44" r="4" fill="#1a1a2e"/>
      <circle cx="73" cy="44" r="4" fill="#1a1a2e"/>
      <circle cx="53" cy="42" r="1.5" fill="white"/>
      <circle cx="75" cy="42" r="1.5" fill="white"/>
      <ellipse cx="60" cy="53" rx="3" ry="2" fill="#f472b6"/>
      <path d="M55 56 Q60 60 65 56" stroke="#f472b6" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <line x1="30" y1="52" x2="52" y2="54" stroke="white" stroke-width="1" opacity="0.5"/>
      <line x1="30" y1="56" x2="52" y2="56" stroke="white" stroke-width="1" opacity="0.5"/>
      <line x1="68" y1="54" x2="90" y2="52" stroke="white" stroke-width="1" opacity="0.5"/>
      <line x1="68" y1="56" x2="90" y2="56" stroke="white" stroke-width="1" opacity="0.5"/>
      <path d="M88 80 Q108 65 104 50 Q102 42 96 46" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <ellipse cx="40" cy="96" rx="10" ry="8" fill="${color}"/>
      <ellipse cx="80" cy="96" rx="10" ry="8" fill="${color}"/>
      <ellipse cx="43" cy="52" rx="5" ry="3" fill="#f472b6" opacity="0.22"/>
      <ellipse cx="77" cy="52" rx="5" ry="3" fill="#f472b6" opacity="0.22"/>
    </svg>`;
  }

  // ── Styles ─────────────────────────────────────────────────
  function buildCSS(color, position) {
    const isRight = position !== 'bottom-left';
    const side = isRight ? 'right:20px' : 'left:20px';
    return `
      #pawly-root { all: initial; }
      #pawly-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #pawly-btn {
        position: fixed; bottom: 20px; ${side}; z-index: 2147483647;
        width: 76px; height: 76px; cursor: pointer; border: none; background: none; padding: 0;
        filter: drop-shadow(0 4px 16px ${color}66);
        animation: pawly-float 3s ease-in-out infinite;
        transition: transform 0.2s ease;
      }
      #pawly-btn:hover { transform: scale(1.1); }
      #pawly-bubble {
        position: fixed; bottom: 110px; ${side}; z-index: 2147483647;
        background: #111118; color: white; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px 16px ${isRight ? '0' : '16px'} ${isRight ? '16px' : '0'};
        padding: 10px 14px; font-size: 13px; max-width: 220px; line-height: 1.4;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4); cursor: pointer;
        animation: pawly-fadein 0.4s ease;
      }
      #pawly-bubble::after {
        content: ''; position: absolute; bottom: -8px;
        ${isRight ? 'right: 16px' : 'left: 16px'};
        width: 0; height: 0;
        border-left: 8px solid transparent; border-right: 8px solid transparent;
        border-top: 8px solid #111118;
      }
      #pawly-panel {
        position: fixed; bottom: 110px; ${side}; z-index: 2147483647;
        width: 360px; height: 520px; background: #0d0d14; border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column;
        overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        animation: pawly-slidein 0.3s ease;
      }
      #pawly-header {
        background: ${color}; padding: 14px 16px; display: flex; align-items: center; gap: 10px;
        flex-shrink: 0;
      }
      #pawly-header-name { font-weight: 700; font-size: 15px; color: white; }
      #pawly-header-status { font-size: 12px; color: rgba(255,255,255,0.75); }
      #pawly-close {
        margin-left: auto; background: rgba(255,255,255,0.2); border: none; color: white;
        width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px;
        display: flex; align-items: center; justify-content: center;
      }
      #pawly-messages {
        flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
        scrollbar-width: thin; scrollbar-color: ${color}44 transparent;
      }
      .pawly-msg { display: flex; gap: 8px; align-items: flex-end; animation: pawly-fadein 0.3s ease; }
      .pawly-msg.user { flex-direction: row-reverse; }
      .pawly-bubble-text {
        max-width: 78%; padding: 9px 13px; border-radius: 16px; font-size: 13px; line-height: 1.5; color: white;
      }
      .pawly-msg.bot .pawly-bubble-text { background: rgba(255,255,255,0.07); border-radius: 4px 16px 16px 16px; }
      .pawly-msg.user .pawly-bubble-text { background: ${color}; border-radius: 16px 4px 16px 16px; }
      .pawly-avatar { width: 28px; height: 28px; border-radius: 50%; background: ${color}33; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      #pawly-suggestions { padding: 0 14px 10px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
      .pawly-chip {
        padding: 5px 11px; border-radius: 999px; font-size: 12px; cursor: pointer;
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
        color: #ccc; transition: all 0.15s ease; white-space: nowrap;
      }
      .pawly-chip:hover { background: ${color}22; border-color: ${color}66; color: white; }
      #pawly-lead-form { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink:0; }
      #pawly-lead-form input {
        width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px; color: white; font-size: 13px; outline: none; margin-bottom: 6px;
      }
      #pawly-lead-form input:focus { border-color: ${color}; }
      #pawly-lead-submit {
        width: 100%; padding: 9px; background: ${color}; color: white; border: none;
        border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
      }
      #pawly-input-row {
        display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
      }
      #pawly-input {
        flex: 1; padding: 9px 12px; background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
        color: white; font-size: 13px; outline: none;
      }
      #pawly-input:focus { border-color: ${color}; }
      #pawly-send {
        width: 38px; height: 38px; border-radius: 50%; background: ${color};
        border: none; color: white; font-size: 16px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.15s ease;
      }
      #pawly-send:disabled { opacity: 0.5; }
      .pawly-thinking { display: flex; gap: 4px; align-items: center; padding: 9px 13px; }
      .pawly-dot {
        width: 6px; height: 6px; border-radius: 50%; background: ${color};
        animation: pawly-bounce 1.2s ease-in-out infinite;
      }
      .pawly-dot:nth-child(2) { animation-delay: 0.2s; }
      .pawly-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes pawly-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes pawly-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      @keyframes pawly-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pawly-slidein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @media (max-width: 420px) {
        #pawly-panel { width: calc(100vw - 24px); ${isRight ? 'right:12px' : 'left:12px'}; border-radius: 16px; }
      }
    `;
  }

  // ── Build Widget HTML ─────────────────────────────────────
  function injectWidget() {
    const color = petConfig.brandColor || '#7C3AED';
    const position = petConfig.position || 'bottom-right';

    // Shadow DOM container
    const host = document.createElement('div');
    host.id = 'pawly-root';
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    // Stylesheet
    const style = document.createElement('style');
    style.textContent = buildCSS(color, position);
    shadow.appendChild(style);

    // Greeting bubble
    const bubble = document.createElement('div');
    bubble.id = 'pawly-bubble';
    bubble.textContent = petConfig.greetingMessage;
    bubble.onclick = () => togglePanel();
    shadow.appendChild(bubble);
    setTimeout(() => { if (bubble.parentNode && !isOpen) bubble.style.display = 'none'; }, 5000);

    // Pet button
    const btn = document.createElement('button');
    btn.id = 'pawly-btn';
    btn.setAttribute('aria-label', 'Chat with ' + petConfig.name);
    btn.innerHTML = petSVG(color, 70);
    btn.onclick = () => togglePanel();
    shadow.appendChild(btn);

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'pawly-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div id="pawly-header">
        ${petSVG(color === '#ffffff' ? '#ccc' : 'white', 36)}
        <div>
          <div id="pawly-header-name">${petConfig.name}</div>
          <div id="pawly-header-status">● Online</div>
        </div>
        <button id="pawly-close" aria-label="Close">✕</button>
      </div>
      <div id="pawly-messages"></div>
      <div id="pawly-suggestions">
        <button class="pawly-chip">What do you offer?</button>
        <button class="pawly-chip">Where is pricing?</button>
        <button class="pawly-chip">How can I contact you?</button>
      </div>
      <div id="pawly-input-row">
        <input id="pawly-input" placeholder="Ask anything..." autocomplete="off"/>
        <button id="pawly-send" aria-label="Send">↑</button>
      </div>
    `;
    shadow.appendChild(panel);

    // Close button
    panel.querySelector('#pawly-close').onclick = () => togglePanel();

    // Chip clicks
    panel.querySelectorAll('.pawly-chip').forEach(chip => {
      chip.onclick = () => sendMessage(chip.textContent);
    });

    // Input enter
    const input = panel.querySelector('#pawly-input');
    input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(input.value); };
    panel.querySelector('#pawly-send').onclick = () => sendMessage(input.value);

    // Show greeting on open
    addBotMessage(petConfig.greetingMessage, 'happy');
  }

  function getPanel() { return document.getElementById('pawly-root').shadowRoot.getElementById('pawly-panel'); }
  function getMsgs()  { return document.getElementById('pawly-root').shadowRoot.getElementById('pawly-messages'); }
  function getInput() { return document.getElementById('pawly-root').shadowRoot.getElementById('pawly-input'); }
  function getSend()  { return document.getElementById('pawly-root').shadowRoot.getElementById('pawly-send'); }

  function togglePanel() {
    isOpen = !isOpen;
    const panel = getPanel();
    const bubble = document.getElementById('pawly-root').shadowRoot.getElementById('pawly-bubble');
    panel.style.display = isOpen ? 'flex' : 'none';
    if (bubble) bubble.style.display = 'none';
    if (isOpen) { getInput().focus(); scrollToBottom(); }
  }

  function scrollToBottom() {
    const msgs = getMsgs();
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function addBotMessage(text, emotion) {
    const msgs = getMsgs();
    if (!msgs) return;
    const color = petConfig.brandColor || '#7C3AED';
    const row = document.createElement('div');
    row.className = 'pawly-msg bot';
    row.innerHTML = `
      <div class="pawly-avatar">${petSVG(color, 22)}</div>
      <div class="pawly-bubble-text">${escapeHtml(text)}</div>
    `;
    msgs.appendChild(row);
    scrollToBottom();
    // Animate pet state
    setPetEmotion(emotion);
  }

  function addUserMessage(text) {
    const msgs = getMsgs();
    if (!msgs) return;
    const row = document.createElement('div');
    row.className = 'pawly-msg user';
    row.innerHTML = `<div class="pawly-bubble-text">${escapeHtml(text)}</div>`;
    msgs.appendChild(row);
    scrollToBottom();
  }

  function showThinking() {
    const msgs = getMsgs();
    if (!msgs) return;
    const row = document.createElement('div');
    row.className = 'pawly-msg bot';
    row.id = 'pawly-thinking';
    row.innerHTML = `
      <div class="pawly-avatar">${petSVG(petConfig.brandColor || '#7C3AED', 22)}</div>
      <div class="pawly-bubble-text pawly-thinking">
        <div class="pawly-dot"></div><div class="pawly-dot"></div><div class="pawly-dot"></div>
      </div>
    `;
    msgs.appendChild(row);
    scrollToBottom();
    setPetEmotion('thinking');
  }

  function removeThinking() {
    const t = document.getElementById('pawly-root').shadowRoot.getElementById('pawly-thinking');
    if (t) t.remove();
  }

  function setPetEmotion(emotion) {
    const btn = document.getElementById('pawly-root').shadowRoot.getElementById('pawly-btn');
    if (!btn) return;
    btn.style.animation = 'none';
    void btn.offsetWidth;
    const anims = {
      happy: 'pawly-float 0.5s ease 3',
      confused: 'none',
      thinking: 'none',
      idle: 'pawly-float 3s ease-in-out infinite',
    };
    btn.style.animation = anims[emotion] || anims.idle;
    setTimeout(() => { if (btn) btn.style.animation = 'pawly-float 3s ease-in-out infinite'; }, 1500);
  }

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    const input = getInput();
    const send = getSend();
    if (input) input.value = '';
    if (send) send.disabled = true;

    addUserMessage(clean);
    showThinking();

    try {
      const res = await fetch(API_BASE + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: PET_ID, message: clean, visitorId, conversationId }),
      });
      const data = await res.json();
      removeThinking();

      if (data.conversationId) conversationId = data.conversationId;
      addBotMessage(data.message || "I'm not sure about that!", data.emotion || 'idle');

      // Execute action
      if (data.action) executeAction(data.action);

      // Lead capture
      if (data.leadCapture) showLeadForm();

    } catch {
      removeThinking();
      addBotMessage("Oops! I'm having a little trouble. Please try again 🐾", 'confused');
    }

    if (send) send.disabled = false;
  }

  function executeAction(action) {
    try {
      if (action.type === 'scroll_to' && action.selector) {
        const el = document.querySelector(action.selector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (action.type === 'highlight' && action.selector) {
        const el = document.querySelector(action.selector);
        if (el) {
          const orig = el.style.outline;
          el.style.outline = '3px solid ' + (petConfig.brandColor || '#7C3AED');
          el.style.outlineOffset = '4px';
          el.style.transition = 'outline 0.3s ease';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { el.style.outline = orig; }, 3000);
        }
      } else if (action.type === 'open_link' && action.url) {
        window.open(action.url, '_blank', 'noopener');
      }
    } catch (e) {
      console.warn('[Pawly] Action failed:', e);
    }
  }

  function showLeadForm() {
    const msgs = getMsgs();
    if (!msgs || msgs.querySelector('#pawly-lead-form-msg')) return;
    const color = petConfig.brandColor || '#7C3AED';
    const wrapper = document.createElement('div');
    wrapper.id = 'pawly-lead-form-msg';
    wrapper.className = 'pawly-msg bot';
    wrapper.style.flexDirection = 'column';
    wrapper.style.padding = '0 0 4px';
    wrapper.innerHTML = `
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;font-size:13px;color:white;width:100%">
        <p style="margin-bottom:10px;font-weight:600">Want us to reach out? 📬 Share your details:</p>
        <input id="pawly-lf-name" placeholder="Your name" style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:white;font-size:13px;outline:none;margin-bottom:6px;"/>
        <input id="pawly-lf-email" type="email" placeholder="Email address" style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:white;font-size:13px;outline:none;margin-bottom:6px;"/>
        <input id="pawly-lf-phone" placeholder="Phone (optional)" style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:white;font-size:13px;outline:none;margin-bottom:8px;"/>
        <button id="pawly-lf-submit" style="width:100%;padding:9px;background:${color};color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Send my details 🐾</button>
      </div>
    `;
    msgs.appendChild(wrapper);
    scrollToBottom();

    wrapper.querySelector('#pawly-lf-submit').onclick = async () => {
      const name  = wrapper.querySelector('#pawly-lf-name').value;
      const email = wrapper.querySelector('#pawly-lf-email').value;
      const phone = wrapper.querySelector('#pawly-lf-phone').value;
      if (!name && !email) return;
      await fetch(API_BASE + '/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: PET_ID, visitorId, name, email, phone }),
      });
      wrapper.innerHTML = '<div class="pawly-bubble-text" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#34d399;padding:10px 14px;border-radius:12px;">✅ Got it! The team will reach out soon.</div>';
      scrollToBottom();
    };
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Start ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
