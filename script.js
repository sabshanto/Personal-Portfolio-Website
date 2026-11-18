/* Your work lives in works.json. Add, edit or delete it from admin.html (no code needed).
   Fields: k = video | design | marketing | web, img, yt (YouTube ID), link.
   k: 'video' | 'design' | 'marketing' | 'web'
   img: image path, yt: YouTube video ID (opens a player), link: optional live URL
   Marketing example: { t:'Campaign name', k:'marketing', img:'images/x.png', d:'What you ran and the result', tools:'Meta Ads Manager', yt:'', link:'' } */
let works = []; // loaded from works.json (edit it from admin.html)

const kinds = { video: 'Video', design: 'Design', marketing: 'Marketing', web: 'Web' };
const grid = document.getElementById('grid');
const viewer = document.getElementById('viewer');
const media = document.getElementById('v-media');

const LIMIT = 8;
const secTitle = { video: 'Videos', design: 'Design', marketing: 'Marketing', web: 'Web projects' };
function cardHTML(w, i, extra) {
  return `
    <button class="card${extra ? ' extra' : ''}" data-k="${w.k}" data-ar="${w.ar || 'h'}" data-i="${i}">
      <div class="thumb"><img src="${w.img.replace(/ /g, '%20')}" alt="${w.t}" loading="lazy" onerror="if(this.src.includes('maxresdefault'))this.src=this.src.replace('maxresdefault','hqdefault');else markMissing(this)"></div>
      <h3>${w.t}</h3>
      <p>${w.d.split('. ')[0].replace(/\.?$/, '.')}</p>
    </button>`;
}
function render() {
  const secs = [];
  works.forEach((w, i) => {
    const name = w.g || secTitle[w.k];
    let s = secs.find(x => x.name === name && x.k === w.k);
    if (!s) secs.push(s = { name, k: w.k, items: [] });
    s.items.push([w, i]);
  });
  grid.innerHTML = secs.map(s => `
    <div class="sec" data-k="${s.k}">
      <h3 class="sec-t">${s.name} <small>${s.items.length}</small></h3>
      <div class="grid">${s.items.map(([w, i], n) => cardHTML(w, i, n >= LIMIT)).join('')}</div>
      ${s.items.length > LIMIT ? `<button class="more">Show all ${s.items.length}</button>` : ''}
    </div>`).join('');
  const cur = document.querySelector('.filters [aria-pressed=true]');
  setFilter(cur ? cur.dataset.f : 'all');
}

function setFilter(f) {
  document.querySelectorAll('.filters button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));
  document.querySelectorAll('.sec').forEach(sec => { sec.hidden = f !== 'all' && sec.dataset.k !== f; });
  const shown = document.querySelectorAll('.sec:not([hidden]) .card:not([data-missing])').length;
  let e = document.getElementById('empty');
  if (!e) { grid.insertAdjacentHTML('afterend', '<p id="empty" class="muted" hidden>New work in this category is coming soon.</p>'); e = document.getElementById('empty'); }
  e.hidden = shown > 0;
}

/* a work whose image file is not in the images folder yet stays hidden until you add the file */
function markMissing(img) {
  const c = img.closest('.card');
  if (!c) return;
  c.dataset.missing = '1';
  const cur = document.querySelector('.filters [aria-pressed=true]');
  setFilter(cur ? cur.dataset.f : 'all');
}

document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));

grid.addEventListener('click', e => {
  const more = e.target.closest('.more');
  if (more) { more.closest('.sec').classList.add('open'); more.remove(); return; }
  const card = e.target.closest('.card');
  if (!card) return;
  const w = works[card.dataset.i];
  media.innerHTML = w.yt
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${w.yt}?rel=0&autoplay=1&playsinline=1" title="${w.t}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
    : `<img src="${w.img.replace(/ /g, '%20')}" alt="${w.t}">`;
  media.classList.toggle('vert', w.ar === 'v');
  media.classList.toggle('sq', w.ar === 's');
  document.getElementById('v-title').textContent = w.t;
  document.getElementById('v-desc').textContent = w.d;
  document.getElementById('v-tools').textContent = w.tools ? 'Made with ' + w.tools : '';
  const link = document.getElementById('v-link');
  link.hidden = !w.link;
  if (w.link) link.href = w.link;
  viewer.showModal();
});
viewer.addEventListener('close', () => { media.innerHTML = ''; });
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
viewer.querySelector('.close').addEventListener('click', () => viewer.close());

/* header background after scrolling + active nav link */
const header = document.getElementById('site-header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });
const links = [...document.querySelectorAll('.pill a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
['home', 'work', 'experience', 'about', 'contact'].forEach(id => spy.observe(document.getElementById(id)));

fetch('works.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject())
  .then(d => { if (Array.isArray(d)) { works = d; render(); } })
  .catch(() => render());

/* nav + all #links: smooth-scroll to the section (works everywhere, incl. embedded previews) */
const jump = id => { const t = id ? document.getElementById(id) : document.body; if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
document.querySelectorAll('a').forEach(a => { const h = a.getAttribute('href') || ''; if (h.charAt(0) !== '#') return; a.addEventListener('click', e => { e.preventDefault(); jump(h.slice(1)); links.forEach(l => l.classList.toggle('active', l === a)); }); });

document.getElementById('year').textContent = new Date().getFullYear();
