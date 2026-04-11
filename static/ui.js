/**
 * Foresta — Shared UI Enhancements
 * Scroll progress bar + Back-to-top button
 */
(function(){
  // ── Scroll Progress Bar ──────────────────────────────────────
  const bar = document.createElement('div');
  bar.id = 'scrollBar';
  bar.style.cssText = [
    'position:fixed','top:0','left:0','height:3px',
    'background:linear-gradient(90deg,#A0522D,#1A3021)',
    'width:0%','z-index:9999','transition:width .1s linear',
    'pointer-events:none','border-radius:0 2px 2px 0'
  ].join(';');
  document.body.appendChild(bar);

  // ── Back-to-top Button ───────────────────────────────────────
  const btt = document.createElement('button');
  btt.id = 'backToTop';
  btt.title = 'Back to top';
  btt.textContent = '↑';
  btt.style.cssText = [
    'position:fixed','bottom:28px','left:28px',
    'width:40px','height:40px','border-radius:50%',
    'background:var(--g,#1A3021)','color:var(--sand,#F5F5DC)',
    'border:none','font-size:1rem','font-weight:700',
    'cursor:pointer','opacity:0','transform:translateY(10px)',
    'transition:opacity .3s,transform .3s,background .25s',
    'z-index:9000','display:flex','align-items:center',
    'justify-content:center','box-shadow:0 4px 16px rgba(0,0,0,.18)'
  ].join(';');
  document.body.appendChild(btt);

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // RTL: move to right side
  function adjustBTTPosition() {
    const isRTL = document.documentElement.dir === 'rtl';
    btt.style.left  = isRTL ? 'auto' : '28px';
    btt.style.right = isRTL ? '28px' : 'auto';
  }
  adjustBTTPosition();

  // Observer for dir changes (language toggle)
  const dirObs = new MutationObserver(adjustBTTPosition);
  dirObs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });

  // Scroll handler
  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = pct + '%';

    const show = scrollTop > 400;
    btt.style.opacity = show ? '1' : '0';
    btt.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
    btt.style.pointerEvents = show ? 'auto' : 'none';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init
})();
