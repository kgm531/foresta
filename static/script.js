/**
 * FORESTA — script.js
 * Virtual Mirror · Dark Mode · Gallery · Size Selection · Interactions
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & STATE
═══════════════════════════════════════════════════════════ */

/** Body profile data — image, description, recommended size, fit score */
const BODY_PROFILES = {
  slim: {
    key: 'slim',
    label: 'Willowy',
    icon: '🌿',
    bmiRange: 'BMI under 18.5',
    desc: 'Your lean silhouette lets the coat drape with effortless fluidity. The structured shoulder will add gentle definition.',
    sizeRec: 'S',
    fitScore: 42,
    badge: 'Willowy Profile',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85',
    ],
  },
  lean: {
    key: 'lean',
    label: 'Lean Athletic',
    icon: '🎋',
    bmiRange: 'BMI 18.5 – 21.9',
    desc: 'A toned, proportional frame that wears this silhouette beautifully. The coat will follow your lines without restriction.',
    sizeRec: 'S – M',
    fitScore: 60,
    badge: 'Lean Athletic',
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=85',
    ],
  },
  athletic: {
    key: 'athletic',
    label: 'Athletic',
    icon: '🌲',
    bmiRange: 'BMI 22 – 24.9',
    desc: 'Your balanced, well-proportioned frame is this coat\'s ideal canvas. The wool drapes evenly and moves with confidence.',
    sizeRec: 'M',
    fitScore: 78,
    badge: 'Athletic Profile',
    images: [
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=85',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=85',
    ],
  },
  balanced: {
    key: 'balanced',
    label: 'Balanced',
    icon: '🍂',
    bmiRange: 'BMI 25 – 27.4',
    desc: 'The generous cut accommodates your frame with ease. The relaxed fit is intentional — it reads as editorial, not loose.',
    sizeRec: 'M – L',
    fitScore: 68,
    badge: 'Balanced Profile',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85',
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=85',
    ],
  },
  full: {
    key: 'full',
    label: 'Full-Figured',
    icon: '🌳',
    bmiRange: 'BMI 27.5 – 32',
    desc: 'The unstructured silhouette adapts to your body with dignity. The coat flows naturally without pulling or constraining.',
    sizeRec: 'L – XL',
    fitScore: 74,
    badge: 'Full-Figured',
    images: [
      'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85',
    ],
  },
  generous: {
    key: 'generous',
    label: 'Generous',
    icon: '🌾',
    bmiRange: 'BMI over 32',
    desc: 'The oversized proportions of this coat are designed for all bodies. The wide hem creates a sweeping, dramatic silhouette.',
    sizeRec: 'XL – XXL',
    fitScore: 80,
    badge: 'Generous Profile',
    images: [
      'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=85',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=85',
    ],
  },
};

/** App state */
const state = {
  darkMode: false,
  mirrorActive: false,
  height: 168,
  weight: 65,
  currentProfile: null,
  selectedSize: 'M',
  currentImageSrc: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=85',
  isTransitioning: false,
};

/* ═══════════════════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════════════════ */

