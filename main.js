'use strict';

/* =============================================
   HEADER — transparent on hero, frosted on scroll
   ============================================= */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* =============================================
   HAMBURGER
   ============================================= */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');
hamburger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

/* =============================================
   SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' });
  });
});

/* =============================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================= */
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || 0);
    setTimeout(() => entry.target.classList.add('is-visible'), delay);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

/* =============================================
   PARALLAX — hero scene moves slower on scroll
   ============================================= */
const heroScene = document.querySelector('.hero__scene');
const heroBg    = document.querySelector('.hero__gradient');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroScene) heroScene.style.transform = `translateY(${y * 0.18}px)`;
  if (heroBg)    heroBg.style.transform    = `translateY(${y * 0.08}px)`;
}, { passive: true });

/* =============================================
   NUMBER COUNTER (hero stats)
   ============================================= */
function animateCount(el, target, suffix, duration = 1800) {
  const start = performance.now();
  const update = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el  = entry.target.querySelector('.hstat__num');
    const cnt = parseInt(entry.target.dataset.count);
    const sfx = entry.target.dataset.suffix || '';
    if (el && cnt) animateCount(el, cnt, sfx);
    statsObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hstat[data-count]').forEach(el => statsObs.observe(el));

/* =============================================
   PRODUCT FILTER
   ============================================= */
document.querySelectorAll('.pf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    document.querySelectorAll('.prod-card').forEach(c => {
      const show = f === 'all' || c.dataset.category === f;
      c.classList.toggle('hidden', !show);
      if (show) { c.classList.remove('is-visible'); void c.offsetWidth; revealObs.observe(c); }
    });
  });
});

/* =============================================
   TOAST
   ============================================= */
function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 450); }, 3800);
}

/* =============================================
   QUOTE FORM
   ============================================= */
const PRODUCTS = {
  '명함':       { sizes:['표준 90×52mm','미니 85×49mm','유럽형 85×55mm','정사각 55×55mm'], papers:['아트지 250g','스노우지 300g','고급무광지 350g','크라프트지 250g'], unit:'장', base:{50:7900,100:9900,200:15000,500:30000,1000:50000} },
  '전단지':     { sizes:['A6 (105×148mm)','A5 (148×210mm)','A4 (210×297mm)','3단접지 A4'], papers:['아트지 100g','아트지 150g','스노우지 120g','무광아트지 150g'], unit:'장', base:{100:15000,200:22000,500:38000,1000:55000} },
  '포스터':     { sizes:['A4 (210×297mm)','B4 (257×364mm)','A3 (297×420mm)','A2 (420×594mm)'], papers:['아트지 150g','아트지 200g','무광아트지 180g','포토용지'], unit:'장', base:{1:2500,10:18000,50:65000,100:110000} },
  '스티커':     { sizes:['명함형 90×52mm','A6 낱장','A5 낱장','원형 50mm','커스텀 칼선'], papers:['광택지','무광지','투명지','크라프트지','방수필름'], unit:'매', base:{50:5000,100:8000,300:18000,500:26000,1000:42000} },
  '책자':       { sizes:['A6 (105×148mm)','A5 (148×210mm)','A4 (210×297mm)'], papers:['표지 아트지250g/내지 아트지100g','표지 스노우지300g/내지 미색모조80g','표지 무광아트지250g/내지 중질지75g'], unit:'권', base:{10:35000,30:80000,50:120000,100:200000} },
  '에코백':     { sizes:['M (35×40cm)','L (38×42cm)','XL (40×45cm)','파우치형'], papers:['면 10호','면 7호 (두꺼움)','부직포 90g','캔버스'], unit:'개', base:{1:5500,10:45000,30:110000,50:170000} },
  '패키지박스': { sizes:['소형 100×100×80mm','중형 200×150×100mm','대형 300×200×150mm','맞춤 사이즈'], papers:['아트지 (외부 인쇄)','크라프트지','고급 에코보드'], unit:'개', base:{50:55000,100:95000,300:240000,500:370000} },
  '현수막':     { sizes:['소형 90×60cm','표준 200×60cm','대형 300×90cm','맞춤 사이즈'], papers:['타포린 (방수)','메시 (통풍)','패브릭 (고급)'], unit:'장', base:{1:12000,3:30000,5:46000,10:85000} },
  '기타':       { sizes:['직접 입력'], papers:['상담 후 결정'], unit:'개', base:{1:0} },
};
const FINISH_PRICES = { '유광코팅':2000,'무광코팅':3000,'금박':18000,'은박':15000,'에폭시':12000,'형압/엠보':10000,'타공':5000 };

