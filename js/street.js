/**
 * Street Alley Engine:
 * - Spray-can Paint Splat on Click
 * - Custom paint cursor trail
 * - Light table puzzle renderer
 * - Bookshop & Blog turn-by-turn reading (100-150 words per page)
 * - Poetry reading scraps
 */
document.addEventListener('DOMContentLoaded', () => {
  initLightTable();
  initStreetBookshop();
  initStreetPoetry();
  initStreetLightbox();

  // Automatically unregister any old/broken service worker and clean browser cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (let reg of regs) {
        reg.unregister();
      }
    }).catch(() => {});
  }
});

/* =========================================================
   1. SPRAY-CAN PAINT SPLAT ON CLICK (DISABLED ON USER REQUEST)
   ========================================================= */
function initPaintSplatter() {
  // Disabled: No random color marks on clicks
}

/* =========================================================
   2. THE LIGHT TABLE (POLAROIDS & FILM STRIPS)
   ========================================================= */
function initLightTable() {
  const container = document.getElementById('lightTableMasonry');
  if (!container || !window.GALLERY || !window.GALLERY.items) return;

  const items = window.GALLERY.items;
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = `light-table-card ${item.bw ? 'is-bw' : ''}`;
    card.innerHTML = `
      <div class="polaroid-media">
        <img src="${item.img}" alt="${item.alt || item.title}" loading="lazy">
      </div>
      <div class="light-table-caption">
        <div class="title-row">
          <span class="title">${item.title}</span>
        </div>
        <p class="marker-text">${item.caption || item.alt || ''}</p>
      </div>
    `;

    card.addEventListener('click', () => {
      openStreetLightbox(item);
    });

    container.appendChild(card);
  });
}

/* =========================================================
   3. THE BOOKSHOP NOVEL & BLOG (100-150 WORDS PER PAGE TURN)
   ========================================================= */
let bookshopPages = [];
let bookshopIndex = 0;

function initStreetBookshop() {
  const novel = window.NOVEL;
  if (!novel || !novel.chapters) return;

  const bookmarkBtns = document.querySelectorAll('.torn-bookmark-btn');
  const prevBtn = document.getElementById('prevBookshopPage');
  const nextBtn = document.getElementById('nextBookshopPage');

  // Only run on pages that actually contain the bookshop widget.
  if (!document.getElementById('bookshopSpread')) return;

  function buildBookshopPages(filter = 'skills') {
    bookshopPages = [];

    if (filter === 'skills') {
      // The single novel: The Skills I Don’t Use Anymore
      novel.chapters.forEach(ch => {
        let blocks = [];
        blocks.push({ t: 'h', x: `${ch.label} — ${ch.sub}` });
        blocks.push(...ch.blocks);

        let currPage = [];
        let currWords = 0;

        blocks.forEach(b => {
          const w = b.x.split(/\s+/).length;
          // Target strict 100 - 150 words per page
          if (currWords + w > 130 && currPage.length > 0) {
            bookshopPages.push({ label: `${ch.label}`, blocks: currPage });
            currPage = [b];
            currWords = w;
          } else {
            currPage.push(b);
            currWords += w;
          }
        });

        if (currPage.length > 0) {
          bookshopPages.push({ label: `${ch.label}`, blocks: currPage });
        }
      });
    } else if (filter === 'blog') {
      // Personal Blog: म्यर पहाड़ Story
      const post = window.POSTS && window.POSTS[0];
      if (post && post.body) {
        let currPage = [];
        let currWords = 0;
        post.body.forEach(b => {
          const w = b.x.split(/\s+/).length;
          if (currWords + w > 130 && currPage.length > 0) {
            bookshopPages.push({ label: "म्यर पहाड़ (Blog)", blocks: currPage });
            currPage = [b];
            currWords = w;
          } else {
            currPage.push(b);
            currWords += w;
          }
        });
        if (currPage.length > 0) {
          bookshopPages.push({ label: "म्यर पहाड़ (Blog)", blocks: currPage });
        }
      }
    }
  }

  function renderBookshopPage() {
    const textEl = document.getElementById('bookshopReadingProse');
    const labelEl = document.getElementById('bookshopChapterTag');
    const pageNumEl = document.getElementById('bookshopPageTag');
    const counterEl = document.getElementById('bookshopPageCounter');
    const spread = document.getElementById('bookshopSpread');

    if (!bookshopPages.length) return;

    // Trigger page flip animation
    spread.classList.remove('page-flip-anim');
    void spread.offsetWidth;
    spread.classList.add('page-flip-anim');

    const pageData = bookshopPages[bookshopIndex];
    labelEl.textContent = pageData.label;
    pageNumEl.textContent = `Page ${bookshopIndex + 1}`;
    counterEl.textContent = `Page ${bookshopIndex + 1} of ${bookshopPages.length}`;

    prevBtn.disabled = (bookshopIndex === 0);
    nextBtn.disabled = (bookshopIndex >= bookshopPages.length - 1);

    textEl.innerHTML = '';
    pageData.blocks.forEach(b => {
      if (b.t === 'h') {
        const h = document.createElement('h3');
        h.textContent = b.x;
        textEl.appendChild(h);
      } else if (b.t === 'q') {
        const bq = document.createElement('blockquote');
        bq.textContent = b.x;
        textEl.appendChild(bq);
      } else {
        const p = document.createElement('p');
        p.textContent = b.x;
        textEl.appendChild(p);
      }
    });
  }

  bookmarkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bookmarkBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bookshopIndex = 0;
      buildBookshopPages(btn.dataset.source);
      renderBookshopPage();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (bookshopIndex > 0) {
        bookshopIndex--;
        renderBookshopPage();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (bookshopIndex < bookshopPages.length - 1) {
        bookshopIndex++;
        renderBookshopPage();
      }
    });
  }

  // Initial load
  buildBookshopPages('skills');
  renderBookshopPage();
}