const dom = {
  html:             document.documentElement,
  navbar:           document.getElementById('navbar'),
  themeToggle:      document.getElementById('themeToggle'),
  themeLabel:       document.getElementById('themeLabel'),
  productImage:     document.getElementById('productImage'),
  imageFrame:       document.getElementById('imageFrame'),
  shimmerOverlay:   document.getElementById('shimmerOverlay'),
  spinnerWrap:      document.getElementById('spinnerWrap'),
  modeBadge:        document.getElementById('modeBadge'),
  profileChip:      document.getElementById('profileChip'),
  profileChipText:  document.getElementById('profileChipText'),
  thumbItems:       document.querySelectorAll('.thumb-item'),
  heightRange:      document.getElementById('heightRange'),
  weightRange:      document.getElementById('weightRange'),
  heightVal:        document.getElementById('heightVal'),
  weightVal:        document.getElementById('weightVal'),
  heightNumber:     document.getElementById('heightNumber'),
  weightNumber:     document.getElementById('weightNumber'),
  heightFill:       document.getElementById('heightFill'),
  weightFill:       document.getElementById('weightFill'),
  mirrorToggle:     document.getElementById('mirrorToggle'),
  mirrorToggleLabel:document.getElementById('mirrorToggleLabel'),
  profileCard:      document.getElementById('profileCard'),
  profileIcon:      document.getElementById('profileIcon'),
  profileName:      document.getElementById('profileName'),
  profileBmi:       document.getElementById('profileBmi'),
  profileRec:       document.getElementById('profileRec'),
  profileFitBar:    document.getElementById('profileFitBar'),
  sizeChips:        document.querySelectorAll('.size-chip'),
  addCartBtn:       document.getElementById('addCartBtn'),
  wishlistBtn:      document.querySelector('.btn-wishlist'),
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

/**
 * Calculate BMI and classify body profile.
 * @param {number} heightCm
 * @param {number} weightKg
 * @returns {object} profile object
 */
function classifyBody(heightCm, weightKg) {
  const hm = heightCm / 100;
  const bmi = weightKg / (hm * hm);

  if (bmi < 18.5) return { profile: BODY_PROFILES.slim,      bmi };
  if (bmi < 22)   return { profile: BODY_PROFILES.lean,      bmi };
  if (bmi < 25)   return { profile: BODY_PROFILES.athletic,  bmi };
  if (bmi < 27.5) return { profile: BODY_PROFILES.balanced,  bmi };
  if (bmi < 32)   return { profile: BODY_PROFILES.full,      bmi };
  return               { profile: BODY_PROFILES.generous,  bmi };
}

/**
 * Update the CSS fill track on a range slider.
 * @param {HTMLInputElement} slider
 * @param {HTMLElement} fillEl
 */
function updateRangeFill(slider, fillEl) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  fillEl.style.width = `${pct}%`;
}

/**
 * Swap the main product image with shimmer + spinner UX.
 * @param {string} src — new image URL
 * @param {string} [badge] — text for the mode badge
 * @param {boolean} [showSpinner=false] — whether to show the full spinner
 */
function swapImage(src, badge = '', showSpinner = false) {
  if (state.isTransitioning) return;
  if (src === state.currentImageSrc && !showSpinner) return;
  state.isTransitioning = true;

  const img = dom.productImage;
  const shimmer = dom.shimmerOverlay;
  const spinner = dom.spinnerWrap;
  const modeBadge = dom.modeBadge;
  const chip = dom.profileChip;

  // Step 1: fade out + shimmer
  img.classList.add('fading');
  shimmer.classList.add('active');
  modeBadge.classList.remove('visible');

  if (showSpinner) {
    setTimeout(() => {
      spinner.classList.add('active');
    }, 120);
  }

  const delay = showSpinner ? 1700 : 360;

  setTimeout(() => {
    // Step 2: swap src
    state.currentImageSrc = src;
    img.src = src;
    img.alt = badge || 'Product view';

    const finish = () => {
      img.classList.remove('fading');
      shimmer.classList.remove('active');
      spinner.classList.remove('active');
      state.isTransitioning = false;

      if (badge) {
        modeBadge.textContent = badge;
        modeBadge.classList.add('visible');
      }
    };

    img.onload = finish;
    // Fallback for cached images
    setTimeout(finish, 600);
  }, delay);
}

/* ═══════════════════════════════════════════════════════════
   DARK MODE
═══════════════════════════════════════════════════════════ */

function initDarkMode() {
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) setTheme(true);

  dom.themeToggle.addEventListener('click', () => {
    setTheme(!state.darkMode);
  });
}

