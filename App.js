/* app.js — логика фронтенда (demo, без бэкенда) */

/* ---------- Данные (демо) ---------- */
let balance = 1000.00;
let refBalance = 0.00;
let userId = 1; // текущий пользователь (demo)
let purchases = []; // массив id купленных
let myItems = []; // мои опубликованные (объекты)
let items = [
  { id: 101, name: "Скрипт Telegram Bot", desc: "Полностью рабочий бот", price: 15, img: "https://via.placeholder.com/600x400?text=Bot", file: "bot.zip", ownerId: 2, reviews: [5,4] },
  { id: 102, name: "Видеоурок по дизайну", desc: "Советы для UI/UX", price: 8, img: "https://via.placeholder.com/600x400?text=Design", file: "design.mp4", ownerId: 3, reviews: [5,5,4] },
  { id: 103, name: "NFT шаблон", desc: "Шаблон NFT-коллекции", price: 22, img: "https://via.placeholder.com/600x400?text=NFT", file: "nft.psd", ownerId: 4, reviews: [4,3] },
  { id: 104, name: "React сайт", desc: "Красивый адаптивный шаблон", price: 18, img: "https://via.placeholder.com/600x400?text=React", file: "site.zip", ownerId: 5, reviews: [] },
  { id: 105, name: "Python API пример", desc: "REST API шаблон", price: 12, img: "https://via.placeholder.com/600x400?text=API", file: "api.py", ownerId: 6, reviews: [5] },
];

/* Добавим тестовый предмет от пользователя */
(function seedMyItem(){
  const id = Math.floor(Math.random()*900000)+100000;
  const it = { id, name: "Мой тестовый гайд", desc: "Тестовый файл от меня", price: 5.5, img: "https://via.placeholder.com/600x400?text=My+Guide", file: "guide.pdf", ownerId: userId, reviews: [5] };
  items.unshift(it);
  myItems.push(it);
})();

/* ---------- UI helper: toast ---------- */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

