NIGHTWALKER - Stage 6 (Auto-sync + polish)
Online daalne aur auto-sync ka poora guide: DEPLOY.md (pehle wahi padho).

Is stage mein kya aaya:
  - Auto-sync: tools/sync_docs.py + .github/workflows/sync.yml (har 30 min). Poetry doc -> js/poems.js, novel doc -> js/chapters.js.
    Safety: kharab/khaali doc aaye to kuch nahi badalta. Config: sync.config.json (do Doc ID).
  - Asli novel (Chapter 0 aur 1) ab site par hai. Chapter 1 adhoora hai, "likha ja raha hai" dikhta hai.
  - Offline + app: manifest, sw.js, icons/. Phone par Install / Add to Home Screen. Dekhe hue pannein bina internet ke padhe jaate hain.
  - Phone par neeche tab bar (Home, Poetry, Novel, Blog, Photos, Sketch). Pehle phone par nav tha hi nahi.
  - Qalam wala cursor (sirf mouse par) aur pannna-palatne ki halki aawaaz (default band). Header ke ✒ aur ♪ buttons se on/off.
  - Accessibility: skip link, focus ring, bade tap targets, reduced-motion, print style, noscript note.
  - Speed: hero preload, async decode, netlify _headers, robots.txt + noindex.
  - tools/optimize_images.py: kachchi photos -> chhoti .webp (~5MB se ~300KB), tareekh file ke naam mein.
Stage 6b (content): asli photos (13) gallery mein, 7 pahadi photos + StoryGram ka poora text blog "म्यर पहाड़" mein.
Jo bacha hai: sketches (tumne abhi bheje nahi, page par "कागज़ अभी सूख रहा है" dikhta hai).
Photo ke title/jagah badalni ho: js/photos.js (ek line per photo).

--- Stage 5 (Photography + Sketches) ---
Test: index.html double-click karo, ya folder ko Netlify Drop par drag karo.

Novel: novel.html. Text js/chapters.js mein hai. Abhi usme sirf PLACEHOLDER (namuna) chapters hain,
kyunki novel ka asli text is stage mein mujhe mila nahi.

Asli novel daalne ke liye:
  1. Google Doc ko File > Download > .docx karo (ya .txt)
  2. python3 tools/make_chapters.py novel.docx
     (adhoora chapter apne aap "likha ja raha hai" dikhega; zabardasti: --wip=1)
  Parser ke rules: "Chapter N" se chapter shuru, agli chhoti line = subtitle,
  poori bold line = sub-heading (progress rail par dot), *** = scene break.
Ya mujhe doc bhej do, main convert kar dunga.

Features: chapter list, "वहीं से पढ़ें" (last chapter yaad rehta hai), progress bar + dotted rail (laptop),
reading mode (sepia, bada font), A-/A+ font size, Alt+arrows se chapter badlo, Esc se wapas.
Agla stage: Blog wing.

--- Stage 4: Blog (blog.html) ---
Posts js/posts.js mein hain. Nayi post: file ke neeche wala TEMPLATE copy karo, fields badlo.
Photos assets/blog/ mein daalo (~1600px wide .webp). Abhi "म्यर पहाड़" post namuna hai (peaks.webp/hero.webp stand-in).
Asli 6 pahadi photos + StoryGram text bhej do, main post bhar dunga. Agla stage: Photography + Sketches.

--- Stage 5: photos.html, sketches.html ---
Photos: js/photos.js (ek line per photo; file name mein YYYYMMDD ho to date apne aap aati hai; bw:true = B&W).
Sketches: js/sketches.js. Images assets/photos/ aur assets/sketches/ mein daalo (~1600px wide .webp).
Abhi dono mein namuna (stand-in) images hain. Laptop par filmstrip (wheel se side-scroll), phone par vertical stack; lightbox mein swipe/arrows/Esc.
Agla stage: Auto-sync + polish (PWA/offline, speed, accessibility, deploy guide).
