#!/usr/bin/env python3
"""Poetry doc -> js/poems.js
Usage: python3 tools/sync_poems.py poems.docx
Rules (your formatting is the parser):
  'N. Title'          starts poem N (bold line). The first poem may have no number: it becomes the next number.
  blank line(s)       stanza break
  'निघ्त वल्केर'        signature line: ends the poem
  mood                taken from data/moods.json (poem number -> mood). New poems default to 'रात'.
"""
import sys, re, json, os
import docx
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.join(HERE,'..')
args=[a for a in sys.argv[1:] if not a.startswith('--')]
outs=[a.split('=',1)[1] for a in sys.argv[1:] if a.startswith('--out=')]
if not args: sys.exit(__doc__)
moods=json.load(open(os.path.join(ROOT,'data','moods.json'),encoding='utf-8'))
NUM=re.compile(r'^\s*(\d+)\s*[.।)]\s*(\S.*)$',re.S)
SIG=re.compile(r'^\s*निघ्त\s*वल्केर\s*(\(.*\))?\s*$')
poems=[];cur=None;stanza=[];seen=set()
def flush_stanza():
    global stanza
    if cur is not None and stanza: cur['stanzas'].append(stanza)
    stanza=[]
for p in docx.Document(args[0]).paragraphs:
    t=p.text.replace('\u00a0',' ').strip()
    if cur is None or cur.get('done'):
        m=NUM.match(t)
        is_book=p.style.name.lower().startswith('book subtitle')
        if (m and len(poems)>=0) or (is_book and t):
            flush_stanza()
            if m: n=int(m.group(1));title=' '.join(m.group(2).split())
            else: n=len(poems)+1;title=' '.join(t.split())
            if n in seen: print('WARNING: poem number repeated:',n,title)
            seen.add(n)
            cur={'n':n,'title':title,'stanzas':[]};poems.append(cur);stanza=[]
        continue
    if SIG.match(t):
        flush_stanza();cur['done']=True;continue
    if not t: flush_stanza();continue
    for ln in t.split('\n'):
        ln=ln.strip()
        if ln: stanza.append(ln)
        else: flush_stanza()   # empty line inside a paragraph = stanza break
poems=[p for p in poems if p['stanzas']]
unfinished=[p['n'] for p in poems if not p.get('done')]
if unfinished: print('note: no signature after poem(s)',unfinished,'(kept anyway)')
fixes=json.load(open(os.path.join(ROOT,'data','title_fixes.json'),encoding='utf-8'))  # typo fixes: poem number -> title
for p in poems:
    p.pop('done',None); p['title']=fixes.get(str(p['n']),p['title']); p['mood']=moods.get(str(p['n']),'रात')
poems.sort(key=lambda p:p['n'])
out='window.POEMS='+json.dumps(poems,ensure_ascii=False,indent=0)+';\n'
dst=outs[0] if outs else os.path.join(ROOT,'js','poems.js')
open(dst,'w',encoding='utf-8').write(out)
print(len(poems),'poems ->',os.path.normpath(dst))
