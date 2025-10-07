// app.js — frontend logic (no persistence)
// Author: assistant-generated for TonFiles demo

/* ===== Demo state ===== */
let balance = 1000.00;
let refBalance = 0.00;
const userId = 1;
let items = [
  { id: 101001, name: "React шаблон", desc: "Адаптивный шаблон сайта", price: 15.00, img: "https://via.placeholder.com/800x500?text=React+Template", file: "react.zip", ownerId: 2, reviews: [5,4] },
  { id: 102002, name: "Python бот", desc: "Telegram бот на aiogram", price: 10.00, img: "https://via.placeholder.com/800x500?text=Python+Bot", file: "bot.zip", ownerId: 3, reviews: [5,5] },
  { id: 103003, name: "UI набор", desc: "Иконки, кнопки, элементы UI", price: 7.50, img: "https://via.placeholder.com/800x500?text=UI+Pack", file: "ui.zip", ownerId: 4, reviews: [5] },
];
// add one sample owned item
(function seedMyItem(){
  const id = Math.floor(Math.random()*900000)+100000;
  const it = { id, name: "Мой тестовый гайд", desc: "Тестовый файл автора", price: 5.50, img: "https://via.placeholder.com/800x500?text=My+Guide", file: "guide.pdf", ownerId: userId, reviews: [5] };
  items.unshift(it);
})();

let purchases = [];     // array of item ids the user bought
let myItems = items.filter(i => i.ownerId === userId);
let ratedItems = [];    // ids user already rated
let sort = 'newest';

/* ===== Helpers ===== */
const $ = id => document.getElementById(id);
const el = sel => document.querySelector(sel);
const els = sel => Array.from(document.querySelectorAll(sel));

function formatId(n){
  return '#' + String(n).padStart(6, '0');
}
function avg(arr){ return arr && arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 0; }
function showToast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1500);
}

/* ===== Rendering ===== */
function renderBalances(){
  $('balance').textContent = balance.toFixed(2);
  $('ref-balance').textContent = refBalance.toFixed(2);
}

function makeCardHTML(it){
  const owned = it.ownerId === userId;
  const bought = purchases.includes(it.id);
  const stars = avg(it.reviews).toFixed(1);
  const idLabel = formatId(it.id);
  // buttons
  let btnHtml = '';
  if(owned){
    btnHtml = `<div class="btn-row">
      <button class="btn btn-outline" onclick="openItemModal(event, ${it.id})">Мой товар</button>
      <button class="btn btn-danger" onclick="confirmDelete(event, ${it.id})">Удалить</button>
    </div>`;
  } else if(bought){
    btnHtml = `<div class="btn-row">
      <button class="btn btn-outline" onclick="openItemModal(event, ${it.id})">Приобретено</button>
      <button class="btn btn-outline" onclick="downloadFile(event, ${it.id})">Получить файл</button>
    </div>`;
  } else {
    btnHtml = `<div class="btn-row">
      <button class="btn btn-primary" onclick="openItemModal(event, ${it.id})">Купить за ${it.price.toFixed(2)}</button>
    </div>`;
  }

  return `
    <div class="card" data-id="${it.id}" role="button">
      <div class="image-wrap"><img src="${it.img}" alt="${escapeHtml(it.name)}"></div>
      <div class="card-body">
        <div class="item-id">${idLabel}</div>
        <div class="title">${escapeHtml(it.name)}</div>
        <div class="desc">${escapeHtml(it.desc)}</div>
        <div class="row-info"><div>★ ${stars} (${it.reviews.length})</div><div>${it.price.toFixed(2)} <img src="ton1.svg" class="ton-icon" alt="TON"></div></div>
        ${btnHtml}
      </div>
    </div>`;
}
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderMarket(){
  const search = $('search-input').value.trim().toLowerCase();
  const min = parseFloat($('min-price').value) || 0;
  const max = parseFloat($('max-price').value) || Infinity;

  let list = items.filter(it => {
    const text = (it.name + ' ' + it.desc).toLowerCase();
    return text.includes(search) && it.price >= min && it.price <= max;
  });

  if(sort === 'price_asc') list.sort((a,b)=>a.price-b.price);
  else if(sort === 'price_desc') list.sort((a,b)=>b.price-a.price);
  else if(sort === 'best') list.sort((a,b)=>avg(b.reviews)-avg(a.reviews));
  else if(sort === 'count') list.sort((a,b)=>b.reviews.length-a.reviews.length);
  else list.sort((a,b)=>b.id-a.id);

  const grid = $('market-grid');
  grid.innerHTML = '';
  if(list.length === 0){
    $('market-empty').style.display = 'block';
  } else {
    $('market-empty').style.display = 'none';
    grid.innerHTML = list.map(makeCardHTML).join('');
    // attach click to open modal when clicking image/area
    els('.card').forEach(node=>{
      node.addEventListener('click', (e)=>{
        const id = parseInt(node.dataset.id,10);
        openItemModal(e, id);
      });
    });
  }
}

