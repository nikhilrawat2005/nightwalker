/**
 * Interactive Notebook Engine for Poetry Room
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.POEMS || !window.POEMS.length) return;

  const poems = window.POEMS;
  let currentIndex = poems.findIndex(p => p.n === 6);
  if (currentIndex === -1) currentIndex = 0;

  const titleEl = document.getElementById('poemTitle');
  const catEl = document.getElementById('poemCategory');
  const stanzasEl = document.getElementById('poemStanzas');
  const numEl = document.getElementById('currentPoemNum');
  const counterEl = document.getElementById('poemCounter');
  const prevBtn = document.getElementById('prevPoemBtn');
  const nextBtn = document.getElementById('nextPoemBtn');
  const gridEl = document.getElementById('poetryIndexGrid');
  const moodChips = document.querySelectorAll('.mood-chip');

  function renderCurrentPoem() {
    const poem = poems[currentIndex];
    numEl.textContent = String(poem.n).padStart(2, '0');
    counterEl.textContent = `${currentIndex + 1} / ${poems.length}`;
    titleEl.textContent = poem.title;

    const mood = (window.MOODS && window.MOODS[poem.n]) || 'एकांत';
    catEl.textContent = `Mood: ${mood} · Notebook Entry № ${poem.n}`;

    let html = '';
    if (poem.stanzas) {
      poem.stanzas.forEach(st => {
        html += '<div class="notebook-stanza">';
        st.forEach(line => {
          html += `<p class="devanagari">${line}</p>`;
        });
        html += '</div>';
      });
    }
    stanzasEl.innerHTML = html;

    window.scrollTo({
      top: document.querySelector('.notebook-spread').offsetTop - 30,
      behavior: 'smooth'
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + poems.length) % poems.length;
      renderCurrentPoem();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % poems.length;
      renderCurrentPoem();
    });
  }

  function renderGrid(mood = 'all') {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const filtered = mood === 'all'
      ? poems
      : poems.filter(p => (window.MOODS && window.MOODS[p.n]) === mood);

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = 'poem-notebook-item';
      
      const snippet = p.stanzas && p.stanzas[0] 
        ? p.stanzas[0].slice(0, 2).join(' / ') 
        : '';

      const pMood = (window.MOODS && window.MOODS[p.n]) || 'कविता';

      item.innerHTML = `
        <span class="p-num">№ ${String(p.n).padStart(2, '0')} · ${pMood}</span>
        <h4>${p.title}</h4>
        <p class="snippet">${snippet}...</p>
      `;

      item.addEventListener('click', () => {
        currentIndex = poems.findIndex(x => x.n === p.n);
        renderCurrentPoem();
      });

      gridEl.appendChild(item);
    });
  }

  moodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      moodChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderGrid(chip.dataset.mood);
    });
  });

  renderCurrentPoem();
  renderGrid('all');
});
