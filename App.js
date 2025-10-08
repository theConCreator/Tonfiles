let balance = 1000.00;
let refBalance = 0.00;
let userId = 1;
let purchases = [];
let myItems = [];

let items = [
  {id:101,name:"Скрипт Telegram Bot",desc:"Полностью рабочий бот",price:15,img:"https://via.placeholder.com/600x400?text=Bot",file:"bot.zip",ownerId:2,reviews:[5,4]},
  {id:102,name:"Видеоурок по дизайну",desc:"Советы для UI/UX",price:8,img:"https://via.placeholder.com/600x400?text=Design",file:"design.mp4",ownerId:3,reviews:[5,5,4]},
  {id:103,name:"NFT шаблон",desc:"Шаблон NFT-коллекции",price:22,img:"https://via.placeholder.com/600x400?text=NFT",file:"nft.psd",ownerId:4,reviews:[4,3]},
  {id:104,name:"React сайт",desc:"Красивый адаптивный шаблон",price:18,img:"https://via.placeholder.com/600x400?text=React",file:"site.zip",ownerId:5,reviews:[]},
  {id:105,name:"Python API пример",desc:"REST API шаблон",price:12,img:"https://via.placeholder.com/600x400?text=API",file:"api.py",ownerId:6,reviews:[5]}
];

// Для теста добавляем один свой товар
(function(){
  const id=Math.floor(Math.random()*900000)+100000;
  const it={id,name:"Мой тестовый гайд",desc:"Тестовый файл от меня",price:5.5,img:"https://via.placeholder.com/600x400?text=My+Guide",file:"guide.pdf",ownerId:userId,reviews:[5]};
  items.unshift(it);myItems.push(it);
})();

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

