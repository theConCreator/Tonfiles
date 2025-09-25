const { useState, useEffect } = React;

// Товары (один файл на товар)
const products = [
  {
    id: 1,
    name: "TON Trading Guide",
    price: 5,
    description: "Полный гайд по торговле на TON.",
    file: "guide.pdf",
    image: "https://via.placeholder.com/150"
  },
  {
    id: 2,
    name: "NFT Basics",
    price: 3,
    description: "Введение в NFT на TON.",
    file: "nft.pdf",
    image: "https://via.placeholder.com/150"
  },
  {
    id: 3,
    name: "Crypto Bot Tutorial",
    price: 4,
    description: "Создание и интеграция с CryptoBot API.",
    file: "crypto_tutorial.pdf",
    image: "https://via.placeholder.com/150"
  }
];

const App = () => {
  const [tg, setTg] = useState(null);
  const [maxDisplay] = useState(3); // Ограничение количества товаров для удобства

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleBuy = (product) => {
    if (tg) {
      tg.sendData(JSON.stringify({ action: "buy", productId: product.id }));
    } else {
      alert(`Купить: ${product.name} за ${product.price} TON`);
    }
  };

  return (
    React.createElement("div", { style: { maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Roboto, sans-serif" } },
      React.createElement("header", { style: { textAlign: "center", marginBottom: 20 } },
        React.createElement("h1", null, "TONFiles Market"),
        React.createElement("p", null, "Маркетплейс мануалов и гайдов за TON")
      ),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 15, justifyContent: "center" } },
        products.slice(0, maxDisplay).map(p =>
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
              alignItems: "center"
            }
          },
            React.createElement("img", { src: p.image, alt: p.name, style: { width: 150, height: 150, objectFit: "cover", borderRadius: 8 } }),
            React.createElement("h3", null, p.name),
            React.createElement("p", null, p.description),
            React.createElement("p", null, React.createElement("strong", null, `${p.price} TON`)),
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
      )
    )
  );
};

// Рендерим
ReactDOM.render(React.createElement(App), document.getElementById("root"));
