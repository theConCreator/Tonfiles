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

(function seedMyItem(){
  const id = Math.floor(Math.random()*900000)+100000;
  const it = {id,name:"Мой тестовый гайд",desc:"Тестовый файл от меня",price:5.5,img:"https://via.placeholder.com/600x400?text=My+Guide",file:"guide.pdf",ownerId:userId,reviews:[5]};
  items.unshift(it);
  myItems.push(it);
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
  const priceInput=document.getElementById('add-price');
  const info=document.getElementById('commission-info');
  let v=parseFloat(priceInput.value)||0;
  if(v<MIN_PRICE){
    priceInput.classList.add('input-error');
    info.textContent=`Минимальная сумма: ${MIN_PRICE.toFixed(2)} TON`;
  }else{
    priceInput.classList.remove('input-error');
    const after=(v*0.9).toFixed(2);
    info.textContent=`Вы получите: ${after} TON (с учётом комиссии 10%)`;
  }
}

function publish(){
  const name=document.getElementById('add-name').value.trim();
  const desc=document.getElementById('add-desc').value.trim();
  const price=parseFloat(document.getElementById('add-price').value)||0;
  const preview=document.getElementById('add-preview').files[0];
  const file=document.getElementById('add-file').files[0];

  if(!name||!desc||!price||!preview||!file){showToast('Заполните все поля');return;}
  if(price<MIN_PRICE){showToast(`Мин. цена ${MIN_PRICE.toFixed(2)} TON`);return;}

  const reader=new FileReader();
  reader.onload=e=>{
    const id=Math.floor(Math.random()*900000)+100000;
    const item={id,name,desc,price:Number(price.toFixed(2)),img:e.target.result,file:file.name,ownerId:userId,reviews:[]};
    items.unshift(item);myItems.push(item);
    document.getElementById('add-name').value='';
    document.getElementById('add-desc').value='';
    document.getElementById('add-price').value='';
    document.getElementById('add-preview').value='';
    document.getElementById('add-file').value='';
    updateCommission();
    showToast('Товар опубликован');
    render();
  };
  reader.readAsDataURL(preview);
}

function withdrawRef(){
  if(refBalance>0){balance+=refBalance;refBalance=0;showToast('Реф. баланс выведен');}
  else showToast('Недостаточно средств');
  render();
}

function calcAvg(arr){return arr&&arr.length?(arr.reduce((a,b)=>a+b,0)/arr.length):0;}

function cardHTML(item){
  const owned=item.ownerId===userId;
  const bought=purchases.includes(item.id);
  const avg=calcAvg(item.reviews).toFixed(1);
  const idLabel=`#${String(item.id).padStart(5,'0')}`;
  let buttonsHtml='';
  if(owned){
    buttonsHtml=`<button class="btn btn-ghost">Мой товар</button><button class="btn btn-danger" onclick="event.stopPropagation();openDeleteModal(${item.id})">Удалить</button>`;
  }else if(bought){
    buttonsHtml=`<button class="btn btn-ghost">Приобретено</button><button class="btn btn-ghost" onclick="event.stopPropagation();showFile(${item.id})">Файл</button>`;
  }else{
    buttonsHtml=`<button class="btn btn-primary" onclick="event.stopPropagation();openModal(${item.id})">Купить за ${item.price.toFixed(2)} <img src='ton1.svg' style='width:12px;height:12px;vertical-align:middle'></button>`;
  }
  return `<div class="card" onclick="openModal(${item.id})">
    <div class="image-wrap"><img src="${item.img}" alt=""></div>
    <div class="card-body">
      <div class="item-id">${idLabel}</div>
      <h3 class="title">${item.name}</h3>
      <p class="desc">${item.desc}</p>
      <div class="row-info"><div>⭐ ${avg} (${item.reviews.length})</div><div>${item.price.toFixed(2)} <img src='ton1.svg' style='width:12px;height:12px'></div></div>
      <div class="btn-row">${buttonsHtml}</div>
    </div>
  </div>`;
}

function openModal(id){
  const item=items.find(i=>i.id===id);if(!item)return;
  const owned=item.ownerId===userId;const bought=purchases.includes(item.id);
  const avg=calcAvg(item.reviews).toFixed(1);
  let actions='';
  if(owned)actions=`<button class='btn btn-ghost' disabled>Мой товар</button><button class='btn btn-danger' onclick='openDeleteModal(${item.id})'>Удалить</button>`;
  else if(bought)actions=`<button class='btn btn-ghost' disabled>Приобретено</button><button class='btn btn-ghost' onclick='showFile(${item.id})'>Скачать файл</button>`;
  else actions=`<button class='btn btn-primary' onclick='buyItem(${item.id})'>Купить за ${item.price.toFixed(2)} TON</button>`;
  const html=`<img src="${item.img}" alt="">
    <h3 class='modal-title'>${item.name}</h3>
    <p class='modal-desc'>${item.desc}</p>
    <div class='modal-line'>⭐ ${avg} (${item.reviews.length})</div>
    <div class='modal-actions'>${actions}</div>`;
  document.getElementById('modal-card').innerHTML=html;
  document.getElementById('modal').classList.add('show');
}

function openDeleteModal(id){
  const item=items.find(i=>i.id===id);
  if(!item)return;
  const html=`<h3 class='modal-title'>Удалить товар?</h3><p>${item.name}</p>
    <div class='modal-actions'><button class='btn btn-danger' onclick='deleteItem(${id})'>Удалить</button><button class='btn btn-ghost' onclick='closeModal()'>Отмена</button></div>`;
  document.getElementById('modal-card').innerHTML=html;
  document.getElementById('modal').classList.add('show');
}
function deleteItem(id){
  items=items.filter(i=>i.id!==id);
  myItems=myItems.filter(i=>i.id!==id);
  closeModal();showToast('Товар удалён');render();
}

function closeModal(){document.getElementById('modal').classList.remove('show');}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});