function switchTab(id,btn){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

let currentProfileTab='purchases';
function switchProfileTab(id,btn){
  currentProfileTab=id;
  document.querySelectorAll('.profile-section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.profile-tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('profile-search').placeholder=id==='purchases'?'Поиск покупок...':'Поиск моих товаров...';
  render();
}

const MIN_PRICE=0.1;

function updateCommission(){
  const p=document.getElementById('add-price');
  const info=document.getElementById('commission-info');
  let v=parseFloat(p.value)||0;
  if(v<MIN_PRICE){
    p.classList.add('input-error');
    info.innerHTML=`Минимальная сумма: ${MIN_PRICE.toFixed(2)} <img src="ton1.svg" style="width:12px;height:12px;vertical-align:middle">`;
  }else{
    p.classList.remove('input-error');
    const after=(v*0.9).toFixed(2);
    info.textContent=`Вы получите: ${after} TON (с учетом комиссии 10%)`;
  }
}

function publish(){
  const name=document.getElementById('add-name').value.trim();
  const desc=document.getElementById('add-desc').value.trim();
  const price=parseFloat(document.getElementById('add-price').value)||0;
  const preview=document.getElementById('add-preview').files[0];
  const file=document.getElementById('add-file').files[0];

  if(!name||!desc||!price||!preview||!file){showToast('Заполните все поля');return;}
  if(price<MIN_PRICE){showToast(`Минимальная цена ${MIN_PRICE.toFixed(2)} TON`);return;}

  const r=new FileReader();
  r.onload=e=>{
    const id=Math.floor(Math.random()*900000)+100000;
    const item={id,name,desc,price:Number(price.toFixed(2)),img:e.target.result,file:file.name,ownerId:userId,reviews:[]};
    items.unshift(item);myItems.push(item);

    document.getElementById('add-name').value='';
    document.getElementById('add-desc').value='';
    document.getElementById('add-price').value='';
    document.getElementById('add-preview').value='';
    document.getElementById('add-file').value='';
    document.getElementById('commission-info').textContent='Вы получите: 0.00 TON (с учетом комиссии 10%)';
    showToast('Товар опубликован');
    render();
  };
  r.readAsDataURL(preview);
}

function withdrawRef(){
  if(refBalance>0){
    balance+=refBalance;
    refBalance=0;
    showToast('Реферальный баланс выведен');
  } else showToast('Недостаточно средств для вывода');
  render();
}

function calcAvg(a){return a&&a.length?(a.reduce((x,y)=>x+y,0)/a.length):0;}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

function cardHTML(i){
  const owned=i.ownerId===userId;
  const bought=purchases.includes(i.id);
  const avg=calcAvg(i.reviews).toFixed(1);
  const idLabel=`#${String(i.id).padStart(5,'0')}`;
  let buttons='';

  if(owned){
    buttons=`<button class='btn btn-ghost' onclick='event.stopPropagation();'>Мой товар</button>
             <button class='btn btn-danger' onclick='event.stopPropagation();openDeleteModal(${i.id})'>Удалить</button>`;
  }else if(bought){
    buttons=`<button class='btn btn-ghost' onclick='event.stopPropagation();'>Приобретено</button>
             <button class='btn btn-ghost' onclick='event.stopPropagation();showFile(${i.id})'>Получить файл</button>`;
  }else{
    buttons=`<button class='btn btn-primary' onclick='event.stopPropagation();openModal(${i.id})'>
              Купить за ${i.price.toFixed(2)} <img src="ton1.svg" style="width:12px;height:12px;vertical-align:middle">
             </button>`;
  }

  return `<div class='card' onclick='openModal(${i.id})'>
    <div class='image-wrap'><img src='${i.img}' alt='${escapeHtml(i.name)}'></div>
    <div class='card-body'>
      <div class='item-id'>${idLabel}</div>
      <h3 class='title'>${escapeHtml(i.name)}</h3>
      <p class='desc'>${escapeHtml(i.desc)}</p>
      <div class='row-info'>
        <div>⭐ ${avg} (${i.reviews.length})</div>
        <div>${i.price.toFixed(2)} <img src="ton1.svg" style="width:12px;height:12px;vertical-align:middle"></div>
      </div>
      <div class='btn-row'>${buttons}</div>
    </div>
  </div>`;
}

function render(){
  document.getElementById('balance').textContent=balance.toFixed(2);
  document.getElementById('ref-balance').textContent=refBalance.toFixed(2);

  // Главная
  const grid=document.getElementById('market-grid');
  const q=document.getElementById('search-input').value.toLowerCase();
  const min=parseFloat(document.getElementById('min-price').value)||0;
  const max=parseFloat(document.getElementById('max-price').value)||999999;
  grid.innerHTML=items
    .filter(i=>(!q||i.name.toLowerCase().includes(q)||i.desc.toLowerCase().includes(q)) && i.price>=min && i.price<=max)
    .map(cardHTML).join('')||'<p class="small-muted">Ничего не найдено</p>';

  // Профиль
  const search=document.getElementById('profile-search').value.toLowerCase();

  const purGrid=document.getElementById('purchases-grid');
  const purItems=items.filter(i=>purchases.includes(i.id)&&(i.name.toLowerCase().includes(search)||i.desc.toLowerCase().includes(search)));
  purGrid.innerHTML=purItems.map(cardHTML).join('');
  document.getElementById('purchases-empty').style.display=purItems.length?'none':'block';

  const myGrid=document.getElementById('myitems-grid');
  const myList=myItems.filter(i=>i.name.toLowerCase().includes(search)||i.desc.toLowerCase().includes(search));
  myGrid.innerHTML=myList.map(cardHTML).join('');
  document.getElementById('myitems-empty').style.display=myList.length?'none':'block';
}

function openModal(id){
  const i=items.find(x=>x.id===id);
  if(!i)return;
  const m=document.getElementById('modal');
  const card=document.getElementById('modal-card');
  const avg=calcAvg(i.reviews).toFixed(1);
  const owned=i.ownerId===userId;
  const bought=purchases.includes(i.id);

  let actions='';
  if(owned){
    actions=`<button class='btn btn-ghost'>Мой товар</button>
             <button class='btn btn-danger' onclick='openDeleteModal(${i.id})'>Удалить</button>`;
  }else if(bought){
    actions=`<button class='btn btn-ghost'>Приобретено</button>
             <button class='btn btn-ghost' onclick='showFile(${i.id})'>Получить файл</button>`;
  }else{
    actions=`<button class='btn btn-primary' onclick='buyItem(${i.id})'>Купить за ${i.price.toFixed(2)} TON</button>`;
  }

  card.innerHTML=`
    <img src="${i.img}" alt="">
    <h2 class="modal-title">${escapeHtml(i.name)}</h2>
    <p class="modal-desc">${escapeHtml(i.desc)}</p>
    <div class="modal-line">⭐ ${avg} (${i.reviews.length})</div>
    <div class="modal-line">${i.price.toFixed(2)} TON</div>
    <div class="modal-actions">${actions}</div>
    <button class='btn btn-ghost' style='width:100%;margin-top:8px' onclick='closeModal()'>Закрыть</button>
  `;
  m.classList.add('show');
}

function openDeleteModal(id){
  const m=document.getElementById('modal');
  const card=document.getElementById('modal-card');
  card.innerHTML=`<p>Удалить товар #${id}?</p>
    <div class='modal-actions'>
      <button class='btn btn-danger' onclick='deleteItem(${id})'>Удалить</button>
      <button class='btn btn-ghost' onclick='closeModal()'>Отмена</button>
    </div>`;
  m.classList.add('show');
}

function closeModal(){document.getElementById('modal').classList.remove('show');}

function deleteItem(id){
  items=items.filter(i=>i.id!==id);
  myItems=myItems.filter(i=>i.id!==id);
  closeModal();showToast('Товар удалён');render();
}

function showFile(id){
  const i=items.find(x=>x.id===id);
  if(i)showToast(`Файл: ${i.file}`);
}

function buyItem(id){
  const i=items.find(x=>x.id===id);
  if(!i)return;
  if(balance<i.price){showToast('Недостаточно средств');return;}
  if(i.ownerId===userId){showToast('Нельзя купить свой товар');return;}
  balance-=i.price;
  const refReward=i.price*0.02; // пример 2% реферальный
  refBalance+=refReward;
  purchases.push(i.id);
  closeModal();
  showToast('Покупка успешна');
  render();
}

document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
render();
