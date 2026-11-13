/* 영어공부 글 만들기 — blog/_posts/*.html (글 내용) → blog/<slug>.html, blog/index.html(목록), sitemap.xml
   실행: node build.js
   (이 PC에는 node 가 없어서: ELECTRON_RUN_AS_NODE=1 "VS Code/Code.exe" build.js)

   글 파일 모양 (blog/_posts/<slug>.html — 파일 이름이 곧 주소):
   <!--
   title: 글 제목
   description: 검색 결과에 보일 한두 문장 요약
   tag: 회화 공부법
   date: 2026-11-06
   -->
   <div class="summary">…</div>
   <h2>…</h2><p>…</p>
*/
const fs = require('fs');
const path = require('path');

const SITE = 'https://seochoedu.co.kr';
const BRAND = '말트임 1:1 회화';
const PHONE = '010-5577-3067';
const ROOT = __dirname;
const SRC = path.join(ROOT, 'blog', '_posts');
const OUT = path.join(ROOT, 'blog');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const korDate = d => { const [y, m, day] = d.split('-'); return `${y}년 ${+m}월 ${+day}일`; };

function readPost(file) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/^﻿/, '');
  const m = /^\s*<!--([\s\S]*?)-->\s*([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(file + ': 맨 위에 <!-- title: … --> 머리말이 없습니다');
  const meta = {};
  m[1].split(/\r?\n/).forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  for (const k of ['title', 'description', 'tag', 'date']) {
    if (!meta[k]) throw new Error(file + ': 머리말에 ' + k + ' 가 없습니다');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(file + ': date 는 2026-11-06 모양이어야 합니다');
  return { ...meta, slug: file.replace(/\.html$/, ''), body: m[2].trim() };
}

const head = ({ title, description, url, type, extra = '' }) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/hero.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog/blog.css">
${extra}</head>
<body>
<header>
  <div class="wrap">
    <a href="/" class="logo">말트임 <em>1:1 회화</em></a>
    <nav>
      <a href="/" class="hide-m">홈</a>
      <a href="/#services" class="hide-m">프로그램</a>
      <a href="/chinese.html" class="hide-m">중국어</a>
      <a href="/japanese.html" class="hide-m">일본어</a>
      <a href="/blog/">회화공부</a>
      <a href="/#apply" class="btn">상담신청</a>
    </nav>
  </div>
</header>
`;

const foot = `
<footer>
  <div class="wrap">
    <div class="logo">${BRAND}</div>
    <p>1:1 전화영어·화상영어 · 성인 · 주니어 · 비즈니스 · 시니어 영어회화</p>
    <p>상담 ${PHONE} · 상담 신청은 언제든 가능해요</p>
    <p style="margin-top:14px">ⓒ ${BRAND} All Rights Reserved.</p>
  </div>
</footer>
<div class="bottombar">
  <div class="wrap">
    <span class="msg"><b>내 실력은 어느 정도일까?</b> 무료 레벨테스트 신청하기</span>
    <a href="tel:${PHONE.replace(/-/g, '')}">📞 ${PHONE}</a>
    <a href="/#apply" class="btn">신청하기</a>
  </div>
</div>
<script src="/visit.js" defer></script>
</body>
</html>
`;

function postPage(p, others) {
  const url = `${SITE}/blog/${p.slug}.html`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.date, inLanguage: 'ko', mainEntityOfPage: url,
    image: `${SITE}/images/hero.jpg`,
    author: { '@type': 'Organization', name: BRAND }, publisher: { '@type': 'Organization', name: BRAND }
  };
  return head({
    title: `${p.title} | ${BRAND}`, description: p.description, url, type: 'article',
    extra: `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n`
  }) + `
<main class="wrap narrow">
  <div class="crumb"><a href="/">홈</a> › <a href="/blog/">회화공부</a></div>
  <article>
    <span class="tag">${esc(p.tag)}</span>
    <h1>${esc(p.title)}</h1>
    <div class="meta">${BRAND} · <time datetime="${p.date}">${korDate(p.date)}</time></div>
${p.body}
    <div class="cta-box">
      <h2>읽는 것보다 말해보는 게 빠릅니다</h2>
      <p>15분 무료 레벨테스트로 지금 말하기 수준과 나에게 맞는 수업을 확인해보세요.</p>
      <a href="/#apply" class="btn">무료 레벨테스트 신청</a>
      <a class="tel" href="tel:${PHONE.replace(/-/g, '')}">📞 전화 상담 ${PHONE}</a>
    </div>
  </article>
  <section class="more">
    <h2>함께 읽으면 좋은 글</h2>
    <ul>
${others.map(o => `      <li><a href="/blog/${o.slug}.html">${esc(o.title)}</a></li>`).join('\n')}
    </ul>
  </section>
</main>
` + foot;
}

function listPage(posts) {
  return head({
    title: `회화공부 — 영어·중국어·일본어 회화와 시험 대비 공부법 | ${BRAND}`,
    description: '영어회화 공부법, 전화영어·화상영어 고르는 법, OPIc·토익스피킹 대비, 비즈니스·여행 영어 표현까지. 말트임 1:1 회화가 정리한 영어 공부 글 모음.',
    url: `${SITE}/blog/`, type: 'website'
  }) + `
<section class="blog-hero">
  <div class="wrap">
    <h1>회화공부</h1>
    <p>말이 트이는 영어를 위한 공부법과 바로 쓰는 표현을 정리했어요.</p>
  </div>
</section>
<main class="wrap">
  <div class="post-list">
${posts.map(p => `    <a class="post-card" href="/blog/${p.slug}.html">
      <span class="tag">${esc(p.tag)}</span>
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.description)}</p>
      <time datetime="${p.date}">${korDate(p.date)}</time>
    </a>`).join('\n')}
  </div>
</main>
` + foot;
}

function sitemap(posts) {
  const today = posts.length ? posts[0].date : new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, lastmod: today },
    { loc: `${SITE}/blog/`, lastmod: today },
    { loc: `${SITE}/parents.html`, lastmod: today },
    { loc: `${SITE}/chinese.html`, lastmod: today },
    { loc: `${SITE}/japanese.html`, lastmod: today },
    ...posts.map(p => ({ loc: `${SITE}/blog/${p.slug}.html`, lastmod: p.date }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
}

const posts = fs.readdirSync(SRC).filter(f => f.endsWith('.html')).map(readPost)
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

posts.forEach(p => {
  const others = posts.filter(o => o !== p).slice(0, 5);
  fs.writeFileSync(path.join(OUT, p.slug + '.html'), postPage(p, others));
});
fs.writeFileSync(path.join(OUT, 'index.html'), listPage(posts));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(posts));
console.log(`글 ${posts.length}편 → blog/, sitemap.xml 완료`);