function showFile(id){
  const it=items.find(i=>i.id===id);
  if(it)showToast(`Файл: ${it.file}`);
}

function buyItem(id){
  const it=items.find(i=>i.id===id);if(!it)return;
  if(balance<it.price){showToast('Недостаточно средств');return;}
  balance-=it.price;
  const seller=myItems.find(i=>i.ownerId===it.ownerId);
  if(seller)refBalance+=(it.price*0.02);
  purchases.push(it.id);
  closeModal();showToast('Покупка успешна');render();
}

function render(){
  document.getElementById('balance').textContent=balance.toFixed(2);
  document.getElementById('ref-balance').textContent=refBalance.toFixed(2);
  const section=document.querySelector('.section.active').id;
  if(section==='home'){
    const q=document.getElementById('search-input').value.toLowerCase();
    const min=parseFloat(document.getElementById('min-price').value)||0;
    const max=parseFloat(document.getElementById('max-price').value)||Infinity;
    const filtered=items.filter(i=>(i.name.toLowerCase().includes(q)||i.desc.toLowerCase().includes(q))&&i.price>=min&&i.price<=max);
    document.getElementById('market-grid').innerHTML=filtered.map(cardHTML).join('');
  }else if(section==='profile'){
    const q=document.getElementById('profile-search').value.toLowerCase();
    const filteredPurch=purchases.map(id=>items.find(i=>i.id===id)).filter(i=>i&&i.name.toLowerCase().includes(q));
    const filteredMy=myItems.filter(i=>i.name.toLowerCase().includes(q));
    document.getElementById('purchases-grid').innerHTML=filteredPurch.map(cardHTML).join('');
    document.getElementById('purchases-empty').style.display=filteredPurch.length?'none':'block';
    document.getElementById('myitems-grid').innerHTML=filteredMy.map(cardHTML).join('');
    document.getElementById('myitems-empty').style.display=filteredMy.length?'none':'block';
  }
}

render();
