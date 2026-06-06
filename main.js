// ===== HEADER SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

// ===== PRODUCT FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

// ===== FADE-UP =====
const fadeEls = document.querySelectorAll('.service-card, .step, .product-card, .pricing-card, .why-item, .review-card');
fadeEls.forEach(el => el.classList.add('fade-up'));
new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 }).observe(...fadeEls.length ? [fadeEls[0]] : [document.body]);
// observe all
const fadeObs = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
fadeEls.forEach(el => fadeObs.observe(el));

// ===== TOAST =====
function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3800);
}


// ===================================================
// QUOTE FORM
// ===================================================

const PRODUCTS = {
  '명함':      { sizes: ['표준 90×52mm', '미니 85×49mm', '유럽형 85×55mm', '정사각 55×55mm'],
                 papers: ['아트지 250g', '스노우지 300g', '고급무광지 350g', '크라프트지 250g'],
                 unit: '장', baseQty: 100, basePrices: { 50:7900,100:9900,200:15000,300:20000,500:30000 } },
  '전단지':    { sizes: ['A6 (105×148mm)', 'A5 (148×210mm)', 'A4 (210×297mm)', '3단접지 A4'],
                 papers: ['아트지 100g', '아트지 150g', '스노우지 120g', '무광아트지 150g'],
                 unit: '장', baseQty: 100, basePrices: { 100:15000,200:22000,500:38000,1000:55000 } },
  '포스터':    { sizes: ['A4 (210×297mm)', 'B4 (257×364mm)', 'A3 (297×420mm)', 'A2 (420×594mm)', 'B2 (515×728mm)'],
                 papers: ['아트지 150g', '아트지 200g', '무광아트지 180g', '포토용지'],
                 unit: '장', baseQty: 1, basePrices: { 1:2500,10:18000,50:65000,100:110000 } },
  '스티커':    { sizes: ['명함형 90×52mm', 'A6 낱장', 'A5 낱장', 'A4 낱장', '원형 50mm', '커스텀 칼선'],
                 papers: ['광택지', '무광지', '투명지', '크라프트지', '방수 필름'],
                 unit: '매', baseQty: 50, basePrices: { 50:5000,100:8000,300:18000,500:26000,1000:42000 } },
  '책자':      { sizes: ['A6 (105×148mm)', 'A5 (148×210mm)', 'A4 (210×297mm)'],
                 papers: ['표지: 아트지 250g / 내지: 아트지 100g', '표지: 스노우지 300g / 내지: 미색모조 80g',
                          '표지: 무광아트지 250g / 내지: 중질지 75g'],
                 unit: '권', baseQty: 10, basePrices: { 10:35000,30:80000,50:120000,100:200000 } },
  '에코백':    { sizes: ['M (35×40cm)', 'L (38×42cm)', 'XL (40×45cm)', '파우치형'],
                 papers: ['면 10호', '면 7호 (두꺼움)', '부직포 90g', '캔버스'],
                 unit: '개', baseQty: 10, basePrices: { 1:5500,10:45000,30:110000,50:170000,100:300000 } },
  '패키지박스': { sizes: ['소형 (100×100×80mm)', '중형 (200×150×100mm)', '대형 (300×200×150mm)', '맞춤 사이즈'],
                 papers: ['아트지 (외부 인쇄)', '크라프트지', '고급 에코보드', '맞춤 소재'],
                 unit: '개', baseQty: 50, basePrices: { 50:55000,100:95000,300:240000,500:370000 } },
  '현수막':    { sizes: ['소형 90×60cm', '표준 200×60cm', '대형 300×90cm', '맞춤 사이즈'],
                 papers: ['타포린 (방수)', '메시 (통풍)', '패브릭 (고급)'],
                 unit: '장', baseQty: 1, basePrices: { 1:12000,3:30000,5:46000,10:85000 } },
  '기타':      { sizes: ['직접 입력'], papers: ['상담 후 결정'], unit: '개', baseQty: 1, basePrices: { 1:0 } },
};

const FINISH_PRICES = { '유광코팅':2000,'무광코팅':3000,'금박':18000,'은박':15000,'에폭시':12000,'형압/엠보':10000,'타공':5000 };

