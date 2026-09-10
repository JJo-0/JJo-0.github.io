import asyncio
import datetime
import json
import os
import pathlib
import urllib.request
import urllib.error
from playwright.async_api import async_playwright

OUT = pathlib.Path('live-audit')
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('EDITORIAL_SITE_URL', 'https://jjo-0.github.io')
EXPECTED = {'2026-09-05': 5, '2026-09-06': 6, '2026-09-07': 3, '2026-09-08': 5}
NAVIER = '2026-09-09-navier-stokes-openai-frontier-one'
BLOGGER = 'https://jjo-0.blogspot.com/2026/09/navierstokes-ai.html'
FORBIDDEN = ['Full candidate archive', '대표·보류 후보 모두 보기', '19개 고유 주제가', '상세 원고 검토 중']
REMOVED = ['사용자가 제공한 공식 사이트의 별도 시각화도', '검토 범위:', '2026년 9월 9일 · 수학과 AI 연구', '여기서 검토 대상인 증명 주장(EARLY_SIGNAL)']

async def probe_blogger():
    attempts = []
    for attempt in range(2):
        try:
            with urllib.request.urlopen(BLOGGER, timeout=40) as response:
                attempts.append({'httpStatus': response.status, 'url': response.url})
                return {'status': 'PASS' if response.status == 200 else 'FAILED', 'url': BLOGGER, 'attempts': attempts}
        except urllib.error.HTTPError as error:
            retry_after = error.headers.get('Retry-After', '')
            attempts.append({'httpStatus': error.code, 'url': error.url, 'retryAfter': retry_after})
            if error.code != 429:
                return {'status': 'FAILED', 'url': BLOGGER, 'attempts': attempts}
            if attempt == 0:
                if retry_after and not retry_after.isdigit():
                    break
                delay = max(60, int(retry_after or '60'))
                if delay > 60:
                    break
                await asyncio.sleep(delay)
        except Exception as error:
            return {'status': 'NOT_VERIFIED', 'url': BLOGGER, 'error': repr(error), 'attempts': attempts}
    return {'status': 'RATE_LIMITED_NOT_VERIFIED', 'url': BLOGGER, 'attempts': attempts}

async def main():
    report = {'status': 'RUNNING', 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'news': [], 'articles': [], 'navier': []}
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            for width, height in [(390, 844), (1440, 1000)]:
                context = await browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, reduced_motion='reduce', color_scheme='light')
                page = await context.new_page()
                await page.route('**/*', lambda route: route.abort() if any(domain in route.request.url for domain in ['googlesyndication.com', 'doubleclick.net', 'google-analytics.com', 'googletagmanager.com']) else route.continue_())
                response = await page.goto(BASE + '/news/', wait_until='domcontentloaded', timeout=60000)
                assert response and response.status == 200
                await page.locator('[data-news-date="2026-09-05"]').wait_for(timeout=45000)
                await page.evaluate('document.fonts.ready')
                text = await page.locator('main').inner_text()
                for phrase in FORBIDDEN:
                    assert phrase not in text, phrase
                assert await page.locator('[data-news-candidate-archive]').count() == 0
                groups = await page.evaluate('''() => Object.fromEntries([...document.querySelectorAll('[data-news-date]')].map(section => [section.dataset.newsDate, [...section.querySelectorAll('[data-news-card]')].map(card => card.dataset.newsCard)]))''')
                for date, count in EXPECTED.items():
                    assert len(groups.get(date, [])) == count, (date, groups)
                assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 2')
                await page.screenshot(path=str(OUT / f'news-{width}.png'))
                await page.locator('[data-news-date="2026-09-08"]').screenshot(path=str(OUT / f'news-september-08-{width}.png'))
                report['news'].append({'width': width, 'groups': groups, 'archive_removed': True, 'overflow': False})
                slugs = [slug for date in EXPECTED for slug in groups[date]] + [NAVIER]
                assert len(slugs) == len(set(slugs)) == 20
                for slug in slugs:
                    response = await page.goto(BASE + '/posts/' + slug + '/', wait_until='domcontentloaded', timeout=60000)
                    assert response and response.status == 200, slug
                    await page.locator('article h2').first.wait_for(timeout=30000)
                    await page.evaluate('document.fonts.ready')
                    assert await page.locator('article .katex-error').count() == 0, slug
                    assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 2'), (slug, width, 'horizontal overflow')
                    images = page.locator('article img')
                    count = await images.count()
                    for index in range(count):
                        image = images.nth(index)
                        await image.scroll_into_view_if_needed()
                        await image.evaluate('img => img.decode()')
                        result = await image.evaluate('''img => { const r=img.getBoundingClientRect(); return {src:img.currentSrc,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight,displayedWidth:r.width,displayedHeight:r.height}; }''')
                        assert result['width'] > 0 and result['height'] > 0 and result['displayedWidth'] > 0 and result['displayedHeight'] > 0 and result['alt'].strip(), (slug, result)
                    math_count = await page.locator('article .math-display').count()
                    report['articles'].append({'slug': slug, 'width': width, 'httpStatus': 200, 'decodedImages': count, 'displayEquations': math_count, 'overflow': False})
                    if slug == NAVIER:
                        body = await page.locator('article').inner_text()
                        for phrase in REMOVED:
                            assert phrase not in body, phrase
                        assert math_count >= 33
                        assert await page.locator('article [data-typeset-equation-map]').count() == 1
                        assert await page.locator('article img[src*="navier-equation-map.svg"]').count() == 0
                        intro = page.locator('article h2').first
                        assert '이 글에서 이해할 질문' in await intro.inner_text()
                        next_paragraph = intro.locator('xpath=following-sibling::p[1]')
                        assert await next_paragraph.locator(f'a[href="{BLOGGER}"]').count() == 1
                        assert await page.evaluate('document.fonts.check("16px KaTeX_Main")')
                        await intro.scroll_into_view_if_needed()
                        await page.screenshot(path=str(OUT / f'navier-introduction-{width}.png'))
                        await page.locator('[data-typeset-equation-map]').screenshot(path=str(OUT / f'navier-equation-map-{width}.png'))
                        await page.locator('[data-news-figure="vortex"]').screenshot(path=str(OUT / f'navier-figure-1-{width}.png'))
                        equation_geometry = await page.locator('article .math-display').evaluate_all('''es => es.map(e => { const r=e.getBoundingClientRect(), k=e.querySelector('.katex-html'), kr=k?.getBoundingClientRect(); return {label:e.getAttribute('aria-label'),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,overflowX:getComputedStyle(e).overflowX,left:r.left,mathLeft:kr?.left,mathRight:kr?.right}; })''')
                        report['navier'].append({'width': width, 'blogger_first_section': True, 'removed_copy': True, 'real_katex_map': True, 'displayEquations': math_count, 'equationGeometry': equation_geometry})
                await context.close()
            await browser.close()
        report['gitblog_status'] = 'PASS'
        report['blogger'] = await probe_blogger()
        report['status'] = 'PASS' if report['blogger']['status'] == 'PASS' else 'GITBLOG_PASS_EXTERNAL_LINK_NOT_VERIFIED'
    except Exception as error:
        report['status'] = 'FAIL'
        report['error'] = repr(error)
        raise
    finally:
        (OUT / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
        print(json.dumps(report, ensure_ascii=False, indent=2))

asyncio.run(main())