/* =========================================================
   4. POETRY READING MODE & SCRAPS
   ========================================================= */
let currentPoemList = [];
let currentPoemIndex = 0;

function initStreetPoetry() {
  const container = document.getElementById('streetPoetryScraps');
  if (!container || !window.POEMS) return;

  const poems = window.POEMS;
  // Pick curated raw poems
  const chosenIds = [6, 1, 3, 4, 8, 16, 21, 52, 74];
  const chosen = poems.filter(p => chosenIds.includes(p.n));
  currentPoemList = chosen;

  const scrapStyles = ['scrap-dark', 'scrap-white'];

  chosen.forEach((poem, idx) => {
    const card = document.createElement('article');
    const styleClass = scrapStyles[idx % scrapStyles.length];
    card.className = `poetry-scrap-card ${styleClass}`;

    const lines = poem.stanzas && poem.stanzas[0]
      ? poem.stanzas[0].slice(0, 4).join('<br>')
      : '';

    card.innerHTML = `
      <div style="font-family:monospace;font-size:0.72rem;letter-spacing:0.18em;margin-bottom:0.6rem;opacity:0.75;">SCRAP № ${String(poem.n).padStart(2, '0')}</div>
      <h3 class="scrap-title">${poem.title}</h3>
      <p class="scrap-lines">${lines}...</p>
      <span class="scrap-handwriting">~ reading mode →</span>
    `;

    card.addEventListener('click', () => {
      openPoemFullscreen(poem, chosen, idx);
    });

    container.appendChild(card);
  });
}

