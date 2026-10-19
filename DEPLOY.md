# Nightwalker: online daalne ka guide (ek baar ka kaam, ~20 minute)

Goal: tum Google Doc mein likho, 30 minute ke andar site par aa jaaye. Tumhe kuch nahi karna.

```
Google Doc  -->  GitHub Action (har 30 min)  -->  naya js/poems.js + js/chapters.js  -->  Netlify khud redeploy
```

## A. Pehle test karo (kuch install nahi karna)
Folder ko https://app.netlify.com/drop par drag karo. Site ek link par khul jaayegi. Bas.
(Is tareeke se auto-sync nahi chalega, wo neeche B se aata hai.)

## B. Auto-sync wala setup

### 1. Dono Google Docs ka sharing badlo
Doc kholo > Share > General access > **Anyone with the link: Viewer**.
Poetry doc aur novel doc, dono ke liye.
(Matlab link jis ke paas hai wo padh sakta hai. Link kisi ko mat bhejna jab tak chaho.)

### 2. Doc ID nikalo
Link aisa dikhta hai: `docs.google.com/document/d/`**`1AbC...xyz`**`/edit`
Bold wala lamba hissa = Doc ID.

### 3. GitHub par repo banao
1. github.com par account banao (free).
2. New repository > naam `nightwalker` > **Private** > Create.
3. "uploading an existing file" par click karo, is zip ke andar ka **poora folder** (andar ki files) drag karo.
4. **Dhyaan:** `.github` folder hidden hota hai (Mac/Windows mein dikhta nahi). Agar upload ke baad repo mein `.github/workflows/sync.yml` na dikhe:
   Add file > Create new file > naam mein likho `.github/workflows/sync.yml` > `.github/workflows/sync.yml` ka text yahan paste karo > Commit.

### 4. Doc IDs daalo
Repo mein `sync.config.json` kholo > pencil icon > dono ID bharo:
```
{ "poems_doc_id": "1AbC...", "novel_doc_id": "1XyZ..." }
```
Commit karo.

### 5. Netlify se jodo
1. netlify.com par GitHub se login.
2. Add new site > Import an existing project > GitHub > `nightwalker`.
3. Build command: **khaali**. Publish directory: **`.`** (sirf ek dot). Deploy.
4. Site settings > Change site name se apna link chuno.

### 6. Pehli baar sync chalao
Repo > Actions tab > "Sync Google Docs" > Run workflow. 1 minute mein hara tick aana chahiye.
Uske baad ye khud har 30 minute chalega. Naya kuch nahi hoga to kuch commit nahi hota.

## Doc ke formatting rules (parser yahi padhta hai)
**Poetry doc:** har kavita `N. Title` se shuru (bold), `निघ्त वल्केर` par khatam. Khaali line = stanza break.
Nayi kavita bas neeche jodo, agla number lagao. Pehchaan number se hoti hai, naam se nahi.
Mood tag `data/moods.json` mein hai (kavita number > mood). Nayi kavita ka default mood "रात" hota hai.
Mood badalna ho to file mein ek line badlo, ya mujhe bol do.
Title mein typo thik karni ho (jo doc mein rehne dena ho) to `data/title_fixes.json`.

**Novel doc:** `Chapter N` se chapter shuru, agli chhoti line subtitle, poori bold line sub-heading
(progress rail par dot), `***` scene break. Aakhri chapter agar vaaky ke beech ruka ho to "likha ja raha hai" dikhta hai.

## Safety jo laga hai
- Doc download na ho, ya login page aa jaaye, ya kavitayein achanak bahut kam dikhein (galti se doc khaali ho gayi) to sync **kuch nahi badalta** aur Action laal ho jaata hai (GitHub email bhejta hai).
- Har badlaav git history mein hai. Kuch galat chala jaaye to GitHub > Commits > Revert.

## Phone par app ki tarah
- Android (Chrome): menu > Install app.
- iPhone (Safari): Share > Add to Home Screen.
Ek baar khulne ke baad jo pannein dekhe hain wo bina internet ke bhi padhe ja sakte hain.

## Dhyaan rakhne wali baatein
- GitHub 60 din tak repo mein koi activity na ho to scheduled jobs rok deta hai. Actions tab mein "Enable workflow" dabao, phir chalu.
- Scheduled job kabhi 10-15 minute late chalta hai. Turant chahiye to Run workflow dabao.
- Site `noindex` hai (Google par nahi dikhegi), par link jis ke paas ho wo khol sakta hai. Passcode chaahiye to bata dena.
- Photos jodne ke liye: `python3 tools/optimize_images.py <photos folder> assets/photos` phir `js/photos.js` mein ek line.

## Local par sync chalana (bina GitHub ke)
```
pip install python-docx
python3 tools/sync_docs.py                                  # sync.config.json ke IDs se
python3 tools/sync_docs.py --poems=poems.docx --novel=novel.docx   # ya download ki hui files se
```