function setTheme(dark) {
  state.darkMode = dark;
  dom.html.setAttribute('data-theme', dark ? 'dark' : 'light');
  dom.themeLabel.textContent = dark ? 'Dark' : 'Light';
  dom.themeToggle.setAttribute('aria-pressed', String(dark));
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR SCROLL SHADOW
═══════════════════════════════════════════════════════════ */

function initNavbar() {
  const onScroll = () => {
    dom.navbar.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   GALLERY THUMBNAILS
═══════════════════════════════════════════════════════════ */

function initThumbs() {
  dom.thumbItems.forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (state.mirrorActive) return; // lock during mirror mode
      const src = thumb.dataset.src;
      const alt = thumb.dataset.alt;

      dom.thumbItems.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      thumb.classList.add('active');
      thumb.setAttribute('aria-pressed', 'true');

      swapImage(src, alt);
      dom.profileChip.classList.remove('visible');
      dom.modeBadge.classList.remove('visible');
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   RANGE SLIDERS
═══════════════════════════════════════════════════════════ */

function initSliders() {
  // Initial fill
  updateRangeFill(dom.heightRange, dom.heightFill);
  updateRangeFill(dom.weightRange, dom.weightFill);

  // Height range → number sync
  dom.heightRange.addEventListener('input', () => {
    const v = dom.heightRange.value;
    state.height = Number(v);
    dom.heightVal.textContent = v;
    dom.heightNumber.value = v;
    dom.heightRange.setAttribute('aria-valuenow', v);
    updateRangeFill(dom.heightRange, dom.heightFill);
    if (state.mirrorActive) onMeasurementChange();
  });

  // Height number → range sync
  dom.heightNumber.addEventListener('input', () => {
    const raw = Number(dom.heightNumber.value);
    const clamped = Math.max(140, Math.min(210, raw));
    state.height = clamped;
    dom.heightRange.value = clamped;
    dom.heightVal.textContent = clamped;
    dom.heightRange.setAttribute('aria-valuenow', clamped);
    updateRangeFill(dom.heightRange, dom.heightFill);
    if (state.mirrorActive) onMeasurementChange();
  });

  // Weight range → number sync
  dom.weightRange.addEventListener('input', () => {
    const v = dom.weightRange.value;
    state.weight = Number(v);
    dom.weightVal.textContent = v;
    dom.weightNumber.value = v;
    dom.weightRange.setAttribute('aria-valuenow', v);
    updateRangeFill(dom.weightRange, dom.weightFill);
    if (state.mirrorActive) onMeasurementChange();
  });

  // Weight number → range sync
  dom.weightNumber.addEventListener('input', () => {
    const raw = Number(dom.weightNumber.value);
    const clamped = Math.max(40, Math.min(160, raw));
    state.weight = clamped;
    dom.weightRange.value = clamped;
    dom.weightVal.textContent = clamped;
    dom.weightRange.setAttribute('aria-valuenow', clamped);
    updateRangeFill(dom.weightRange, dom.weightFill);
    if (state.mirrorActive) onMeasurementChange();
  });
}

/* ═══════════════════════════════════════════════════════════
   VIRTUAL MIRROR
═══════════════════════════════════════════════════════════ */

let measurementDebounce = null;

/** Called whenever sliders change and mirror is on */
function onMeasurementChange() {
  clearTimeout(measurementDebounce);
  measurementDebounce = setTimeout(() => {
    applyMirrorProfile(false);
  }, 600);
}

/** Activate / deactivate mirror mode */
function toggleMirror() {
  state.mirrorActive = !state.mirrorActive;
  dom.mirrorToggle.setAttribute('aria-pressed', String(state.mirrorActive));
  dom.mirrorToggleLabel.textContent = state.mirrorActive ? 'Mirror On' : 'Mirror Off';

  if (state.mirrorActive) {
    applyMirrorProfile(true); // show full spinner on first activation
  } else {
    // Reset to standard view
    const defaultSrc = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=85';
    swapImage(defaultSrc, 'Standard View');
    dom.profileChip.classList.remove('visible');
    resetProfileCard();
  }
}

/**
 * Compute body profile from current measurements and update UI.
 * @param {boolean} useSpinner — whether to show the SVG tree spinner
 */
function applyMirrorProfile(useSpinner) {
  const { profile, bmi } = classifyBody(state.height, state.weight);
  state.currentProfile = profile;

  // Pick image from profile (alternate if repeat)
  const imageSrc = profile.images[0];

  // Swap image
  swapImage(imageSrc, `↳ ${profile.badge}`, useSpinner);

  // Profile chip
  dom.profileChipText.textContent = profile.label;
  setTimeout(() => {
    dom.profileChip.classList.add('visible');
  }, useSpinner ? 1900 : 700);

  // Profile card
  updateProfileCard(profile, bmi);

  // Auto-select recommended size
  autoSelectSize(profile.sizeRec);
}

/** Update the profile info card */
function updateProfileCard(profile, bmi) {
  dom.profileIcon.textContent = profile.icon;
  dom.profileName.textContent = profile.label;
  dom.profileBmi.textContent = `${profile.bmiRange} · BMI ${bmi.toFixed(1)}`;
  dom.profileRec.textContent = `Rec. Size: ${profile.sizeRec}`;

  // Animate in recommendation chip
  dom.profileRec.classList.remove('show');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dom.profileRec.classList.add('show');
    });
  });

  // Animate fit bar
  dom.profileFitBar.style.width = '0%';
  setTimeout(() => {
    dom.profileFitBar.style.width = `${profile.fitScore}%`;
  }, 80);
}

