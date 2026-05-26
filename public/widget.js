(function () {
  'use strict';

  // -- Bootstrap ------------------------------------------------
  const scriptEl = document.currentScript || document.querySelector('script[data-pet-id]');
  if (!scriptEl) return;

  const PET_ID = scriptEl.getAttribute('data-pet-id');
  if (!PET_ID) return;

  const API_BASE = scriptEl.src.replace('/widget.js', '');
  let petConfig = null;
  let isOpen = false;
  let dragState = null;
  let suppressClick = false;
  let widgetPosition = null;
  let roamRaf = null;
  let roamDirection = 1;
  let roamEnabled = true;
  let lastRoamFrame = 0;
  let roamTarget = null;
  let roamPauseUntil = 0;
  let visitorId = localStorage.getItem('pawly_visitor_id') || ('visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  let conversationId = null;
  localStorage.setItem('pawly_visitor_id', visitorId);

  // -- Fetch pet config -----------------------------------------
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

  // -- SVG Pet --------------------------------------------------
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

  function petMarkup(type, color, size, view) {
    if (petConfig && petConfig.petImages && petConfig.petImages.front && petConfig.petImages.left && petConfig.petImages.right) {
      const petView = view || 'front';
      const animatedParts = Array.isArray(petConfig.animatedParts) ? petConfig.animatedParts : [];
      const imageViews = ['front', 'left', 'right'];
      const parts = ['head', 'hands', 'legs', 'tail'];
      let markup = `<div class="pawly-custom-pet pawly-custom-pet-view-${petView}" style="--pawly-pet-size:${size}px;">`;

      imageViews.forEach(function (imageView) {
        const src = petConfig.petImages[imageView];
        markup += `<img class="pawly-custom-pet-base pawly-custom-pet-image pawly-custom-pet-image-${imageView}" src="${src}" alt="" draggable="false"/>`;

        parts.forEach(function (part) {
          if (animatedParts.indexOf(part) === -1) return;
          markup += `<img class="pawly-custom-pet-overlay pawly-custom-pet-overlay-${part} pawly-custom-pet-image pawly-custom-pet-image-${imageView}" src="${src}" alt="" draggable="false"/>`;
        });
      });

      markup += '</div>';
      return markup;
    }

    if (type === 'robot') {
      const robotView = view || 'front';
      return `<div class="pawly-pixel-pet pawly-pixel-pet-view-${robotView}" style="--pawly-pet-size:${size}px;--pawly-pet-color:${color};">
        <div class="pawly-pixel-pet-inner">
          <div class="pawly-pixel-pet-head">
            <span class="pawly-pixel-pet-shadow"></span>
            <span class="pawly-pixel-pet-helmet"></span>
            <span class="pawly-pixel-pet-faceplate">
              <span class="pawly-pixel-pet-eye pawly-pixel-pet-eye-left"></span>
              <span class="pawly-pixel-pet-eye pawly-pixel-pet-eye-right"></span>
              <span class="pawly-pixel-pet-mouth"></span>
            </span>
            <span class="pawly-pixel-pet-ear"></span>
          </div>
          <div class="pawly-pixel-pet-torso"></div>
          <div class="pawly-pixel-pet-legs">
            <span class="pawly-pixel-pet-leg pawly-pixel-pet-leg-front"></span>
            <span class="pawly-pixel-pet-leg pawly-pixel-pet-leg-back"></span>
          </div>
        </div>
      </div>`;
    }

    return petSVG(color, size);
  }

  // -- Styles ---------------------------------------------------
  function buildCSS(color) {
    return `
      #pawly-root { all: initial; }
      #pawly-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #pawly-btn {
        position: fixed; z-index: 2147483647;
        width: 76px; height: 76px; cursor: pointer; border: none; background: none; padding: 0;
        filter: drop-shadow(0 4px 16px ${color}66);
        transition: transform 0.2s ease;
        touch-action: none;
        user-select: none;
      }
      #pawly-btn:hover { transform: scale(1.06); }
      #pawly-btn[data-roaming='true'] .pawly-custom-pet-overlay-legs {
        animation: pawly-custom-legs 0.38s ease-in-out infinite;
      }
      #pawly-btn .pawly-custom-pet-overlay-head {
        animation: pawly-custom-head 2.4s ease-in-out infinite;
      }
      #pawly-btn .pawly-custom-pet-overlay-hands {
        animation: pawly-custom-hands 1.7s ease-in-out infinite;
      }
      #pawly-btn .pawly-custom-pet-overlay-tail {
        animation: pawly-custom-tail 1.2s ease-in-out infinite;
      }
      #pawly-btn[data-roaming='true'] .pawly-pixel-pet-inner {
        animation: pawly-pixel-pet-bob 0.52s steps(1, end) infinite;
      }
      #pawly-btn[data-roaming='true'][data-view='right'] .pawly-pixel-pet-leg-front,
      #pawly-btn[data-roaming='true'][data-view='left'] .pawly-pixel-pet-leg-front {
        animation: pawly-pixel-leg-front 0.32s steps(1, end) infinite;
      }
      #pawly-btn[data-roaming='true'][data-view='right'] .pawly-pixel-pet-leg-back,
      #pawly-btn[data-roaming='true'][data-view='left'] .pawly-pixel-pet-leg-back {
        animation: pawly-pixel-leg-back 0.32s steps(1, end) infinite;
      }
      #pawly-btn[data-roaming='true'][data-view='front'] .pawly-pixel-pet-leg-front {
        animation: pawly-pixel-front-leg-front 0.32s steps(1, end) infinite;
      }
      #pawly-btn[data-roaming='true'][data-view='front'] .pawly-pixel-pet-leg-back {
        animation: pawly-pixel-front-leg-back 0.32s steps(1, end) infinite;
      }
      #pawly-btn[data-view='left'] .pawly-pixel-pet-inner,
      .pawly-pixel-pet-view-left .pawly-pixel-pet-inner {
        transform: scaleX(-1);
      }
      #pawly-bubble {
        position: fixed; z-index: 2147483647;
        background: #111118; color: white; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 10px 14px; font-size: 13px; max-width: 220px; line-height: 1.4;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4); cursor: pointer;
        animation: pawly-fadein 0.4s ease;
      }
      #pawly-bubble::after {
        content: ''; position: absolute; bottom: -8px;
        right: 16px;
        width: 0; height: 0;
        border-left: 8px solid transparent; border-right: 8px solid transparent;
        border-top: 8px solid #111118;
      }
      #pawly-panel {
        position: fixed; z-index: 2147483647;
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
      .pawly-avatar .pawly-custom-pet { transform: scale(0.36); transform-origin: center; }
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
      @keyframes pawly-custom-head { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
      @keyframes pawly-custom-hands { 0%,100%{transform:translateX(0) rotate(0deg)} 50%{transform:translateX(3px) rotate(2deg)} }
      @keyframes pawly-custom-legs { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes pawly-custom-tail { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(8deg)} }
      @keyframes pawly-pixel-pet-bob { 0%,100%{translate:0 0} 50%{translate:0 -2px} }
      @keyframes pawly-pixel-leg-front { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
      @keyframes pawly-pixel-leg-back { 0%,100%{transform:translateX(4px)} 50%{transform:translateX(0)} }
      @keyframes pawly-pixel-front-leg-front { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes pawly-pixel-front-leg-back { 0%,100%{transform:translateY(-3px)} 50%{transform:translateY(0)} }
      .pawly-pixel-pet {
        width: var(--pawly-pet-size);
        height: var(--pawly-pet-size);
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .pawly-pixel-pet-inner {
        position: relative;
        width: calc(var(--pawly-pet-size) * 0.78);
        height: calc(var(--pawly-pet-size) * 0.92);
        transform-origin: center bottom;
      }
      .pawly-pixel-pet-head {
        position: absolute;
        top: 0;
        left: 50%;
        width: calc(var(--pawly-pet-size) * 0.52);
        height: calc(var(--pawly-pet-size) * 0.52);
        transform: translateX(-50%);
        background: #f4e8bd;
        border: calc(var(--pawly-pet-size) * 0.08) solid #151515;
        box-shadow: inset calc(var(--pawly-pet-size) * -0.08) 0 0 #d6ca94;
      }
      .pawly-pixel-pet-shadow {
        position: absolute;
        left: calc(var(--pawly-pet-size) * -0.12);
        top: calc(var(--pawly-pet-size) * 0.12);
        width: calc(var(--pawly-pet-size) * 0.1);
        height: calc(var(--pawly-pet-size) * 0.26);
        background: #101010;
      }
      .pawly-pixel-pet-helmet {
        position: absolute;
        inset: calc(var(--pawly-pet-size) * 0.05);
        background: #223333;
      }
      .pawly-pixel-pet-faceplate {
        position: absolute;
        left: 50%;
        top: 50%;
        width: calc(var(--pawly-pet-size) * 0.26);
        height: calc(var(--pawly-pet-size) * 0.18);
        transform: translate(-50%, -35%);
        background: #446f6c;
      }
      .pawly-pixel-pet-eye,
      .pawly-pixel-pet-mouth {
        position: absolute;
        background: #f0e45f;
      }
      .pawly-pixel-pet-eye {
        top: calc(var(--pawly-pet-size) * 0.02);
        width: calc(var(--pawly-pet-size) * 0.05);
        height: calc(var(--pawly-pet-size) * 0.05);
      }
      .pawly-pixel-pet-eye-left { left: calc(var(--pawly-pet-size) * 0.03); }
      .pawly-pixel-pet-eye-right { right: calc(var(--pawly-pet-size) * 0.03); }
      .pawly-pixel-pet-mouth {
        left: 50%;
        bottom: calc(var(--pawly-pet-size) * 0.02);
        width: calc(var(--pawly-pet-size) * 0.12);
        height: calc(var(--pawly-pet-size) * 0.04);
        transform: translateX(-50%);
      }
      .pawly-pixel-pet-ear {
        position: absolute;
        right: calc(var(--pawly-pet-size) * -0.04);
        top: calc(var(--pawly-pet-size) * 0.08);
        width: calc(var(--pawly-pet-size) * 0.06);
        height: calc(var(--pawly-pet-size) * 0.18);
        background: #f4f4f4;
      }
      .pawly-pixel-pet-torso {
        position: absolute;
        left: 50%;
        top: calc(var(--pawly-pet-size) * 0.58);
        width: calc(var(--pawly-pet-size) * 0.18);
        height: calc(var(--pawly-pet-size) * 0.2);
        transform: translateX(-50%);
        background: #f8edc3;
        border: calc(var(--pawly-pet-size) * 0.05) solid #151515;
      }
      .pawly-pixel-pet-legs {
        position: absolute;
        left: 50%;
        bottom: 0;
        width: calc(var(--pawly-pet-size) * 0.3);
        height: calc(var(--pawly-pet-size) * 0.22);
        transform: translateX(-50%);
      }
      .pawly-pixel-pet-leg {
        position: absolute;
        bottom: 0;
        width: calc(var(--pawly-pet-size) * 0.08);
        height: calc(var(--pawly-pet-size) * 0.18);
        background: #151515;
      }
      .pawly-pixel-pet-leg::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: calc(var(--pawly-pet-size) * 0.12);
        height: calc(var(--pawly-pet-size) * 0.04);
        background: #151515;
      }
      .pawly-pixel-pet-leg-front { left: calc(var(--pawly-pet-size) * 0.05); }
      .pawly-pixel-pet-leg-back { right: calc(var(--pawly-pet-size) * 0.05); }
      .pawly-custom-pet {
        position: relative;
        width: var(--pawly-pet-size);
        height: var(--pawly-pet-size);
      }
      .pawly-custom-pet-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        user-select: none;
        -webkit-user-drag: none;
      }
      .pawly-custom-pet-base,
      .pawly-custom-pet-overlay {
        display: none;
      }
      #pawly-btn[data-view='front'] .pawly-custom-pet-image-front,
      .pawly-custom-pet-view-front .pawly-custom-pet-image-front,
      #pawly-btn[data-view='left'] .pawly-custom-pet-image-left,
      .pawly-custom-pet-view-left .pawly-custom-pet-image-left,
      #pawly-btn[data-view='right'] .pawly-custom-pet-image-right,
      .pawly-custom-pet-view-right .pawly-custom-pet-image-right {
        display: block;
      }
      .pawly-custom-pet-overlay-head {
        clip-path: inset(0 18% 54% 18%);
      }
      .pawly-custom-pet-overlay-hands {
        clip-path: inset(34% 8% 26% 8%);
      }
      .pawly-custom-pet-overlay-legs {
        clip-path: inset(66% 18% 0 18%);
      }
      .pawly-custom-pet-overlay-tail {
        clip-path: inset(28% 0 22% 62%);
        transform-origin: 78% 58%;
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-shadow,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-shadow,
      #pawly-btn[data-view='front'] .pawly-pixel-pet-ear,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-ear {
        display: none;
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-head,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-head {
        width: calc(var(--pawly-pet-size) * 0.56);
        height: calc(var(--pawly-pet-size) * 0.52);
        box-shadow: inset 0 calc(var(--pawly-pet-size) * -0.06) 0 #d6ca94;
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-faceplate,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-faceplate {
        width: calc(var(--pawly-pet-size) * 0.3);
        height: calc(var(--pawly-pet-size) * 0.18);
        transform: translate(-50%, -32%);
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-torso,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-torso {
        width: calc(var(--pawly-pet-size) * 0.2);
        height: calc(var(--pawly-pet-size) * 0.2);
        top: calc(var(--pawly-pet-size) * 0.58);
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-legs,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-legs {
        width: calc(var(--pawly-pet-size) * 0.18);
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-leg,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-leg {
        width: calc(var(--pawly-pet-size) * 0.07);
        height: calc(var(--pawly-pet-size) * 0.2);
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-leg::after,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-leg::after {
        left: calc(var(--pawly-pet-size) * -0.01);
        width: calc(var(--pawly-pet-size) * 0.09);
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-leg-front,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-leg-front {
        left: 0;
      }
      #pawly-btn[data-view='front'] .pawly-pixel-pet-leg-back,
      .pawly-pixel-pet-view-front .pawly-pixel-pet-leg-back {
        right: 0;
      }
      @media (max-width: 420px) {
        #pawly-panel { width: min(360px, calc(100vw - 24px)); border-radius: 16px; }
      }
    `;
  }

  function getStorageKey() {
    return 'pawly_widget_position_' + PET_ID;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getDefaultPosition(position) {
    const margin = 20;
    const btnSize = 76;
    const isRight = position !== 'bottom-left';

    return {
      left: isRight ? window.innerWidth - btnSize - margin : margin,
      top: window.innerHeight - btnSize - margin,
    };
  }

  function loadWidgetPosition(position) {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (!saved) return getDefaultPosition(position);

      const parsed = JSON.parse(saved);
      if (typeof parsed.left !== 'number' || typeof parsed.top !== 'number') {
        return getDefaultPosition(position);
      }

      return parsed;
    } catch {
      return getDefaultPosition(position);
    }
  }

  function saveWidgetPosition() {
    if (!widgetPosition) return;
    localStorage.setItem(getStorageKey(), JSON.stringify(widgetPosition));
  }

  function updateWidgetPosition() {
    const root = document.getElementById('pawly-root');
    if (!root || !root.shadowRoot || !widgetPosition) return;

    const btn = root.shadowRoot.getElementById('pawly-btn');
    const bubble = root.shadowRoot.getElementById('pawly-bubble');
    const panel = root.shadowRoot.getElementById('pawly-panel');
    if (!btn || !bubble || !panel) return;

    const btnSize = 76;
    const gap = 14;
    const panelWidth = Math.min(360, window.innerWidth - 24);
    const panelHeight = 520;
    const bubbleWidth = Math.min(220, Math.max(180, window.innerWidth - 40));

    const maxLeft = Math.max(12, window.innerWidth - btnSize - 12);
    const maxTop = Math.max(12, window.innerHeight - btnSize - 12);

    widgetPosition.left = clamp(widgetPosition.left, 12, maxLeft);
    widgetPosition.top = clamp(widgetPosition.top, 12, maxTop);

    btn.style.left = widgetPosition.left + 'px';
    btn.style.top = widgetPosition.top + 'px';

    const panelLeft = clamp(widgetPosition.left + btnSize - panelWidth, 12, window.innerWidth - panelWidth - 12);
    const panelTop = clamp(widgetPosition.top - panelHeight - gap, 12, Math.max(12, window.innerHeight - panelHeight - 12));
    panel.style.left = panelLeft + 'px';
    panel.style.top = panelTop + 'px';

    const bubbleLeft = clamp(widgetPosition.left + btnSize - bubbleWidth, 12, window.innerWidth - bubbleWidth - 12);
    const bubbleTop = clamp(widgetPosition.top - 56, 12, window.innerHeight - 60);
    bubble.style.left = bubbleLeft + 'px';
    bubble.style.top = bubbleTop + 'px';
  }

  function setRoamingState(active) {
    const root = document.getElementById('pawly-root');
    const btn = root && root.shadowRoot ? root.shadowRoot.getElementById('pawly-btn') : null;
    if (!btn) return;

    btn.dataset.roaming = active ? 'true' : 'false';
    if (petConfig.petType === 'robot' || (petConfig.petImages && petConfig.petImages.front && petConfig.petImages.left && petConfig.petImages.right)) {
      btn.dataset.view = active ? (roamDirection < 0 ? 'left' : 'right') : 'front';
    }

    if (petConfig.petType !== 'robot' && !(petConfig.petImages && petConfig.petImages.front)) {
      btn.style.animation = active ? 'pawly-float 3s ease-in-out infinite' : 'none';
    }
  }

  function setActivePetView(view) {
    const root = document.getElementById('pawly-root');
    const btn = root && root.shadowRoot ? root.shadowRoot.getElementById('pawly-btn') : null;
    if (!btn) return;
    if (petConfig.petType !== 'robot' && !(petConfig.petImages && petConfig.petImages.front && petConfig.petImages.left && petConfig.petImages.right)) return;
    btn.dataset.view = view;
  }

  function getRobotView(deltaX, deltaY) {
    if (Math.abs(deltaX) >= Math.abs(deltaY) * 0.75) {
      return deltaX < 0 ? 'left' : 'right';
    }

    return 'front';
  }

  function stopRoaming() {
    roamEnabled = false;
    lastRoamFrame = 0;
    roamTarget = null;
    roamPauseUntil = 0;
    if (roamRaf) {
      cancelAnimationFrame(roamRaf);
      roamRaf = null;
    }
    setRoamingState(false);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function getRandomRoamTarget() {
    const btnSize = 76;
    const minLeft = 12;
    const maxLeft = Math.max(minLeft, window.innerWidth - btnSize - 12);
    const minTop = 12;
    const maxTop = Math.max(minTop, window.innerHeight - btnSize - 12);

    return {
      left: randomBetween(minLeft, maxLeft),
      top: randomBetween(minTop, maxTop),
    };
  }

  function roamStep(timestamp) {
    if (!roamEnabled || isOpen || dragState || !widgetPosition) {
      roamRaf = null;
      return;
    }

    if (!lastRoamFrame) lastRoamFrame = timestamp;
    const delta = timestamp - lastRoamFrame;
    lastRoamFrame = timestamp;

    if (roamPauseUntil && timestamp < roamPauseUntil) {
      setRoamingState(false);
      updateWidgetPosition();
      roamRaf = window.requestAnimationFrame(roamStep);
      return;
    }

    if (!roamTarget) {
      roamTarget = getRandomRoamTarget();
    }

    const deltaX = roamTarget.left - widgetPosition.left;
    const deltaY = roamTarget.top - widgetPosition.top;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < 6) {
      widgetPosition.left = roamTarget.left;
      widgetPosition.top = roamTarget.top;
      roamTarget = null;
      roamPauseUntil = timestamp + randomBetween(5000, 10000);
      setRoamingState(false);
      updateWidgetPosition();
      roamRaf = window.requestAnimationFrame(roamStep);
      return;
    }

    roamPauseUntil = 0;
    roamDirection = deltaX < 0 ? -1 : 1;
    setActivePetView(getRobotView(deltaX, deltaY));
    const speed = window.innerWidth < 720 ? 0.11 : 0.14;
    const step = Math.min(distance, delta * speed);

    widgetPosition.left += (deltaX / distance) * step;
    widgetPosition.top += (deltaY / distance) * step;
    setRoamingState(true);
    updateWidgetPosition();
    roamRaf = window.requestAnimationFrame(roamStep);
  }

  function startRoaming() {
    if (!roamEnabled || isOpen || dragState || roamRaf) return;
    roamTarget = null;
    roamPauseUntil = performance.now() + randomBetween(5000, 10000);
    setRoamingState(false);
    roamRaf = window.requestAnimationFrame(roamStep);
  }

  function startDrag(e) {
    if (e.button !== undefined && e.button !== 0) return;

    stopRoaming();
    const point = e.touches ? e.touches[0] : e;
    dragState = {
      pointerX: point.clientX,
      pointerY: point.clientY,
      left: widgetPosition.left,
      top: widgetPosition.top,
      moved: false,
    };
  }

  function moveDrag(e) {
    if (!dragState) return;

    const point = e.touches ? e.touches[0] : e;
    const deltaX = point.clientX - dragState.pointerX;
    const deltaY = point.clientY - dragState.pointerY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragState.moved = true;
    }

    widgetPosition.left = dragState.left + deltaX;
    widgetPosition.top = dragState.top + deltaY;
    updateWidgetPosition();

    if (e.cancelable) e.preventDefault();
  }

  function endDrag() {
    if (!dragState) return false;
    const moved = dragState.moved;
    dragState = null;
    suppressClick = moved;
    saveWidgetPosition();
    setRoamingState(false);
    return moved;
  }

  // -- Build Widget HTML ---------------------------------------
  function injectWidget() {
    const color = petConfig.brandColor || '#7C3AED';
    const position = petConfig.position || 'bottom-right';
    widgetPosition = loadWidgetPosition(position);

    // Shadow DOM container
    const host = document.createElement('div');
    host.id = 'pawly-root';
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    // Stylesheet
    const style = document.createElement('style');
    style.textContent = buildCSS(color);
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
    btn.innerHTML = petMarkup(petConfig.petType, color, 70);
    btn.onmousedown = startDrag;
    btn.ontouchstart = startDrag;
    btn.onclick = (e) => {
      if (suppressClick) {
        suppressClick = false;
        e.preventDefault();
        return;
      }
      togglePanel();
    };
    shadow.appendChild(btn);

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'pawly-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div id="pawly-header">
        ${petMarkup(petConfig.petType, color === '#ffffff' ? '#ccc' : 'white', 36)}
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
    updateWidgetPosition();
    startRoaming();
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchcancel', endDrag);
    window.addEventListener('resize', updateWidgetPosition);
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
    if (isOpen) {
      stopRoaming();
    } else {
      roamEnabled = true;
      startRoaming();
    }
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
      <div class="pawly-avatar">${petMarkup(petConfig.petType, color, 22)}</div>
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
      <div class="pawly-avatar">${petMarkup(petConfig.petType, petConfig.brandColor || '#7C3AED', 22)}</div>
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
    if (petConfig.petType === 'robot') {
      btn.dataset.roaming = 'false';
      btn.dataset.view = 'front';
      return;
    }
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

  // -- Start ----------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