/* ---------- Навигация между секциями ---------- */
function switchTab(id, btn){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

/* ---------- Профиль: подвкладки ---------- */
let currentProfileTab = 'purchases';
function switchProfileTab(id, btn){
  currentProfileTab = id;
  document.querySelectorAll('.profile-section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.profile-tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('profile-search').placeholder = id==='purchases' ? 'Поиск покупок...' : 'Поиск моих товаров...';
  render();
}

/* ---------- Комиссия и валидация цены ---------- */
const MIN_PRICE = 0.1;
function updateCommission(){
  const priceInput = document.getElementById('add-price');
  const info = document.getElementById('commission-info');
  let v = parseFloat(priceInput.value) || 0;
  if(v < MIN_PRICE && v > 0){
    priceInput.classList.add('input-error');
    info.textContent = `Минимальная сумма: ${MIN_PRICE.toFixed(2)} TON`;
  } else {
    priceInput.classList.remove('input-error');
    const after = (v * 0.9).toFixed(2);
    info.textContent = v ? `Вы получите: ${after} TON (с учётом комиссии 10%)` : 'Вы получите: 0.00 TON (с учетом комиссии 10%)';
  }
}

/* ---------- Публикация товара ---------- */
function publish(){
  const name = document.getElementById('add-name').value.trim();
  const desc = document.getElementById('add-desc').value.trim();
  const price = parseFloat(document.getElementById('add-price').value) || 0;
  const preview = document.getElementById('add-preview').files[0];
  const file = document.getElementById('add-file').files[0];

  if(!name || !desc || !price || !preview || !file){
    showToast('Заполните все поля');
    return;
  }
  if(price < MIN_PRICE){
    showToast(`Минимальная цена ${MIN_PRICE.toFixed(2)} TON`);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const id = Math.floor(Math.random() * 900000) + 100000;
    const item = { id, name, desc, price: Number(price.toFixed(2)), img: e.target.result, file: file.name, ownerId: userId, reviews: [] };
    items.unshift(item);
    myItems.push(item);
    // очистим форму
    document.getElementById('add-name').value = '';
    document.getElementById('add-desc').value = '';
    document.getElementById('add-price').value = '';
    document.getElementById('add-preview').value = '';
    document.getElementById('add-file').value = '';
    document.getElementById('commission-info').textContent = 'Вы получите: 0.00 TON (с учетом комиссии 10%)';
    showToast('Товар опубликован');
    render();
  };
  reader.readAsDataURL(preview);
}

/* ---------- Вывод с реф. баланса ---------- */
function withdrawRef(){
  if(refBalance > 0){
    balance += refBalance;
    refBalance = 0;
    showToast('Реферальный баланс выведен');
  } else {
    showToast('Недостаточно средств для вывода');
  }
  render();
}

/* ---------- Утилиты ---------- */
function calcAvg(arr){ return arr && arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 0; }

/* ---------- Рендер карточки ---------- */
function cardHTML(item){
  const owned = item.ownerId === userId;
  const bought = purchases.includes(item.id);
  const avgScore = calcAvg(item.reviews).toFixed(1);
  const idLabel = `#${String(item.id).padStart(5,'0')}`;

  let buttonsHtml = '';
  if(owned){
    buttonsHtml = `<button class="btn btn-ghost" onclick="event.stopPropagation(); openModal(${item.id})">Мой товар</button>
                   <button class="btn btn-danger" onclick="event.stopPropagation(); openDeleteModal(${item.id})">Удалить</button>`;
  } else if(bought){
    buttonsHtml = `<button class="btn btn-ghost" onclick="event.stopPropagation(); openModal(${item.id})">Приобретено</button>
                   <button class="btn btn-ghost" onclick="event.stopPropagation(); showFile(${item.id})">Получить файл</button>`;
  } else {
    buttonsHtml = `<button class="btn btn-primary" onclick="event.stopPropagation(); openModal(${item.id})">Купить за ${item.price.toFixed(2)} TON</button>`;
  }

  return `
    <div class="card" onclick="openModal(${item.id})" role="button" aria-pressed="false">
      <div class="image-wrap"><img src="${item.img}" alt="${escapeHtml(item.name)}"></div>
      <div class="card-body">
        <div class="item-id">${idLabel}</div>
        <h3 class="title">${escapeHtml(item.name)}</h3>
        <p class="desc">${escapeHtml(item.desc)}</p>
        <div class="row-info">
          <div>⭐ ${avgScore} (${item.reviews.length})</div>
          <div>${item.price.toFixed(2)} <img src="ton1.svg" style="width:12px;height:12px;vertical-align:middle"></div>
        </div>
        <div class="btn-row">${buttonsHtml}</div>
      </div>
    </div>
  `;
}

/* ---------- Открыть модал с товаром ---------- */
function openModal(id){
  const item = items.find(i=>i.id===id);
  if(!item) return;
  const owned = item.ownerId === userId;
  const bought = purchases.includes(item.id);
  const avgScore = calcAvg(item.reviews).toFixed(1);
  const container = document.getElementById('modal-card');

  let actions = '';
  if(owned){
    actions = `<button class="btn btn-ghost" disabled>Мой товар</button>
               <button class="btn btn-danger" onclick="openDeleteModal(${item.id})">Удалить</button>`;
  } else if(bought){
    actions = `<button class="btn btn-ghost" disabled>Приобретено</button>
               <button class="btn btn-ghost" onclick="showFile(${item.id})">Получить файл</button>`;
  } else {
    actions = `<button class="btn btn-primary" onclick="buyFromModal(${item.id})">Купить за ${item.price.toFixed(2)} TON</button>`;
  }

  let ratingHtml = `Рейтинг: ${avgScore} ⭐ (${item.reviews.length})`;
  if(bought && !item._ratedByUser){
    ratingHtml += '<div style="margin-top:8px">';
    for(let i=1;i<=5;i++){
      ratingHtml += `<button class="btn btn-ghost" style="margin-right:6px;" onclick="rateItem(${item.id},${i})">${i}★</button>`;
    }
    ratingHtml += '</div>';
  }

  container.innerHTML = `
    <img src="${item.img}" alt="${escapeHtml(item.name)}">
    <h2 class="modal-title">${escapeHtml(item.name)}</h2>
    <p class="modal-desc">${escapeHtml(item.desc)}</p>
    <div class="modal-line">⭐ ${avgScore} (${item.reviews.length}) &nbsp; • &nbsp; <strong>${item.price.toFixed(2)} TON</strong></div>
    <div class="modal-actions">${actions}</div>
    <div style="margin-top:10px">${ratingHtml}</div>
    <div style="margin-top:10px"><button class="btn btn-ghost" onclick="closeModal()">Закрыть</button></div>
  `;
  document.getElementById('modal').classList.add('show');
}

/* ---------- Buy from modal ---------- */
function buyFromModal(id){
  const item = items.find(i=>i.id===id);
  if(!item) return;
  if(balance < item.price){showToast("Недостаточно средств");return;}
  balance = Number((balance - item.price).toFixed(2));
  refBalance = Number((refBalance + item.price*0.02).toFixed(2));
  purchases.push(item.id);
  showToast("Покупка успешна");
  closeModal();
  render();
}

/* ---------- show file (placeholder) ---------- */
function showFile(id){
  const item = items.find(i=>i.id===id);
  if(!item) return;
  showToast(`Файл "${item.file}" будет доступен в профиле после интеграции бэкенда`);
}

/* ---------- Открыть модал подтверждения удаления ---------- */
let pendingDeleteId = null;
function openDeleteModal(id){
  pendingDeleteId = id;
  const item = items.find(i=>i.id===id);
  if(!item) return;
  const container = document.getElementById('modal-card');
  container.innerHTML = `
    <h3 class="modal-title">Подтвердите удаление</h3>
    <p class="modal-desc">Вы действительно хотите удалить товар "<strong>${escapeHtml(item.name)}</strong>"?</p>
    <p class="small-muted">Внимание: удаление необратимо. Все отзывы и рейтинг будут удалены безвозвратно.</p>
    <div style="display:flex;gap:10px;margin-top:12px">
      <button class="btn btn-danger" onclick="confirmDelete()">Удалить навсегда</button>
      <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}

/* ---------- Подтверждение удаления ---------- */
function confirmDelete(){
  if(pendingDeleteId === null){ closeModal(); return; }
  const id = pendingDeleteId;
  items = items.filter(i=>i.id !== id);
  myItems = myItems.filter(i=>i.id !== id);
  purchases = purchases.filter(pid=>pid !== id);
  pendingDeleteId = null;
  closeModal();
  showToast('Товар удалён');
  render();
}

/* ---------- Закрыть модал ---------- */
function closeModal(){ document.getElementById('modal').classList.remove('show'); pendingDeleteId=null; }

/* ---------- Рендер всего ---------- */
function render(){
  document.getElementById('balance').textContent = balance.toFixed(2);
  document.getElementById('ref-balance').textContent = refBalance.toFixed(2);

  const search = (document.getElementById('search-input').value || '').toLowerCase();
  const min = parseFloat(document.getElementById('min-price').value) || 0;
  const max = parseFloat(document.getElementById('max-price').value) || Infinity;

  const list=items.filter(i=> (i.name + ' ' + i.desc).toLowerCase().includes(search) && i.price >= min && i.price <= max);

  const grid=document.getElementById('market-grid');
  grid.innerHTML = list.map(cardHTML).join('');

  // профиль
  const q = (document.getElementById('profile-search').value || '').toLowerCase();
  if(currentProfileTab === 'purchases'){
    const pList = purchases.map(id=>items.find(it=>it.id===id)).filter(Boolean).filter(i=> (i.name + ' ' + i.desc).toLowerCase().includes(q));
    document.getElementById('purchases-grid').innerHTML = pList.map(cardHTML).join('');
    document.getElementById('purchases-empty').style.display = pList.length ? 'none' : 'block';
    document.getElementById('myitems-grid').innerHTML = '';
    document.getElementById('myitems-empty').style.display = 'none';
  } else {
    const mList = myItems.filter(Boolean).filter(i=> (i.name + ' ' + i.desc).toLowerCase().includes(q));
    document.getElementById('myitems-grid').innerHTML = mList.map(cardHTML).join('');
    document.getElementById('myitems-empty').style.display = mList.length ? 'none' : 'block';
    document.getElementById('purchases-grid').innerHTML = '';
    document.getElementById('purchases-empty').style.display = 'none';
  }
}

/* ---------- Помощник экранирования ---------- */
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------- Инициализация ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('commission-info').textContent = 'Вы получите: 0.00 TON (с учетом комиссии 10%)';
  document.getElementById('search-input').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); render(); } });
  document.getElementById('profile-search').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); render(); } });
  document.getElementById('withdraw-btn').addEventListener('click', withdrawRef);
  document.getElementById('apply-btn').addEventListener('click', render);
  render();
});