let Q = { product:null, size:'', paper:'', side:'단면', qty:100, finishes:[], deadline:'' };

/* ---- Price calc ---- */
function calcPrice() {
  const p = PRODUCTS[Q.product]; if (!p) return null;
  const keys = Object.keys(p.base).map(Number).sort((a,b)=>a-b);
  let base = p.base[keys[0]];
  for (const k of keys) if (Q.qty >= k) base = p.base[k];
  if (Q.qty > keys[keys.length-1]) base = Math.round(p.base[keys[keys.length-1]] / keys[keys.length-1] * Q.qty * 0.92);
  else {
    for (let i = 0; i < keys.length-1; i++) {
      if (Q.qty > keys[i] && Q.qty < keys[i+1]) {
        base = Math.round(p.base[keys[i]] + (Q.qty-keys[i])/(keys[i+1]-keys[i]) * (p.base[keys[i+1]]-p.base[keys[i]]));
        break;
      }
    }
  }
  if (Q.side === '양면') base = Math.round(base * 1.6);
  return base + Q.finishes.reduce((s,f) => s+(FINISH_PRICES[f]||0), 0);
}

/* ---- Summary update ---- */
function updateSummary() {
  const set = (id, v) => { const r = document.getElementById(id); if (r) r.querySelector('.qs-val').textContent = v||'—'; };
  set('qsProduct', Q.product);
  set('qsSize',    Q.size);
  set('qsPaper',   Q.paper);
  set('qsSide',    Q.side);
  const p = Q.product ? PRODUCTS[Q.product] : null;
  set('qsQty',     Q.qty ? `${Q.qty.toLocaleString()}${p?.unit||''}` : '—');
  set('qsFinish',  Q.finishes.length ? Q.finishes.join(', ') : '없음');
  set('qsDeadline',Q.deadline||'—');

  const amtEl = document.getElementById('qsPriceAmount');
  if (!amtEl) return;
  const total = calcPrice();
  amtEl.textContent = (total === null || total === 0) ? '상담 필요' : total.toLocaleString() + '원~';
  amtEl.classList.remove('pop'); void amtEl.offsetWidth; amtEl.classList.add('pop');
}