function openPoemFullscreen(poem, poemArray, index) {
  if (poemArray) currentPoemList = poemArray;
  if (typeof index === 'number') currentPoemIndex = index;
  else if (currentPoemList.length) {
    currentPoemIndex = currentPoemList.findIndex(p => p.n === poem.n);
    if (currentPoemIndex === -1) currentPoemIndex = 0;
  }

  activeLightboxMode = 'poem';

  const modal = document.getElementById('streetLightbox');
  const imgHolder = modal.querySelector('.street-lightbox-frame');
  const metaHolder = modal.querySelector('.street-lightbox-meta');

  imgHolder.innerHTML = '';
  const paper = document.createElement('div');
  paper.className = 'poetry-scrap-card scrap-white';
  paper.style.maxWidth = '680px';
  paper.style.padding = '3rem 2.5rem';
  paper.style.boxShadow = '0 25px 70px rgba(0,0,0,0.95)';
  paper.style.transform = 'none';

  let stanzasHtml = '';
  if (poem.stanzas) {
    poem.stanzas.forEach(st => {
      stanzasHtml += `<div style="margin-bottom:1.8rem;"><p style="font-family:var(--font-hi-heavy);font-size:1.35rem;line-height:2rem;color:var(--ink);">${st.join('<br>')}</p></div>`;
    });
  }

  paper.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;border-bottom:1px solid #DDD;padding-bottom:0.6rem;">
      <span style="font-family:monospace;font-size:0.75rem;letter-spacing:0.2em;color:#777;font-weight:700;">POEM № ${poem.n}</span>
      <span style="font-family:var(--font-typewriter);font-size:0.75rem;color:var(--signal-red);">[ ${currentPoemIndex + 1} / ${currentPoemList.length} ]</span>
    </div>
    <h2 style="font-family:var(--font-hi-heavy);font-size:2.5rem;margin-bottom:1.6rem;color:var(--ink);">${poem.title}</h2>
    ${stanzasHtml}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2rem;border-top:1px dashed #CCC;padding-top:1rem;">
      <span style="font-family:var(--font-typewriter);font-size:0.75rem;color:#666;">Use ← → keys to read next poem</span>
      <span style="font-family:var(--font-hand);font-size:1.4rem;color:var(--signal-red);">~ Nightwalker</span>
    </div>
  `;

  imgHolder.appendChild(paper);
  metaHolder.innerHTML = '';
  modal.classList.add('open');
}

/* =========================================================
   5. STREET LIGHTBOX (WITH KEYBOARD ARROWS & PREV/NEXT)
   ========================================================= */
let activeLightboxMode = null; // 'poem' or 'photo'
let currentGalleryList = [];
let currentGalleryIndex = 0;

function initStreetLightbox() {
  const modal = document.getElementById('streetLightbox');
  if (!modal) return;

  const closeBtn = document.getElementById('streetLightboxClose');

  // Inject Prev / Next Navigation Arrows into Lightbox
  if (!modal.querySelector('.lightbox-prev-btn')) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav-btn lightbox-prev-btn';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '←';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    });
    modal.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav-btn lightbox-next-btn';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '→';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    });
    modal.appendChild(nextBtn);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeStreetLightbox());
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeStreetLightbox();
  });

  // Global Keyboard Navigation (←, →, Escape)
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeStreetLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateLightbox(1);
    }
  });
}

function closeStreetLightbox() {
  const modal = document.getElementById('streetLightbox');
  if (modal) modal.classList.remove('open');
  activeLightboxMode = null;
}

function navigateLightbox(dir) {
  if (activeLightboxMode === 'photo' && currentGalleryList.length) {
    currentGalleryIndex = (currentGalleryIndex + dir + currentGalleryList.length) % currentGalleryList.length;
    openStreetLightbox(currentGalleryList[currentGalleryIndex], currentGalleryList, currentGalleryIndex);
  } else if (activeLightboxMode === 'poem' && currentPoemList.length) {
    currentPoemIndex = (currentPoemIndex + dir + currentPoemList.length) % currentPoemList.length;
    openPoemFullscreen(currentPoemList[currentPoemIndex], currentPoemList, currentPoemIndex);
  }
}

function openStreetLightbox(item, galleryArray, index) {
  if (galleryArray) currentGalleryList = galleryArray;
  else if (window.GALLERY && window.GALLERY.items) currentGalleryList = window.GALLERY.items;

  if (typeof index === 'number') currentGalleryIndex = index;
  else if (currentGalleryList.length) {
    currentGalleryIndex = currentGalleryList.findIndex(g => g.img === item.img);
    if (currentGalleryIndex === -1) currentGalleryIndex = 0;
  }

  activeLightboxMode = 'photo';

  const modal = document.getElementById('streetLightbox');
  const imgHolder = modal.querySelector('.street-lightbox-frame');
  const metaHolder = modal.querySelector('.street-lightbox-meta');

  imgHolder.innerHTML = `
    <div class="lightbox-counter-badge">SHOT [ ${currentGalleryIndex + 1} / ${currentGalleryList.length} ] · USE ← → ARROWS</div>
    <img src="${item.img}" alt="${item.alt || item.title}">
  `;

  metaHolder.innerHTML = `
    <h4>${item.title}</h4>
    <p>${item.caption || item.alt || ''}</p>
  `;

  modal.classList.add('open');
}
