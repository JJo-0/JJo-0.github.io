import asyncio
import datetime
import json
import pathlib
from playwright.async_api import async_playwright

OUT=pathlib.Path('live-audit')
OUT.mkdir(exist_ok=True)
BASE='https://jjo-0.github.io'
ARTICLES={
 '2026-09-05-gpt-6-astra-safety-news':{'figures':11,'flows':1,'math':10,'headings':18,'title':'AI 정렬은 무엇을 시험할까? Astra 평가 그림 읽기','required':['99.789','54,218','g-mean','베이즈','Auto-Review','IPIArena','TPR']},
 '2026-09-05-aml-paradigm-news':{'figures':6,'flows':3,'math':3,'headings':15,'title':'백혈병 치료, 더 강한 항암제가 언제나 더 좋을까?','required':['MRD','Kaplan','14.5','Mass General Brigham','Pollyea','가상','ELN']}
}
BANNED=['공학자가 이 시험에서 배울 점','편집 점수','증거 등급','Full candidate archive','INDUSTRY_TRIGGER','EARLY_SIGNAL']

async def main():
 report={'status':'RUNNING','checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':[],'scope':'two revised September 5 articles and their NEWS cards'}
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch()
   for width,height in [(390,844),(1440,1000)]:
    context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce',color_scheme='light')
    page=await context.new_page()
    await page.route('**/*',lambda route:route.abort() if any(d in route.request.url for d in ['googlesyndication.com','doubleclick.net','google-analytics.com','googletagmanager.com']) else route.continue_())
    for slug,spec in ARTICLES.items():
     item={'slug':slug,'width':width,'url':BASE+'/posts/'+slug+'/','status':'RUNNING','images':[]}
     report['pages'].append(item)
     response=await page.goto(item['url'],wait_until='domcontentloaded',timeout=60000)
     assert response and response.status==200,(slug,'http')
     await page.locator('article [data-research-figure]').first.wait_for(timeout=45000)
     await page.evaluate('document.fonts.ready')
     body=await page.locator('article').inner_text()
     assert spec['title'] in await page.title(),(slug,'title')
     for phrase in BANNED: assert phrase not in body,(slug,phrase)
     for phrase in spec['required']: assert phrase in body,(slug,'missing text',phrase)
     assert len(body)>12000,(slug,len(body))
     assert await page.locator('article [data-research-figure]').count()==spec['figures']
     assert await page.locator('article [data-research-flow]').count()==spec['flows']
     assert await page.locator('article .math-display').count()>=spec['math']
     assert await page.locator('article h2').count()>=spec['headings']
     assert await page.locator('article .katex-error').count()==0
     assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),(slug,width,'page overflow')
     await page.screenshot(path=str(OUT/f'{slug}-{width}-top.png'))
     images=page.locator('article [data-research-figure] img')
     for i in range(await images.count()):
      im=images.nth(i)
      await im.scroll_into_view_if_needed()
      try:
       await im.evaluate('img => new Promise((resolve,reject)=>{if(img.complete){img.naturalWidth>0?resolve():reject(new Error("image complete but invalid"));return;}const timer=setTimeout(()=>reject(new Error("image timeout")),20000);img.addEventListener("load",()=>{clearTimeout(timer);resolve();},{once:true});img.addEventListener("error",()=>{clearTimeout(timer);reject(new Error("image load error"));},{once:true});})')
       await im.evaluate('img=>img.decode()')
       info=await im.evaluate('img=>{const r=img.getBoundingClientRect();return{src:img.currentSrc,alt:img.alt,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:r.width,height:r.height};}')
       assert info['naturalWidth']>0 and info['width']>0 and info['height']>0 and len(info['alt'])>15,info
       item['images'].append(info)
      except Exception as error:
       await page.screenshot(path=str(OUT/f'failed-{slug}-{width}-{i}.png'))
       raise RuntimeError(f'{slug} width={width} image={i}: {error}') from error
     figures=page.locator('article [data-research-figure]')
     for i in ([1,8,9] if 'astra' in slug else [0,1,4]):
      await figures.nth(i).scroll_into_view_if_needed()
      await page.wait_for_timeout(250)
      await figures.nth(i).screenshot(path=str(OUT/f'{slug}-{width}-figure-{i+1}.png'))
     viewports=await page.locator('.figure-viewport[role="region"]').evaluate_all('es=>es.map(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth,overflowX:getComputedStyle(e).overflowX,label:e.getAttribute("aria-label")}))')
     assert all(x['overflowX']=='auto' and x['label'] for x in viewports)
     item.update(status='PASS',renderedCharacters=len(body),figureCount=spec['figures'],flowCount=spec['flows'],mathCount=await page.locator('article .math-display').count(),pageOverflow=False,scrollableFigures=viewports)
     if width==1440:(OUT/f'{slug}-visible-text.txt').write_text(body,encoding='utf8')
    response=await page.goto(BASE+'/news/',wait_until='domcontentloaded',timeout=60000)
    assert response and response.status==200
    await page.locator('[data-news-date="2026-09-05"]').wait_for(timeout=30000)
    assert await page.locator('[data-news-date="2026-09-05"] [data-news-card]').count()==5
    for slug in ARTICLES:
     card=page.locator(f'[data-news-card="{slug}"]')
     image=card.locator('img').first
     await image.scroll_into_view_if_needed()
     await image.evaluate('img=>img.decode()')
     assert await image.evaluate('img=>img.naturalWidth>0')
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+2')
    await page.locator('[data-news-date="2026-09-05"]').screenshot(path=str(OUT/f'news-september05-{width}.png'))
    await context.close()
   await browser.close()
  assert len(report['pages'])==4
  report['status']='PASS'
 except Exception as error:
  report['status']='FAIL'
  report['error']=repr(error)
  raise
 finally:
  (OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  print(json.dumps(report,ensure_ascii=False,indent=2))

asyncio.run(main())
