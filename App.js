const { useState, useEffect } = React;

// Пример товаров
const products = [
  { id:1, name:"TON Trading Guide", price:5, category:"Trading", tags:["#Trading","#Guide"], description:"Полный гайд по торговле на TON.", file:"guide.pdf", image:"https://via.placeholder.com/150", isNew:true, popularity:150 },
  { id:2, name:"NFT Basics", price:3, category:"NFT", tags:["#NFT","#Basics"], description:"Введение в NFT на TON.", file:"nft.pdf", image:"https://via.placeholder.com/150", isNew:false, popularity:120 },
  { id:3, name:"Crypto Bot Tutorial", price:4, category:"Tutorial", tags:["#CryptoBot","#Tutorial"], description:"Создание и интеграция с CryptoBot API.", file:"crypto_tutorial.pdf", image:"https://via.placeholder.com/150", isNew:true, popularity:200 },
  { id:4, name:"Advanced NFT Strategies", price:6, category:"NFT", tags:["#NFT","#Advanced"], description:"Продвинутые стратегии работы с NFT.", file:"advanced_nft.pdf", image:"https://via.placeholder.com/150", isNew:false, popularity:80 }
];

// Тема TONFiles (тёмная)
const theme = {
  background: "#0B0F1A",
  cardBg: "#111625",
  cardShadow: "0 2px 10px rgba(0,0,0,0.5)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  buttonBg: "#00CFFF",
  buttonHover: "#009FCC",
  tag: "#00CFFF",
  inputBg: "#1A1F33",
  inputBorder: "#333A50"
};

