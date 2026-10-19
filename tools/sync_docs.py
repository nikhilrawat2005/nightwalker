#!/usr/bin/env python3
"""Google Docs -> site.  Downloads your poetry + novel docs, rebuilds js/poems.js and js/chapters.js.
  python3 tools/sync_docs.py                       (reads sync.config.json; this is what the GitHub Action runs)
  python3 tools/sync_docs.py --poems=a.docx --novel=b.docx    (test with local files, no internet)
Safety: if a download fails, is not a real .docx (e.g. a Google login page), or the result looks much
smaller than what the site already has, NOTHING is changed and the script exits with an error.
"""
import sys, os, json, re, shutil, subprocess, tempfile, urllib.request, urllib.error
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.normpath(os.path.join(HERE,'..'))
arg=lambda k:next((a.split('=',1)[1] for a in sys.argv[1:] if a.startswith('--'+k+'=')),None)
cfg=json.load(open(os.path.join(ROOT,'sync.config.json'),encoding='utf-8'))
tmp=tempfile.mkdtemp()
def fetch(doc_id,name):
    url=f'https://docs.google.com/document/d/{doc_id}/export?format=docx'
    dst=os.path.join(tmp,name)
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'nightwalker-sync'})
        data=urllib.request.urlopen(req,timeout=60).read()
    except urllib.error.URLError as e:
        sys.exit(f'ERROR: {name} download nahi hua ({e}). Doc ka sharing "Anyone with the link: Viewer" hai?')
    if data[:2]!=b'PK': sys.exit(f'ERROR: {name} asli .docx nahi aaya (shayad doc private hai). Sharing check karo.')
    open(dst,'wb').write(data);return dst
def count(path,pat):
    try:return len(re.findall(pat,open(path,encoding='utf-8').read()))
    except OSError:return 0
jobs=[]
for key,script,out,pat in (('poems','sync_poems.py','js/poems.js',r'"stanzas"'),('novel','make_chapters.py','js/chapters.js',r'"blocks"')):
    src=arg(key)
    if not src:
        did=cfg.get(key+'_doc_id','').strip()
        if not did: print(f'skip {key}: sync.config.json mein {key}_doc_id khaali hai');continue
        src=fetch(did,key+'.docx')
    new=os.path.join(tmp,os.path.basename(out))
    r=subprocess.run([sys.executable,os.path.join(HERE,script),src,'--out='+new],capture_output=True,text=True)
    print(r.stdout.strip());
    if r.returncode: sys.exit(f'ERROR: {key} parse fail:\n{r.stderr}')
    old=os.path.join(ROOT,out);n_old,n_new=count(old,pat),count(new,pat)
    if n_new==0 or n_new<n_old*0.8: sys.exit(f'ERROR: {key}: pehle {n_old} tukde the, ab sirf {n_new}. Shak hai, isliye kuch nahi badla.')
    jobs.append((new,old,key,n_old,n_new))
changed=False
for new,old,key,n_old,n_new in jobs:
    same=os.path.exists(old) and open(new,'rb').read()==open(old,'rb').read()
    if not same: shutil.copyfile(new,old);changed=True
    print(f'{key}: {n_old} -> {n_new}',('(no change)' if same else '(UPDATED)'))
print('CHANGED' if changed else 'UNCHANGED')