let quoteState = {
  product: null, size: '', paper: '', side: '단면',
  qty: 100, finishes: [], deadline: '', name: '', phone: '', email: '', file: '있음', note: ''
};

function calcPrice() {
  const p = PRODUCTS[quoteState.product];
  if (!p) return null;
  const prices = p.basePrices;
  const keys = Object.keys(prices).map(Number).sort((a,b)=>a-b);
  const qty = quoteState.qty;
  let base = prices[keys[0]];
  for (const k of keys) { if (qty >= k) base = prices[k]; }
  // scale for quantities between breakpoints
  const lastKey = keys[keys.length-1];
  if (qty > lastKey) {
    const perUnit = prices[lastKey] / lastKey;
    base = Math.round(perUnit * qty * 0.92); // bulk discount
  } else {
    // interpolate
    for (let i = 0; i < keys.length - 1; i++) {
      if (qty > keys[i] && qty < keys[i+1]) {
        const ratio = (qty - keys[i]) / (keys[i+1] - keys[i]);
        base = Math.round(prices[keys[i]] + ratio * (prices[keys[i+1]] - prices[keys[i]]));
        break;
      }
    }
  }
  if (quoteState.side === '양면') base = Math.round(base * 1.6);
  const extraFinish = quoteState.finishes.reduce((s, f) => s + (FINISH_PRICES[f] || 0), 0);
  const total = base + extraFinish;
  return total;
}

function updateSummary() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.querySelector('.qs-val').textContent = val || '—'; };
  set('qsProduct', quoteState.product);
  set('qsSize', quoteState.size);
  set('qsPaper', quoteState.paper);
  set('qsSide', quoteState.side);
  const p = quoteState.product ? PRODUCTS[quoteState.product] : null;
  set('qsQty', quoteState.qty ? `${quoteState.qty.toLocaleString()}${p ? p.unit : ''}` : '—');
  set('qsFinish', quoteState.finishes.length ? quoteState.finishes.join(', ') : '없음');
  set('qsDeadline', quoteState.deadline || '—');

  const priceEl = document.getElementById('qsPriceAmount');
  if (!priceEl) return;
  const total = calcPrice();
  if (total === null || total === 0) {
    priceEl.textContent = '상담 필요';
  } else {
    priceEl.textContent = total.toLocaleString() + '원~';
    priceEl.classList.remove('updated');
    void priceEl.offsetWidth;
    priceEl.classList.add('updated');
    setTimeout(() => priceEl.classList.remove('updated'), 450);
  }
}

function setStep(step) {
  document.querySelectorAll('.q-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('qPanel' + step)?.classList.add('active');
  document.querySelectorAll('.q-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === step) el.classList.add('active');
    if (s < step) el.classList.add('done');
  });
  document.querySelectorAll('.q-step__line').forEach((line, i) => {
    line.classList.toggle('done', i < step - 1);
  });
}

function populateSelects(product) {
  const p = PRODUCTS[product];
  if (!p) return;
  const sizeEl = document.getElementById('qSize');
  const paperEl = document.getElementById('qPaper');
  sizeEl.innerHTML = '<option value="">선택해 주세요</option>' + p.sizes.map(s => `<option>${s}</option>`).join('');
  paperEl.innerHTML = '<option value="">선택해 주세요</option>' + p.papers.map(s => `<option>${s}</option>`).join('');
  document.getElementById('qQtyUnit').textContent = p.unit;
  document.getElementById('qQty').value = p.baseQty;
  quoteState.qty = p.baseQty;
  quoteState.size = '';
  quoteState.paper = '';
}

// Step 1
document.querySelectorAll('input[name="qProduct"]').forEach(radio => {
  radio.addEventListener('change', () => {
    quoteState.product = radio.value;
    document.getElementById('qNext1').disabled = false;
    populateSelects(radio.value);
    updateSummary();
  });
});
document.getElementById('qNext1').addEventListener('click', () => setStep(2));

// Step 2 — size
document.getElementById('qSize').addEventListener('change', e => {
  quoteState.size = e.target.value;
  updateSummary();
});
document.getElementById('qPaper').addEventListener('change', e => {
  quoteState.paper = e.target.value;
  updateSummary();
});
document.querySelectorAll('input[name="qSide"]').forEach(r => {
  r.addEventListener('change', () => { quoteState.side = r.value; updateSummary(); });
});