const App = () => {
  const [tg, setTg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("default"); // default, priceAsc, priceDesc, popularity, new
  const [myPurchases, setMyPurchases] = useState([]);
  const [viewMyPurchases, setViewMyPurchases] = useState(false);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.expand();
    }
  }, []);

  let displayedProducts = products.filter(p =>
    (selectedCategory === "All" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (viewMyPurchases) {
    displayedProducts = displayedProducts.filter(p => myPurchases.includes(p.id));
  }

  switch(sortType) {
    case "priceAsc": displayedProducts.sort((a,b)=>a.price-b.price); break;
    case "priceDesc": displayedProducts.sort((a,b)=>b.price-a.price); break;
    case "popularity": displayedProducts.sort((a,b)=>b.popularity-a.popularity); break;
    case "new": displayedProducts.sort((a,b)=>b.isNew-a.isNew); break;
  }

  const handleBuy = (product, e) => {
    if (tg) {
      tg.sendData(JSON.stringify({ action:"buy", productId:product.id, price:product.price }));
    } else {
      alert(`Купить: ${product.name} за ${product.price} TON`);
    }
    if (!myPurchases.includes(product.id)) setMyPurchases([...myPurchases, product.id]);

    // Анимация карточки при покупке
    e.currentTarget.parentNode.style.transform = "scale(1.05)";
    setTimeout(()=>{ e.currentTarget.parentNode.style.transform = "scale(1)"; }, 200);
  };

  const toggleLike = (id) => setLikes(prev => ({ ...prev, [id]: prev[id] ? prev[id]+1 : 1 }));

  return (
    React.createElement("div", { style:{ maxWidth:900, margin:"auto", padding:20, fontFamily:"Roboto, sans-serif", backgroundColor:theme.background, minHeight:"100vh" } },
      React.createElement("header", { style:{ textAlign:"center", marginBottom:20, color:theme.textPrimary } },
        React.createElement("h1", null,"TONFiles Market"),
        React.createElement("p", null,"Маркетплейс мануалов и гайдов за TON")
      ),
      // Категории
      React.createElement("div", { style:{ marginBottom:15, textAlign:"center" } },
        ["All","Trading","NFT","Tutorial"].map(cat =>
          React.createElement("button", {
            key:cat,
            onClick:()=>{ setSelectedCategory(cat); setViewMyPurchases(false); },
            style:{
              margin:"0 5px",
              padding:"5px 10px",
              borderRadius:5,
              border:selectedCategory===cat ? `2px solid ${theme.buttonBg}` : `1px solid ${theme.inputBorder}`,
              background:theme.cardBg,
              color:theme.textPrimary,
              cursor:"pointer",
              transition:"0.2s"
            }
          },cat)
        ),
        React.createElement("button", { onClick:()=>setViewMyPurchases(!viewMyPurchases),
          style:{ marginLeft:10, padding:"5px 10px", borderRadius:5, border:`1px solid ${theme.inputBorder}`, background:theme.cardBg, color:theme.textPrimary, cursor:"pointer", transition:"0.2s" } },
          viewMyPurchases ? "Все товары" : "Мои покупки"
        )
      ),
      // Поиск
      React.createElement("div", { style:{ textAlign:"center", marginBottom:15 } },
        React.createElement("input", { type:"text", placeholder:"Поиск по названию...", onChange:e=>setSearch(e.target.value),
          style:{ padding:8, width:"80%", maxWidth:400, borderRadius:5, border:`1px solid ${theme.inputBorder}`, backgroundColor:theme.inputBg, color:theme.textPrimary, transition:"0.2s" }
        })
      ),
      // Сортировка
      React.createElement("div", { style:{ textAlign:"center", marginBottom:15 } },
        React.createElement("select", { onChange:e=>setSortType(e.target.value), value:sortType,
          style:{ padding:5, borderRadius:5, backgroundColor:theme.inputBg, color:theme.textPrimary, border:`1px solid ${theme.inputBorder}`, transition:"0.2s" } },
          React.createElement("option",{value:"default"},"Сортировка по умолчанию"),
          React.createElement("option",{value:"priceAsc"},"По цене ↑"),
          React.createElement("option",{value:"priceDesc"},"По цене ↓"),
          React.createElement("option",{value:"popularity"},"Популярные"),
          React.createElement("option",{value:"new"},"Новинки")
        )
      ),
      // Список товаров
      React.createElement("div", { style:{ display:"flex", flexWrap:"wrap", gap:15, justifyContent:"center" } },
        displayedProducts.map(p =>
          React.createElement("div", { key:p.id, style:{ background:theme.cardBg, borderRadius:10, padding:15, width:250, boxShadow:theme.cardShadow, display:"flex", flexDirection:"column", alignItems:"center", transition:"0.2s", cursor:"pointer" },
            onMouseEnter:e=>e.currentTarget.style.transform="scale(1.03)",
            onMouseLeave:e=>e.currentTarget.style.transform="scale(1)"
          },
            React.createElement("img",{ src:p.image, alt:p.name, style:{ width:150, height:150, objectFit:"cover", borderRadius:8, marginBottom:10 } }),
            React.createElement("h3",{ style:{ textAlign:"center", color:theme.textPrimary } },p.name),
            React.createElement("p",{ style:{ textAlign:"center", color:theme.textSecondary, fontSize:14 } },p.description),
            React.createElement("p",{ style:{ textAlign:"center", fontWeight:"bold", color:theme.textPrimary } },`${p.price} TON`),
            React.createElement("div",{ style:{ marginBottom:5 } },p.tags.map(tag =>
              React.createElement("span",{ key:tag, onClick:()=>setSearch(tag), style:{ marginRight:5, fontSize:12, color:theme.tag, cursor:"pointer" } },tag)
            )),
            React.createElement("div",{ style:{ display:"flex", justifyContent:"space-between", width:"100%" } },
              React.createElement("button",{ onClick:e=>handleBuy(p,e),
                onMouseEnter:e=>e.target.style.backgroundColor=theme.buttonHover,
                onMouseLeave:e=>e.target.style.backgroundColor=theme.buttonBg,
                style:{ padding:"8px 15px", border:"none", borderRadius:5, backgroundColor:theme.buttonBg, color:"#000", cursor:"pointer", transition:"0.2s" }
              },"Купить"),
              React.createElement("button",{ onClick:()=>toggleLike(p.id),
                style:{ padding:"8px 10px", border:"none", borderRadius:5, backgroundColor:"#333", color:"#fff", cursor:"pointer", transition:"0.2s" }
              },`❤ ${likes[p.id] || 0}`)
            )
          )
        )
      ),
      displayedProducts.length===0 && React.createElement("p",{ style:{ textAlign:"center", marginTop:20, color:theme.textSecondary } },"Товары не найдены")
    )
  );
};

// Рендер
ReactDOM.render(React.createElement(App), document.getElementById("root"));
