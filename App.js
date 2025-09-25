const { useState, useEffect } = React;

// Список товаров
const products = [
  {
    id: 1,
    name: "TON Trading Guide",
    price: 5,
    category: "Trading",
    tags: ["#Trading", "#Guide"],
    description: "Полный гайд по торговле на TON.",
    file: "guide.pdf",
    image: "https://via.placeholder.com/150",
    isNew: true
  },
  {
    id: 2,
    name: "NFT Basics",
    price: 3,
    category: "NFT",
    tags: ["#NFT", "#Basics"],
    description: "Введение в NFT на TON.",
    file: "nft.pdf",
    image: "https://via.placeholder.com/150",
    isNew: false
  },
  {
    id: 3,
    name: "Crypto Bot Tutorial",
    price: 4,
    category: "Tutorial",
    tags: ["#CryptoBot", "#Tutorial"],
    description: "Создание и интеграция с CryptoBot API.",
    file: "crypto_tutorial.pdf",
    image: "https://via.placeholder.com/150",
    isNew: true
  },
  {
    id: 4,
    name: "Advanced NFT Strategies",
    price: 6,
    category: "NFT",
    tags: ["#NFT", "#Advanced"],
    description: "Продвинутые стратегии работы с NFT.",
    file: "advanced_nft.pdf",
    image: "https://via.placeholder.com/150",
    isNew: false
  }
];

const App = () => {
  const [tg, setTg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("default"); // default, priceAsc, priceDesc
  const [myPurchases, setMyPurchases] = useState([]);
  const [viewMyPurchases, setViewMyPurchases] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Фильтрация и сортировка
  let displayedProducts = products.filter(p =>
    (selectedCategory === "All" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortType === "priceAsc") displayedProducts.sort((a,b)=>a.price-b.price);
  else if (sortType === "priceDesc") displayedProducts.sort((a,b)=>b.price-a.price);

  if (viewMyPurchases) {
    displayedProducts = displayedProducts.filter(p => myPurchases.includes(p.id));
  }

  const handleBuy = (product) => {
    if (tg) {
      tg.sendData(JSON.stringify({ action: "buy", productId: product.id }));
    } else {
      alert(`Купить: ${product.name} за ${product.price} TON`);
    }
    // Для MVP: сохраняем в локальный массив myPurchases
    if (!myPurchases.includes(product.id)) setMyPurchases([...myPurchases, product.id]);
  };

  return (
    React.createElement("div", { style: { maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Roboto, sans-serif" } },
      React.createElement("header", { style: { textAlign: "center", marginBottom: 20 } },
        React.createElement("h1", null, "TONFiles Market"),
        React.createElement("p", null, "Маркетплейс мануалов и гайдов за TON")
      ),
      // Категории
      React.createElement("div", { style: { marginBottom: 15, textAlign: "center" } },
        ["All", "Trading", "NFT", "Tutorial"].map(cat =>
          React.createElement("button", {
            key: cat,
            onClick: () => { setSelectedCategory(cat); setViewMyPurchases(false); },
            style: {
              margin: "0 5px",
              padding: "5px 10px",
              borderRadius: 5,
              border: selectedCategory===cat ? "2px solid #0066ff" : "1px solid #ccc",
              background: "white",
              cursor: "pointer"
            }
          }, cat)
        ),
        // Мои покупки
        React.createElement("button", {
          onClick: () => setViewMyPurchases(!viewMyPurchases),
          style: { marginLeft: 10, padding: "5px 10px", borderRadius: 5, border: "1px solid #ccc", cursor: "pointer" }
        }, viewMyPurchases ? "Все товары" : "Мои покупки")
      ),
      // Поиск
      React.createElement("div", { style: { textAlign: "center", marginBottom: 15 } },
        React.createElement("input", {
          type: "text",
          placeholder: "Поиск по названию...",
          onChange: e => setSearch(e.target.value),
          style: { padding: 5, width: "80%", maxWidth: 400, borderRadius: 5, border: "1px solid #ccc" }
        })
      ),
      // Сортировка
      React.createElement("div", { style: { textAlign: "center", marginBottom: 15 } },
        React.createElement("select", { onChange: e => setSortType(e.target.value), value: sortType, style: { padding: 5, borderRadius: 5 } },
          React.createElement("option", { value: "default" }, "Сортировка по умолчанию"),
          React.createElement("option", { value: "priceAsc" }, "По цене ↑"),
          React.createElement("option", { value: "priceDesc" }, "По цене ↓")
        )
      ),
      // Список товаров
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 15, justifyContent: "center" } },
        displayedProducts.map(p =>
          React.createElement("div", {
            key: p.id,
            style: {
              background: "white",
              borderRadius: 10,
              padding: 15,
              width: 250,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "0.2s",
              cursor: "pointer"
            }
          },
            p.isNew && React.createElement("span", { style: { color: "white", backgroundColor: "#ff0000", padding: "2px 5px", borderRadius: 3, position: "absolute", marginTop: "-100px" } }, "NEW"),
            React.createElement("img", { src: p.image, alt: p.name, style: { width: 150, height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 10 } }),
            React.createElement("h3", { style: { textAlign: "center" } }, p.name),
            React.createElement("p", { style: { textAlign: "center" } }, p.description),
            React.createElement("p", { style: { textAlign: "center", fontWeight: "bold" } }, `${p.price} TON`),
            React.createElement("div", { style: { marginBottom: 5 } }, p.tags.map(tag => React.createElement("span", {
              key: tag,
              style: { marginRight: 5, fontSize: 12, color: "#0066ff" }
            }, tag))),
            React.createElement("button", {
              onClick: () => handleBuy(p),
              style: {
                marginTop: 10,
                padding: "8px 15px",
                border: "none",
                borderRadius: 5,
                backgroundColor: "#0066ff",
                color: "white",
                cursor: "pointer"
              }
            }, "Купить")
          )
        )
      ),
      // Инструкция если нет товаров
      displayedProducts.length === 0 && React.createElement("p", { style: { textAlign: "center", marginTop: 20 } }, "Товары не найдены")
    )
  );
};

// Рендер
ReactDOM.render(React.createElement(App), document.getElementById("root"));
