import re,json,sys,time,urllib.request,concurrent.futures as cf
urls=[l.strip() for l in open(sys.argv[1]) if l.strip()]
KEEP=['id','code','name','category_name','description','price','promotion','on_hand','is_sku_in_stock','is_active','is_displayed','ref_master_id']
def get(u):
    for a in range(3):
        try:
            req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 catalog-export'})
            h=urllib.request.urlopen(req,timeout=30).read().decode()
            d=json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',h,re.S).group(1))
            p=d['props']['pageProps']['initialState']['products']['productDetail']
            if not p: return {'url':u,'error':'none'}
            r={k:p.get(k) for k in KEEP}; r['url']=u
            r['images']=[x['url'] for x in p.get('ref_attachments') or [] if x.get('type')=='image']
            r['skus']=[{'name':s.get('name'),'price':s.get('price'),'promotion':s.get('promotion'),'attrs':s.get('ref_attributes'),'in_stock':s.get('is_sku_in_stock')} for s in (p.get('skus') or p.get('children') or [])]
            return r
        except Exception as e:
            err=str(e); time.sleep(2)
    return {'url':u,'error':err}
out=[]
with cf.ThreadPoolExecutor(4) as ex:
    for i,r in enumerate(ex.map(get,urls)):
        out.append(r)
        if i%100==0: print(i,file=sys.stderr)
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False)
print(len(out),sum(1 for r in out if 'error' in r))