/** Reset profile card to default state */
function resetProfileCard() {
  dom.profileName.textContent = '—';
  dom.profileBmi.textContent = 'Enter measurements above';
  dom.profileRec.textContent = '';
  dom.profileRec.classList.remove('show');
  dom.profileFitBar.style.width = '0%';
  dom.profileIcon.textContent = '⬡';
}

/** Auto-select size chip based on profile recommendation */
function autoSelectSize(rec) {
  // rec may be 'M', 'S – M', 'L – XL' etc. — pick the first token
  const primary = rec.split(/[\s–-]/)[0].trim().toUpperCase();

  dom.sizeChips.forEach(chip => {
    const chipSize = chip.dataset.size;
    const shouldSelect = chipSize === primary && !chip.disabled;

    chip.classList.toggle('selected', shouldSelect);
    chip.setAttribute('aria-pressed', String(shouldSelect));

    if (shouldSelect) state.selectedSize = chipSize;
  });
}

function initMirror() {
  dom.mirrorToggle.addEventListener('click', toggleMirror);
}

/* ═══════════════════════════════════════════════════════════
   SIZE SELECTION
═══════════════════════════════════════════════════════════ */

function initSizeChips() {
  dom.sizeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.disabled) return;
      dom.sizeChips.forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-pressed', 'true');
      state.selectedSize = chip.dataset.size;

      // Update CTA label
      updateCartLabel();
    });
  });
}

function updateCartLabel() {
  const btnText = dom.addCartBtn.querySelector('.btn-text');
  if (btnText) {
    btnText.textContent = `Add to Cart — $498`;
  }
}

/* ═══════════════════════════════════════════════════════════
   CART & WISHLIST
═══════════════════════════════════════════════════════════ */

function initCart() {
  dom.addCartBtn.addEventListener('click', () => {
    // Brief scale pulse
    dom.addCartBtn.style.transform = 'scale(0.97)';
    setTimeout(() => { dom.addCartBtn.style.transform = ''; }, 140);

    // Update cart count (demo)
    const countEl = document.querySelector('.cart-count');
    if (countEl) {
      const n = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = n + 1;
      countEl.style.transform = 'scale(1.4)';
      setTimeout(() => { countEl.style.transform = ''; }, 250);
    }
  });

  dom.wishlistBtn.addEventListener('click', () => {
    dom.wishlistBtn.classList.toggle('saved');
    const isSaved = dom.wishlistBtn.classList.contains('saved');
    dom.wishlistBtn.setAttribute('aria-label', isSaved ? 'Saved to wishlist' : 'Save to wishlist');
  });
}

/* ═══════════════════════════════════════════════════════════
   IMAGE PROTECTION
═══════════════════════════════════════════════════════════ */

function initImageProtection() {
  // Block right-click on all images
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Block drag on image frame
  dom.imageFrame.addEventListener('dragstart', e => e.preventDefault());
  dom.imageFrame.addEventListener('contextmenu', e => e.preventDefault());
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD ACCESSIBILITY
═══════════════════════════════════════════════════════════ */

function initKeyboard() {
  // Thumbnail keyboard nav
  dom.thumbItems.forEach((thumb, i) => {
    thumb.setAttribute('tabindex', '0');
    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        thumb.click();
      }
      if (e.key === 'ArrowRight') {
        const next = dom.thumbItems[i + 1];
        if (next) next.focus();
      }
      if (e.key === 'ArrowLeft') {
        const prev = dom.thumbItems[i - 1];
        if (prev) prev.focus();
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   ENTRANCE ANIMATIONS (intersection observer)
═══════════════════════════════════════════════════════════ */

function initAnimations() {
  // Gallery panel already animates via CSS
  // Observe the fit section for delayed entrance
  const fitSection = document.getElementById('fitSection');
  if (!fitSection || !window.IntersectionObserver) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initNavbar();
  initThumbs();
  initSliders();
  initMirror();
  initSizeChips();
  initCart();
  initImageProtection();
  initKeyboard();
  initAnimations();

  // Set initial profile card state
  resetProfileCard();

  console.log('%cFORESTА', 'font-size:2rem; font-family:serif; color:#1A3021;');
  console.log('%cRooted in nature. Built with care.', 'font-size:0.9rem; color:#A0522D;');
});