// Qty
const qtyInput = document.getElementById('qQty');
function setQty(val) {
  const v = Math.max(1, Math.min(100000, parseInt(val) || 1));
  qtyInput.value = v;
  quoteState.qty = v;
  updateSummary();
}
document.getElementById('qQtyMinus').addEventListener('click', () => {
  const steps = [1,5,10,30,50,100,200,300,500,1000,2000,3000,5000,10000];
  const cur = parseInt(qtyInput.value) || 1;
  const prev = steps.filter(s => s < cur).pop() || 1;
  setQty(prev);
});
document.getElementById('qQtyPlus').addEventListener('click', () => {
  const steps = [1,5,10,30,50,100,200,300,500,1000,2000,3000,5000,10000];
  const cur = parseInt(qtyInput.value) || 1;
  const next = steps.find(s => s > cur) || cur + 1000;
  setQty(next);
});
qtyInput.addEventListener('input', () => setQty(qtyInput.value));

// Finish checkboxes
document.querySelectorAll('#qFinishGroup input').forEach(cb => {
  cb.addEventListener('change', () => {
    quoteState.finishes = [...document.querySelectorAll('#qFinishGroup input:checked')].map(c => c.value);
    updateSummary();
  });
});

document.getElementById('qDeadline').addEventListener('change', e => {
  quoteState.deadline = e.target.value;
  updateSummary();
});

document.getElementById('qPrev2').addEventListener('click', () => setStep(1));
document.getElementById('qNext2').addEventListener('click', () => setStep(3));

// Step 3
document.getElementById('qPrev3').addEventListener('click', () => setStep(2));

document.querySelectorAll('input[name="qFile"]').forEach(r => {
  r.addEventListener('change', () => { quoteState.file = r.value; });
});

document.getElementById('qSubmit').addEventListener('click', () => {
  const name = document.getElementById('qName').value.trim();
  const phone = document.getElementById('qPhone').value.trim();
  if (!name || !phone) { showToast('⚠️ 이름과 연락처는 필수 입력 항목입니다.'); return; }
  if (!quoteState.product) { showToast('⚠️ 제품을 선택해 주세요.'); return; }

  quoteState.name = name;
  quoteState.phone = phone;
  quoteState.email = document.getElementById('qEmail').value;
  quoteState.note = document.getElementById('qNote').value;

  // Show success state
  const formWrap = document.querySelector('.quote__form-wrap');
  formWrap.innerHTML = `
    <div style="text-align:center;padding:60px 20px;">
      <div style="font-size:4rem;margin-bottom:24px;">✅</div>
      <h3 style="font-size:1.5rem;font-weight:900;color:var(--dark);margin-bottom:12px;">견적서가 접수되었습니다!</h3>
      <p style="color:var(--gray-700);line-height:1.8;margin-bottom:32px;">
        <strong>${name}</strong>님, 감사합니다.<br/>
        담당자가 <strong>${phone}</strong>으로 빠르게 연락드리겠습니다.<br/>
        평균 응대 시간: <strong>1시간 이내</strong> (영업시간 기준)
      </p>
      <div style="background:var(--gray-100);border-radius:12px;padding:24px;text-align:left;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto;">
        <p style="font-size:0.8rem;color:var(--gray-400);font-weight:700;margin-bottom:12px;">접수 내용 요약</p>
        <p style="font-size:0.95rem;font-weight:600;color:var(--dark);">
          ${quoteState.product} · ${quoteState.qty}${PRODUCTS[quoteState.product]?.unit || '개'} · ${quoteState.side}
          ${quoteState.finishes.length ? '<br/><span style="color:var(--gray-700);">후가공: ' + quoteState.finishes.join(', ') + '</span>' : ''}
        </p>
        ${calcPrice() ? `<p style="margin-top:12px;font-size:1.2rem;font-weight:900;color:var(--primary);">예상 견적: ${calcPrice().toLocaleString()}원~</p>` : ''}
      </div>
      <button class="btn btn--primary" onclick="location.reload()">새 견적 작성하기</button>
    </div>`;
});