/* ---- Step navigation ---- */
function goStep(n) {
  document.querySelectorAll('.q-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('qPanel'+n)?.classList.add('active');
  document.querySelectorAll('.q-step').forEach(el => {
    const s = +el.dataset.step;
    el.classList.toggle('active', s === n);
    el.classList.toggle('done',   s < n);
  });
  document.querySelectorAll('.q-step__line').forEach((l,i) => l.classList.toggle('done', i < n-1));
}

/* ---- Step 1 ---- */
document.querySelectorAll('input[name="qProduct"]').forEach(r => r.addEventListener('change', () => {
  Q.product = r.value;
  document.getElementById('qNext1').disabled = false;
  const p = PRODUCTS[r.value];
  if (p) {
    const sEl = document.getElementById('qSize');
    const pEl = document.getElementById('qPaper');
    sEl.innerHTML = '<option value="">선택해 주세요</option>' + p.sizes.map(s=>`<option>${s}</option>`).join('');
    pEl.innerHTML = '<option value="">선택해 주세요</option>' + p.papers.map(s=>`<option>${s}</option>`).join('');
    document.getElementById('qQtyUnit').textContent = p.unit;
    document.getElementById('qQty').value = Object.keys(p.base)[0];
    Q.qty = +Object.keys(p.base)[0]; Q.size=''; Q.paper='';
  }
  updateSummary();
}));
document.getElementById('qNext1').addEventListener('click', () => goStep(2));

/* ---- Step 2 ---- */
document.getElementById('qSize').addEventListener('change',  e => { Q.size = e.target.value; updateSummary(); });
document.getElementById('qPaper').addEventListener('change', e => { Q.paper= e.target.value; updateSummary(); });
document.querySelectorAll('input[name="qSide"]').forEach(r => r.addEventListener('change', () => { Q.side=r.value; updateSummary(); }));

const qtyInput = document.getElementById('qQty');
const QTY_STEPS = [1,5,10,30,50,100,200,300,500,1000,2000,5000,10000];
function setQty(v) { const n=Math.max(1,Math.min(100000,parseInt(v)||1)); qtyInput.value=n; Q.qty=n; updateSummary(); }
document.getElementById('qQtyMinus').addEventListener('click', () => { const cur=+qtyInput.value; setQty([...QTY_STEPS].reverse().find(s=>s<cur)||1); });
document.getElementById('qQtyPlus').addEventListener('click',  () => { const cur=+qtyInput.value; setQty(QTY_STEPS.find(s=>s>cur)||(cur+1000)); });
qtyInput.addEventListener('input', () => setQty(qtyInput.value));

document.querySelectorAll('#qFinishGroup input').forEach(cb => cb.addEventListener('change', () => {
  Q.finishes = [...document.querySelectorAll('#qFinishGroup input:checked')].map(c=>c.value);
  updateSummary();
}));
document.getElementById('qDeadline').addEventListener('change', e => { Q.deadline=e.target.value; updateSummary(); });

document.getElementById('qPrev2').addEventListener('click', () => goStep(1));
document.getElementById('qNext2').addEventListener('click', () => goStep(3));

/* ---- Step 3 ---- */
document.getElementById('qPrev3').addEventListener('click', () => goStep(2));

document.getElementById('qSubmit').addEventListener('click', () => {
  const name  = document.getElementById('qName').value.trim();
  const phone = document.getElementById('qPhone').value.trim();
  if (!Q.product) { toast('⚠️ 제품을 먼저 선택해 주세요.'); return; }
  if (!name || !phone) { toast('⚠️ 이름과 연락처는 필수 항목입니다.'); return; }

  const total = calcPrice();
  document.querySelector('.quote__form-wrap').innerHTML = `
    <div style="text-align:center;padding:72px 24px;">
      <div style="font-size:4rem;margin-bottom:28px;animation:pricePop .6s ease;">✅</div>
      <h3 style="font-size:1.6rem;font-weight:700;letter-spacing:-0.02em;color:var(--fg);margin-bottom:12px;">접수 완료!</h3>
      <p style="color:var(--fg2);line-height:1.8;margin-bottom:36px;">
        <strong>${name}</strong>님, 감사합니다.<br/>
        <strong>${phone}</strong>으로 1시간 내 연락드리겠습니다.
      </p>
      <div style="background:var(--bg2);border-radius:var(--r);padding:28px;text-align:left;max-width:380px;margin:0 auto 32px;">
        <p style="font-size:0.7rem;font-weight:700;color:var(--fg3);letter-spacing:2px;margin-bottom:14px;">QUOTE SUMMARY</p>
        <p style="font-size:1rem;font-weight:700;color:var(--fg);line-height:1.7;">
          ${Q.product} · ${Q.qty.toLocaleString()}${PRODUCTS[Q.product]?.unit||''} · ${Q.side}
          ${Q.finishes.length?'<br/><span style="font-size:.85rem;font-weight:500;color:var(--fg2);">후가공: '+Q.finishes.join(', ')+'</span>':''}
        </p>
        ${total?`<p style="margin-top:16px;font-size:1.5rem;font-weight:700;color:var(--accent);letter-spacing:-0.03em;">${total.toLocaleString()}원~</p>`:''}
      </div>
      <button class="btn-hero-primary" onclick="location.reload()" style="display:inline-flex;align-items:center;justify-content:center;">새 견적 작성하기</button>
    </div>`;
});