function renderProfile(){
  // blank previous
  $('purchases-grid').innerHTML = '';
  $('myitems-grid').innerHTML = '';
  const q = $('profile-search').value.trim().toLowerCase();

  // purchases
  const pList = purchases.map(id => items.find(it => it.id === id)).filter(Boolean).filter(it => (it.name + it.desc).toLowerCase().includes(q));
  if(pList.length === 0) $('purchases-empty').style.display = 'block'; else $('purchases-empty').style.display = 'none';
  $('purchases-grid').innerHTML = pList.map(makeCardHTML).join('');

  // myitems
  const mList = myItems.filter(it => (it.name + it.desc).toLowerCase().includes(q));
  if(mList.length === 0) $('myitems-empty').style.display = 'block'; else $('myitems-empty').style.display = 'none';
  $('myitems-grid').innerHTML = mList.map(makeCardHTML).join('');
}

/* ===== Modal handling ===== */
function openItemModal(e, id){
  if(e) e.stopPropagation();
  const it = items.find(x=>x.id===id); if(!it) return;
  const owned = it.ownerId === userId;
  const bought = purchases.includes(it.id);
  const modal = $('modal');
  const content = $('modal-content');
  const actions = $('modal-actions');

  content.innerHTML = `<img src="${it.img}" alt="${escapeHtml(it.name)}">
    <div class="modal-title">${escapeHtml(it.name)}</div>
    <div class="modal-desc">${escapeHtml(it.desc)}</div>
    <div class="modal-line">★ ${avg(it.reviews).toFixed(1)} (${it.reviews.length}) &nbsp;•&nbsp; <strong>${it.price.toFixed(2)} TON</strong></div>`;

  actions.innerHTML = '';
  if(owned){
    actions.innerHTML = `<button class="btn btn-outline" disabled>Мой товар</button>
                         <button class="btn btn-danger" onclick="confirmDelete(null, ${it.id})">Удалить</button>`;
  } else if(bought){
    actions.innerHTML = `<button class="btn btn-outline" disabled>Приобретено</button>
                         <button class="btn btn-outline" onclick="downloadFile(null, ${it.id})">Получить файл</button>`;
    // rating if not yet rated
    if(!ratedItems.includes(it.id)){
      const ratingRow = document.createElement('div');
      ratingRow.style.width='100%';
      ratingRow.style.display='flex';
      ratingRow.style.justifyContent='center';
      ratingRow.style.gap='6px';
      ratingRow.style.marginTop='10px';
      for(let i=1;i<=5;i++){
        const s = document.createElement('button');
        s.className='btn btn-outline';
        s.style.padding='6px 8px';
        s.textContent = '★ ' + i;
        s.onclick = ()=> rateItem(it.id, i);
        ratingRow.appendChild(s);
      }
      actions.appendChild(ratingRow);
    }
  } else {
    actions.innerHTML = `<button class="btn btn-primary" onclick="buyFromModal(${it.id})">Купить за ${it.price.toFixed(2)} TON</button>`;
  }

  // show modal
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(){
  const modal = $('modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
$('modal-close').addEventListener('click', closeModal);
$('modal').addEventListener('click', (e)=>{ if(e.target === $('modal')) closeModal(); });

/* ===== Buy/Delete/Download/Rate logic ===== */
function buyFromModal(id){
  const it = items.find(x=>x.id===id);
  if(!it) return;
  if(balance < it.price){ showToast('Недостаточно средств'); return; }
  balance = Number((balance - it.price).toFixed(2));
  refBalance = Number((refBalance + it.price * 0.02).toFixed(2));
  purchases.push(it.id);
  showToast('Покупка успешна');
  closeModal();
  renderAll();
}

function downloadFile(e, id){
  if(e) e.stopPropagation();
  const it = items.find(x=>x.id===id); if(!it) return;
  // placeholder — backend needed for real file delivery
  showToast(`Файл "${it.file}" будет доступен после интеграции бекенда`);
}

function confirmDelete(e, id){
  if(e) e.stopPropagation();
  const it = items.find(x=>x.id===id);
  if(!it) return;
  // open modal with confirm
  const modal = $('modal');
  const content = $('modal-content');
  const actions = $('modal-actions');
  content.innerHTML = `<div class="modal-title">Удалить "${escapeHtml(it.name)}"?</div>
    <div class="modal-desc">Внимание: удаление необратимо. Все отзывы и данные будут утеряны.</div>`;
  actions.innerHTML = `<button class="btn btn-danger" onclick="deleteItem(${it.id})">Удалить навсегда</button>
                       <button class="btn btn-outline" onclick="closeModal()">Отмена</button>`;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}

function deleteItem(id){
  items = items.filter(x=>x.id!==id);
  myItems = myItems.filter(x=>x.id!==id);
  purchases = purchases.filter(pid=>pid!==id);
  ratedItems = ratedItems.filter(rid=>rid!==id);
  showToast('Товар удалён');
  closeModal();
  renderAll();
}

function rateItem(itemId, stars){
  const it = items.find(x=>x.id===itemId); if(!it) return;
  if(it.ownerId === userId){ showToast('Нельзя оценивать свой товар'); return; }
  if(!purchases.includes(itemId)){ showToast('Оценивать можно только купленные товары'); return; }
  if(ratedItems.includes(itemId)){ showToast('Вы уже оставляли отзыв'); return; }
  it.reviews.push(stars);
  ratedItems.push(itemId);
  showToast('Спасибо за отзыв!');
  closeModal();
  renderAll();
}

/* ===== Publish form handling ===== */
const MIN_PRICE = 0.1;
$('add-price').addEventListener('input', ()=>{
  const v = parseFloat($('add-price').value) || 0;
  const info = $('commission-info');
  if(v > 0 && v < MIN_PRICE){
    $('add-price').classList.add('input-error');
    info.innerHTML = `Минимальная сумма: ${MIN_PRICE.toFixed(2)} TON`;
  } else if(v > 0){
    $('add-price').classList.remove('input-error');
    info.textContent = `Вы получите: ${(v * 0.9).toFixed(2)} TON (с учётом комиссии 10%)`;
  } else {
    $('add-price').classList.remove('input-error');
    info.textContent = 'Вы получите: 0.00 TON (с учётом комиссии 10%)';
  }
});

$('add-form').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const name = $('add-name').value.trim();
  const desc = $('add-desc').value.trim();
  const price = parseFloat($('add-price').value) || 0;
  const preview = $('add-preview').files[0];
  const file = $('add-file').files[0];
  if(!name || !desc || !price || !preview || !file){
    showToast('Заполните все поля');
    return;
  }
  if(price < MIN_PRICE){
    showToast(`Минимальная цена ${MIN_PRICE.toFixed(2)} TON`);
    return;
  }
  // read preview as dataURL for demo
  const rd = new FileReader();
  rd.onload = (e)=>{
    const id = Math.floor(Math.random()*900000)+100000;
    const item = { id, name, desc, price: Number(price.toFixed(2)), img: e.target.result, file: file.name, ownerId: userId, reviews: [] };
    items.unshift(item);
    myItems.push(item);
    // clear form
    $('add-name').value=''; $('add-desc').value=''; $('add-price').value=''; $('add-preview').value=''; $('add-file').value='';
    $('commission-info').textContent = 'Вы получите: 0.00 TON (с учётом комиссии 10%)';
    showToast('Товар опубликован');
    // if currently on profile/myitems, refresh
    renderAll();
  };
  rd.readAsDataURL(preview);
});

/* ===== Search/sort controls ===== */
$('apply-btn').addEventListener('click', ()=>{ renderMarket(); });
$('search-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); renderMarket(); } });

// sort select
$('sort-btn').addEventListener('click', ()=>{
  elWrap = document.getElementById('sort-select');
  elWrap.classList.toggle('open');
});
document.querySelectorAll('#sort-select .select-options div').forEach(opt=>{
  opt.addEventListener('click', ()=>{
    sort = opt.dataset.val;
    $('sort-btn').textContent = opt.textContent;
    document.getElementById('sort-select').classList.remove('open');
    renderMarket();
  });
});

/* ===== Profile tab control ===== */
els('.profile-tabs .tab').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    els('.profile-tabs .tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    // toggle sections
    if(tab === 'purchases'){
      $('purchases').hidden = false;
      $('myitems').hidden = true;
    } else {
      $('purchases').hidden = true;
      $('myitems').hidden = false;
    }
    // update placeholder
    $('profile-search').placeholder = (tab==='purchases') ? 'Поиск покупок...' : 'Поиск моих товаров...';
    renderProfile();
  });
});

/* profile search */
$('profile-search').addEventListener('input', ()=> renderProfile());

/* bottom tabs */
els('.tab-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    els('.tab-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const page = b.dataset.page;
    els('.page').forEach(p => p.classList.remove('active'));
    $(page).classList.add('active');
    // ensure profile tab visibility synced
    renderAll();
  });
});

/* withdraw */
$('withdraw-btn').addEventListener('click', ()=>{
  if(refBalance > 0){
    balance = Number((balance + refBalance).toFixed(2));
    refBalance = 0;
    showToast('Реферальный баланс выведен');
    renderAll();
  } else {
    showToast('Недостаточно средств для вывода');
  }
});

/* utility render all */
function renderAll(){
  renderBalances();
  renderMarket();
  renderProfile();
}
renderAll();

// helper to query
function $(id){ return document.getElementById(id); }
function els(sel){ return Array.from(document.querySelectorAll(sel)); }

// close modal on esc
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });
