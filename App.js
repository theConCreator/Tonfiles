// App.js (весь фронтенд в одном файле)
// Требует React и ReactDOM подключённые через CDN (как в index.html)

const { useState, useEffect } = React;

/* ----------------------------
   ДАННЫЕ: товары (без публичных ссылок на файлы)
   поле fileId — идентификатор файла на бэкенде/в бот-системе
   previewAvailable — есть ли превью (pdf/img) для предпросмотра
   vipOnly — доступно только по VIP-подписке
-----------------------------*/
const products = [
  { id:1, name:"TON Trading Guide", price:5, category:"Trading", tags:["Trading","Guide"], description:"Гайд по торговле на TON — стратегии и примеры.", fileId:"file_001", previewAvailable:true, previewType:"pdf", previewUrl:"https://file-examples-com.github.io/uploads/2017/10/file-sample_150kB.pdf", vipOnly:false, rating:{sum:45,count:10}, popularity:150 },
  { id:2, name:"NFT Basics", price:3, category:"NFT", tags:["NFT","Basics"], description:"Короткое понятное руководство по NFT в TON.", fileId:"file_002", previewAvailable:true, previewType:"img", previewUrl:"https://via.placeholder.com/800x1000.png?text=NFT+Preview", vipOnly:false, rating:{sum:22,count:6}, popularity:120 },
  { id:3, name:"Crypto Bot Tutorial", price:4, category:"Tutorial", tags:["CryptoBot","Tutorial"], description:"Интеграция с CryptoBot и пример бота.", fileId:"file_003", previewAvailable:false, previewType:null, previewUrl:null, vipOnly:false, rating:{sum:80,count:20}, popularity:200 },
  { id:4, name:"VIP: Advanced NFT Pack", price:8, category:"VIP", tags:["VIP","NFT"], description:"Набор продвинутых материалов (только для VIP).", fileId:"file_004", previewAvailable:false, previewType:null, previewUrl:null, vipOnly:true, rating:{sum:0,count:0}, popularity:10 }
];

/* ----------------------------
   Тема (тёмная, фирменный TON-голубой)
-----------------------------*/
const theme = {
  background: "#071022",
  surface: "#0F1724",
  card: "#111827",
  textPrimary: "#E6EEF8",
  textSecondary: "#9AA6B2",
  accent: "#00CFFF",
  accentDark: "#009FCC",
  danger: "#FF4D4D",
  inputBg: "#0B1220",
  border: "#1E2A38"
};

/* ----------------------------
   Утилиты
-----------------------------*/
function currencyFormat(x){ return `${x} TON`; }
function avgRating(r){ return r.count? (r.sum / r.count).toFixed(1) : "—"; }

/* ----------------------------
   Компонент: Modal (встроенный)
-----------------------------*/
function Modal({open, onClose, children}) {
  if(!open) return null;
  return React.createElement("div", {
    style: {
      position:"fixed", left:0, top:0, right:0, bottom:0,
      backgroundColor:"rgba(2,6,23,0.7)", display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:9999, padding:20
    }
  },
    React.createElement("div", {
      style: { width:"100%", maxWidth:900, maxHeight:"90vh", background:theme.surface, borderRadius:12, overflow:"auto", boxShadow:"0 8px 30px rgba(0,0,0,0.6)", border:`1px solid ${theme.border}` }
    },
      React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:12, borderBottom:`1px solid ${theme.border}` } },
        React.createElement("div", { style:{ color:theme.textPrimary, fontWeight:700 } }, "Preview"),
        React.createElement("button", { onClick:onClose, style:{ background:"transparent", border:"none", color:theme.textSecondary, fontSize:18, cursor:"pointer", padding:8 } }, "✕")
      ),
      React.createElement("div", { style:{ padding:12 } }, children)
    )
  );
}

/* ----------------------------
   Main App
-----------------------------*/
function App(){
  const [tg, setTg] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [favorites, setFavorites] = useState([]);
  const [purchases, setPurchases] = useState([]); // array of fileId
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [vipActive, setVipActive] = useState(false); // имитация VIP
  const [reviews, setReviews] = useState({}); // { productId: [{rating, text, date, id}] }
  const [notif, setNotif] = useState(null);

  useEffect(()=>{
    if(window.Telegram && window.Telegram.WebApp){
      setTg(window.Telegram.WebApp);
      try{ window.Telegram.WebApp.expand(); }catch(e){}
    }
    // load local state
    const fav = localStorage.getItem("tf_fav");
    const pur = localStorage.getItem("tf_pur");
    const vip = localStorage.getItem("tf_vip");
    const rev = localStorage.getItem("tf_reviews");
    if(fav) setFavorites(JSON.parse(fav));
    if(pur) setPurchases(JSON.parse(pur));
    if(vip) setVipActive(JSON.parse(vip));
    if(rev) setReviews(JSON.parse(rev));
  },[]);

  useEffect(()=> localStorage.setItem("tf_fav", JSON.stringify(favorites)), [favorites]);
  useEffect(()=> localStorage.setItem("tf_pur", JSON.stringify(purchases)), [purchases]);
  useEffect(()=> localStorage.setItem("tf_vip", JSON.stringify(vipActive)), [vipActive]);
  useEffect(()=> localStorage.setItem("tf_reviews", JSON.stringify(reviews)), [reviews]);

  // фильтрация
  let list = products.filter(p=>{
    if(showFavorites && !favorites.includes(p.id)) return false;
    if(category!=="All" && p.category!==category) return false;
    if(search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.tags.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // сортировка
  if(sort==="priceAsc") list.sort((a,b)=>a.price-b.price);
  else if(sort==="priceDesc") list.sort((a,b)=>b.price-a.price);
  else if(sort==="pop") list.sort((a,b)=>b.popularity - a.popularity);
  else if(sort==="new") list.sort((a,b)=> (b.id - a.id));

  /* ----- UI handlers ----- */
  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    flash("Добавлено в избранное");
  };

  const openPreview = (product) => {
    if(product.previewAvailable){
      setPreviewProduct(product);
      setShowPreview(true);
    } else {
      // preview недоступен — подсказка
      flash("Предпросмотр этого файла недоступен. Покупка даёт доступ.");
    }
  };

  const buyProduct = (product) => {
    // VIP check
    if(product.vipOnly && !vipActive){
      flash("Этот товар доступен только по VIP-подписке. Купите VIP для доступа.");
      return;
    }

    // Отправка в бота/инвойс — здесь имитация: tg.sendData, если есть
    if(tg){
      try{ tg.sendData(JSON.stringify({ action:"buy", productId:product.id })); }
      catch(e){ console.warn("tg sendData failed", e); }
    } else {
      // локальная имитация оплаты
      flash(`Покупка: ${product.name} — имитация оплаты`);
    }

    // сохраняем покупку (fileId)
    if(!purchases.includes(product.fileId)){
      setPurchases([...purchases, product.fileId]);
      flash("Покупка завершена — файл доступен в разделе «Мои покупки»");
    } else {
      flash("Вы уже приобрели этот файл — доступ в «Мои покупки»");
    }
  };

  const buyVIP = () => {
    if(tg) try{ tg.sendData(JSON.stringify({ action:"buy_vip" })); }catch(e){}
    setVipActive(true);
    flash("VIP активирован (имитация). Теперь VIP-товары доступны.");
  };

  const flash = (text, t=2400) => {
    setNotif(text);
    setTimeout(()=>setNotif(null), t);
  };

  const addReview = (productId, rating, text) => {
    setReviews(prev=>{
      const arr = prev[productId] ? [...prev[productId]] : [];
      arr.unshift({ id: Date.now(), rating, text, date: new Date().toISOString() });
      return { ...prev, [productId]: arr };
    });
    // увеличим агрегатный рейтинг в local products arr (for display)
    const prod = products.find(p=>p.id===productId);
    if(prod){ prod.rating.sum += rating; prod.rating.count += 1; }
    flash("Спасибо за отзыв!");
  };

  const downloadPurchased = (fileId) => {
    // Здесь реальный бекенд/бот должен выдавать файл. Пока — имитация:
    flash(`Скачивание (имитация) файла ${fileId}`);
    // В реализации: fetch('/download?fileId=...') или бот отправляет файл.
  };

  /* ---- UI render ---- */
  return React.createElement("div", { style:{ minHeight:"100vh", background:theme.background, color:theme.textPrimary, padding:18, fontFamily:"Inter, Roboto, sans-serif" } },
    // header
    React.createElement("div", { style:{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 } },
      React.createElement("div", null,
        React.createElement("h1", { style:{ margin:0, fontSize:22 } }, "TONFiles Market"),
        React.createElement("div", { style:{ color:theme.textSecondary, fontSize:13 } }, "Манyалы, гайды и файлы за TON")
      ),
      React.createElement("div", { style:{ display:"flex", gap:8, alignItems:"center" } },
        React.createElement("div", { style:{ position:"relative" } },
          React.createElement("input", {
            placeholder:"Поиск по названию или тегам...",
            value:search, onChange:e=>setSearch(e.target.value),
            style:{ padding:"10px 12px", borderRadius:10, border:`1px solid ${theme.border}`, background:theme.inputBg, color:theme.textPrimary, width:320, outline:"none" }
          })
        ),
        React.createElement("button", { onClick:()=>setShowFavorites(!showFavorites), style:{ padding:"10px 12px", borderRadius:10, background: showFavorites ? theme.accentDark : theme.card, border:`1px solid ${theme.border}`, color: theme.textPrimary, cursor:"pointer" } }, showFavorites ? "Показать все" : "Избранные"),
        React.createElement("button", { onClick:()=>flash("Подписка VIP: покупка откроет VIP-материалы"), style:{ padding:"10px 12px", borderRadius:10, background: theme.card, border:`1px solid ${theme.border}`, color: theme.textPrimary, cursor:"pointer" } }, "Как купить VIP")
      )
    ),

    // controls row
    React.createElement("div", { style:{ maxWidth:1100, margin:"18px auto 8px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" } },
      React.createElement("div", null,
        React.createElement("select", { value:category, onChange:e=>setCategory(e.target.value), style:{ padding:8, borderRadius:8, background:theme.inputBg, border:`1px solid ${theme.border}`, color:theme.textPrimary } },
          ["All","Trading","NFT","Tutorial","VIP"].map(c=>React.createElement("option",{key:c,value:c},c))
        )
      ),
      React.createElement("div", null,
        React.createElement("select", { value:sort, onChange:e=>setSort(e.target.value), style:{ padding:8, borderRadius:8, background:theme.inputBg, border:`1px solid ${theme.border}`, color:theme.textPrimary } },
          React.createElement("option",{value:"default"},"Сортировка: по умолчанию"),
          React.createElement("option",{value:"priceAsc"},"По цене ↑"),
          React.createElement("option",{value:"priceDesc"},"По цене ↓"),
          React.createElement("option",{value:"pop"},"По популярности"),
          React.createElement("option",{value:"new"},"По новизне")
        )
      ),
      React.createElement("div", { style:{ marginLeft:"auto", display:"flex", gap:8 } },
        React.createElement("button", { onClick:()=>setShowPreview(false) /* placeholder */ , style:{ padding:"8px 12px", borderRadius:8, background:theme.accent, border:"none", color:"#00202A", cursor:"pointer" } }, "Поддержка"),
        React.createElement("button", { onClick:()=>{ setVipActive(v=>!v); flash(vipActive ? "VIP отключён (имитация)" : "VIP включён (имитация)") }, style:{ padding:"8px 12px", borderRadius:8, background: vipActive ? theme.accentDark : theme.card, border:`1px solid ${theme.border}`, color:theme.textPrimary, cursor:"pointer" } }, vipActive ? "VIP: Вкл" : "Включить VIP")
      )
    ),

    // grid
    React.createElement("div", { style:{ maxWidth:1100, margin:"12px auto", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 } },
      list.map(p=>{
        const isFav = favorites.includes(p.id);
        const bought = purchases.includes(p.fileId);
        const productReviews = reviews[p.id] || [];
        return React.createElement("div", {
          key:p.id,
          style:{
            background:theme.card, padding:14, borderRadius:12, border:`1px solid ${theme.border}`, boxShadow:"0 6px 18px rgba(2,8,23,0.6)",
            transition:"transform 0.18s ease, box-shadow 0.18s ease", cursor:"default", position:"relative"
          }
        },
          // image + preview button
          React.createElement("div", { style:{ display:"flex", justifyContent:"center", marginBottom:10, position:"relative" } },
            React.createElement("img", { src:p.previewAvailable && p.previewType==="img" ? p.previewUrl : p.image, alt:p.name, style:{ width:160, height:160, objectFit:"cover", borderRadius:8, border:`1px solid ${theme.border}` } }),
            React.createElement("button", {
              onClick:()=>openPreview(p),
              style:{ position:"absolute", right:8, bottom:8, padding:"6px 8px", borderRadius:8, background:theme.accent, border:"none", color:"#00202A", cursor:"pointer" }
            }, "Preview")
          ),

          React.createElement("h3", { style:{ margin:"6px 0 4px", fontSize:16, color:theme.textPrimary } }, p.name),
          React.createElement("div", { style:{ display:"flex", gap:8, alignItems:"center", marginBottom:8 } },
            React.createElement("div", { style:{ color:theme.textSecondary, fontSize:13 } }, p.category),
            React.createElement("div", { style:{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" } },
              React.createElement("div", { title:"Рейтинг", style:{ color:theme.textSecondary, fontSize:13 } }, `⭐ ${avgRating(p.rating)} (${p.rating.count||0})`),
              React.createElement("div", { title:"Популярность", style:{ color:theme.textSecondary, fontSize:13 } }, `👁 ${p.popularity}`)
            )
          ),

          React.createElement("p", { style:{ color:theme.textSecondary, fontSize:13, minHeight:38 } }, p.description),

          // tags
          React.createElement("div", { style:{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 } }, p.tags.map(t=>
            React.createElement("button", { key:t, onClick:()=>setSearch(t.replace("#","")), style:{ background:theme.inputBg, color:theme.accent, border:`1px solid ${theme.border}`, padding:"6px 8px", borderRadius:8, cursor:"pointer", fontSize:12 } }, t)
          )),

          // actions row
          React.createElement("div", { style:{ display:"flex", gap:8, alignItems:"center" } },
            React.createElement("button", {
              onClick:()=>buyProduct(p),
              style:{ flex:1, padding:"10px 12px", borderRadius:10, border:"none", background: theme.accent, color:"#00202A", fontWeight:700, cursor:"pointer", boxShadow:"0 6px 18px rgba(0,204,255,0.07)" }
            }, bought ? "Скачать" : `Купить • ${currencyFormat(p.price)}`),

            React.createElement("button", {
              onClick:()=>toggleFavorite(p.id),
              style:{ padding:"8px 10px", borderRadius:10, border:`1px solid ${theme.border}`, background: isFav ? theme.accentDark : theme.card, color:isFav? "#00202A": theme.textPrimary, cursor:"pointer" }
            }, isFav ? "★" : "☆")
          ),

          // reviews snippet
          React.createElement("div", { style:{ marginTop:10, borderTop:`1px dashed ${theme.border}`, paddingTop:10 } },
            React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 } },
              React.createElement("div", { style:{ color:theme.textSecondary, fontSize:13 } }, `${(reviews[p.id]||[]).length} отзывов`),
              React.createElement("button", {
                onClick:()=> {
                  const r = prompt("Оставьте отзыв (1-5) и текст через запятую: пример — 5,Отличный гайд");
                  if(!r) return;
                  const [ratingStr, ...rest] = r.split(",");
                  const rating = Math.max(1, Math.min(5, parseInt(ratingStr||"5")));
                  const text = rest.join(",").trim();
                  addReviewLocal(p.id, rating, text);
                },
                style:{ padding:"6px 8px", fontSize:13, borderRadius:8, background:theme.inputBg, color:theme.textPrimary, border:`1px solid ${theme.border}`, cursor:"pointer" }
              }, "Оставить отзыв")
            ),
            (reviews[p.id]||[]).slice(0,2).map(rv =>
              React.createElement("div", { key:rv.id, style:{ marginBottom:6, color:theme.textSecondary, fontSize:13 } },
                React.createElement("strong", { style:{ color:theme.textPrimary, marginRight:6 } }, `⭐${rv.rating}`),
                rv.text ? React.createElement("span", null, rv.text) : React.createElement("em", { style:{ color:theme.textSecondary } }, "Без текста")
              )
            )
          )
        );
      })
    ),

    // My purchases & favorites quick access
    React.createElement("div", { style:{ maxWidth:1100, margin:"18px auto", display:"flex", gap:12, flexWrap:"wrap" } },
      React.createElement("div", { style:{ flex:1, background:theme.card, padding:12, borderRadius:10, border:`1px solid ${theme.border}` } },
        React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 } },
          React.createElement("strong", null, "Мои покупки"),
          React.createElement("button", { onClick:()=>{ if(purchases.length===0) flash("Покупок нет"); else purchases.forEach(fid=>downloadPurchased(fid)); }, style:{ padding:"6px 8px", borderRadius:8, background:theme.inputBg, color:theme.textPrimary, border:`1px solid ${theme.border}` } }, "Скачать всё")
        ),
        purchases.length===0 ? React.createElement("div", { style:{ color:theme.textSecondary } }, "У вас ещё нет покупок") : purchases.map(fid =>
          React.createElement("div", { key:fid, style:{ padding:"8px 6px", borderBottom:`1px dashed ${theme.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" } },
            React.createElement("span", null, fid),
            React.createElement("div", null,
              React.createElement("button", { onClick:()=>downloadPurchased(fid), style:{ padding:"6px 8px", borderRadius:8, background:theme.accent, color:"#00202A", border:"none", cursor:"pointer" } }, "Скачать")
            )
          )
        )
      ),

      React.createElement("div", { style:{ width:260, background:theme.card, padding:12, borderRadius:10, border:`1px solid ${theme.border}` } },
        React.createElement("strong", null, "Избранное"),
        favorites.length===0 ? React.createElement("div", { style:{ color:theme.textSecondary, marginTop:8 } }, "Пусто — добавьте товары в избранное") : favorites.map(fid=>{
          const p = products.find(pp=>pp.id===fid);
          return React.createElement("div", { key:fid, style:{ padding:"8px 6px", borderBottom:`1px dashed ${theme.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" } },
            React.createElement("span", null, p ? p.name : fid),
            React.createElement("button", { onClick:()=>setFavorites(favorites.filter(x=>x!==fid)), style:{ padding:"6px 8px", borderRadius:8, background:theme.inputBg, color:theme.textPrimary, border:`1px solid ${theme.border}` } }, "Убрать")
          );
        })
      )
    ),

    // Preview modal
    React.createElement(Modal, { open: showPreview, onClose: ()=>{ setShowPreview(false); setPreviewProduct(null); } },
      previewProduct ? React.createElement("div", null,
        React.createElement("h3", { style:{ color:theme.textPrimary } }, previewProduct.name),
        previewProduct.previewType==="pdf" ? React.createElement("iframe", { src: previewProduct.previewUrl, style:{ width:"100%", height: "70vh", border:"none", borderRadius:8 } }) :
        previewProduct.previewType==="img" ? React.createElement("img", { src:previewProduct.previewUrl, style:{ width:"100%", maxHeight:"70vh", objectFit:"contain", borderRadius:8 } }) :
        React.createElement("div", { style:{ color:theme.textSecondary } }, "Превью недоступно")
      ) : React.createElement("div", { style:{ color:theme.textSecondary } }, "Нет превью")
    ),

    // notification
    notif && React.createElement("div", { style:{ position:"fixed", right:18, bottom:18, background:theme.accent, color:"#00202A", padding:"10px 14px", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.5)" } }, notif)
  );

  /* local helper defined below to avoid hoisting issues */
  function addReviewLocal(productId, rating, text){
    setReviews(prev=>{
      const arr = prev[productId] ? [...prev[productId]] : [];
      arr.unshift({ id:Date.now(), rating, text, date:new Date().toISOString() });
      return { ...prev, [productId]: arr };
    });
    flash("Отзыв добавлен");
  }
}

/* ----------------------------
   Render
-----------------------------*/
ReactDOM.render(React.createElement(App), document.getElementById("root"));
