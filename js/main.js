/**
 * Nightwalker Core Interactive Engine
 * Handles active section observation, smooth scroll, gallery filtering,
 * interactive reading modals, and mobile navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initGallery();
  initPoetry();
  initNovel();
  initJournal();
  initLightbox();
});

/* =========================================================
   1. NAVIGATION & ACTIVE SECTION HIGHLIGHTING
   ========================================================= */
function initNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sidebar-menu a, .mobile-drawer a');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileToggle.textContent = mobileDrawer.classList.contains('open') ? '✕' : '☰';
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }

  // IntersectionObserver for active section highlight
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* =========================================================
   2. PHOTOGRAPHY ARCHIVE & FILTERING
   ========================================================= */
function initGallery() {
  const grid = document.getElementById('photoGrid');
  const filterBtns = document.querySelectorAll('.photo-filter-btn');
  if (!grid || !window.GALLERY || !window.GALLERY.items) return;

  const items = window.GALLERY.items;

  function renderGallery(cat = 'all') {
    grid.innerHTML = '';
    const filtered = cat === 'all' 
      ? items.slice(0, 16) 
      : items.filter(it => it.cat && it.cat.toLowerCase() === cat.toLowerCase());

    filtered.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = `photo-card ${item.bw ? 'is-bw' : ''}`;
      card.innerHTML = `
        <div class="card-thumb">
          <img src="${item.img}" alt="${item.alt || item.title}" loading="lazy" decoding="async">
        </div>
        <div class="photo-card-info">
          <span class="title">${item.title}</span>
          <span class="place">${item.place || 'Uttarakhand'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(item);
      });

      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.category);
    });
  });

  renderGallery('all');
}

/* =========================================================
   3. LIGHTBOX VIEWER
   ========================================================= */
let currentLightboxItem = null;

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxClose');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });
}

function openLightbox(item) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const title = document.getElementById('lightboxTitle');
  const caption = document.getElementById('lightboxCaption');
  if (!modal || !img) return;

  img.src = item.img;
  img.alt = item.alt || item.title;
  title.textContent = item.title;
  caption.textContent = item.caption || item.alt || '';

  modal.classList.add('open');
}

/* =========================================================
   4. POETRY ROOM EXPLORER
   ========================================================= */
function initPoetry() {
  const grid = document.getElementById('poetryGrid');
  const moodBtns = document.querySelectorAll('.mood-btn');
  if (!grid || !window.POEMS) return;

  const poems = window.POEMS;

  function renderPoetry(mood = 'all') {
    grid.innerHTML = '';
    
    // Select curated poems for the preview grid
    const sampleIds = [1, 2, 3, 4, 5, 6, 7, 8, 10, 16, 21, 52];
    let list = poems.filter(p => sampleIds.includes(p.n));

    if (mood !== 'all') {
      list = poems.filter(p => {
        const pMood = (window.MOODS && window.MOODS[p.n]) || '';
        return pMood === mood;
      }).slice(0, 9);
    }

    list.forEach(poem => {
      const card = document.createElement('article');
      card.className = 'poem-card-item';
      
      const lines = poem.stanzas && poem.stanzas[0] 
        ? poem.stanzas[0].slice(0, 4).join('\n') 
        : '';

      const moodTag = (window.MOODS && window.MOODS[poem.n]) || 'कविता';

      card.innerHTML = `
        <div class="card-top">
          <span>№ ${String(poem.n).padStart(2, '0')}</span>
          <span class="mood-pill">${moodTag}</span>
        </div>
        <h4>${poem.title}</h4>
        <p class="poem-preview-lines">${lines}...</p>
        <button class="poem-read-link" data-poem="${poem.n}">
          पूर्ण कविता पढ़ें →
        </button>
      `;

      card.querySelector('.poem-read-link').addEventListener('click', () => {
        openPoemModal(poem);
      });

      grid.appendChild(card);
    });
  }

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPoetry(btn.dataset.mood);
    });
  });

  renderPoetry('all');
}

function openPoemModal(poem) {
  const modal = document.getElementById('readerModal');
  const title = document.getElementById('readerTitle');
  const sub = document.getElementById('readerSub');
  const body = document.getElementById('readerBody');
  if (!modal) return;

  title.textContent = poem.title;
  title.className = 'devanagari';
  sub.textContent = `कविता क्रमांक № ${poem.n} — Nightwalker Archive`;
  
  let html = '<div class="poem-stanza-flow">';
  if (poem.stanzas) {
    poem.stanzas.forEach(st => {
      html += '<div class="poem-stanza">';
      st.forEach(line => {
        html += `<p class="devanagari">${line}</p>`;
      });
      html += '</div>';
    });
  }
  html += '</div>';

  body.innerHTML = html;
  modal.classList.add('open');
}

/* =========================================================
   5. NOVEL LIBRARY & CHAPTER VIEWER
   ========================================================= */
function initNovel() {
  const container = document.getElementById('novelChapterGrid');
  if (!container || !window.NOVELS) return;

  const currentNovel = window.NOVELS[0]; // म्यर पहाड़
  if (currentNovel && currentNovel.chapters) {
    currentNovel.chapters.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'chapter-card-item';
      card.innerHTML = `
        <span class="num">${ch.label}</span>
        <h4>${ch.title}</h4>
        <p>${ch.sub}</p>
      `;

      card.addEventListener('click', () => {
        openChapterModal(ch);
      });

      container.appendChild(card);
    });
  }
}

function openChapterModal(chapter) {
  const modal = document.getElementById('readerModal');
  const title = document.getElementById('readerTitle');
  const sub = document.getElementById('readerSub');
  const body = document.getElementById('readerBody');
  if (!modal) return;

  title.textContent = `म्यूर पहाड़ — ${chapter.title}`;
  sub.textContent = `${chapter.label} · Mountain Solitude and Trail`;

  if (window.POSTS && window.POSTS[0]) {
    const post = window.POSTS[0];
    let html = '';
    
    // Divide post body into chapter sections or render full story
    post.body.forEach(block => {
      if (block.t === 'q') {
        html += `<blockquote>${block.x}</blockquote>`;
      } else {
        html += `<p>${block.x}</p>`;
      }
    });

    body.innerHTML = html;
  }

  modal.classList.add('open');
}

/* =========================================================
   6. JOURNAL & STORY READER
   ========================================================= */
function initJournal() {
  const readBtn = document.getElementById('readJournalBtn');
  const modal = document.getElementById('readerModal');
  const closeBtn = document.getElementById('closeReaderBtn');

  if (readBtn && window.POSTS && window.POSTS[0]) {
    readBtn.addEventListener('click', () => {
      const post = window.POSTS[0];
      const title = document.getElementById('readerTitle');
      const sub = document.getElementById('readerSub');
      const body = document.getElementById('readerBody');

      title.textContent = post.title;
      sub.textContent = `${post.place} · ${post.date} · ${post.sub}`;

      let html = '';
      post.body.forEach(block => {
        if (block.t === 'q') {
          html += `<blockquote>${block.x}</blockquote>`;
        } else {
          html += `<p>${block.x}</p>`;
        }
      });

      body.innerHTML = html;
      modal.classList.add('open');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
}
