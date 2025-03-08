import {
  TbFish,
  TbLeaf,
  TbApple,
  TbMilk,
  TbMeat,
  TbSoup,
  TbBottle,
  TbPepper,
  TbBowl,
  TbAlertCircle,
} from "solid-icons/tb";
import { Dynamic } from "solid-js/web";
import { createSignal, onMount } from "solid-js";
import axios from "axios";
import "./StockList.css"; // Import the CSS file

export function StockList() {
  const [stockList, setStockList] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  // const updateQuantity = async (itemId, newQuantity) => {
  //   try {
  //     await axios.put(`http://localhost:5000/stock/${itemId}`, {
  //       quantity: newQuantity,
  //     });
  //     fetchStockData(); // Refresh list
  //   } catch (error) {
  //     console.error("Error updating quantity:", error);
  //     alert("Failed to update quantity");
  //   }
  // };

  // const categoryIcons = {
  //   fish: "🐟",
  //   meat: "🥩",
  //   vegetable: "🥬",
  //   fruit: "🍎",
  //   dairy: "🥛",
  //   seafood: "🦐",
  //   rice: "🍚",
  //   sauce: "🥫",
  //   spice: "🌶️",
  //   sashimi: "🍣",
  //   default: "📦",
  // };

  const categoryIcons = {
    fish: { icon: TbFish, color: "#00b4d8" },
    meat: { icon: TbMeat, color: "#ef233c" },
    vegetable: { icon: TbLeaf, color: "#70e000" },
    fruit: { icon: TbApple, color: "#ff4d6d" },
    dairy: { icon: TbMilk, color: "#ffd60a" },
    seafood: { icon: TbFish, color: "#00b4d8" },
    // rice: { icon: TbRice, color: "#f4a261" },
    sauce: { icon: TbBottle, color: "#e76f51" },
    spice: { icon: TbPepper, color: "#e63946" },
    sashimi: { icon: TbBowl, color: "#457b9d" },
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/stock/${itemId}`,
        {
          quantity: newQuantity,
        }
      );

      if (response.status === 200) {
        alert("Quantity updated successfully");
        await fetchStockData(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(
        `Failed to update quantity: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleQuantityChange = async (stock, change) => {
    try {
      const newQuantity = stock.quantity + change;
      if (newQuantity >= 0) {
        const response = await axios.put(
          `http://localhost:5000/stock/${stock._id}`,
          {
            quantity: newQuantity,
          }
        );

        if (response.data.refresh) {
          // Refresh stock list
          fetchStockData();
          // Refresh dashboard if it exists
          if (typeof window.refreshDashboard === "function") {
            window.refreshDashboard();
          }
        }

        if (response.data.warning) {
          alert(response.data.warning);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stock");
      const data = Array.isArray(response.data) ? response.data : [];
      setStockList(data);
    } catch (error) {
      console.error("Error fetching stock:", error);
      setStockList([]);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchStockData();
  });

  const isOlderThan10Days = (date) => {
    const itemDate = new Date(date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 10;
  };

  return (
    <div>
      <h1>Stock In/Out List</h1>
      {loading() ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Time</th>
              <th>Quantity</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(stockList()) &&
              stockList().map((stock) => (
                <tr
                  key={stock._id}
                  className={stock.quantity < 10 ? "low-quantity" : ""}
                >
                  <td>{stock.itemName}</td>
                  <td
                    className={
                      stock.category === "vegetable" ? "vegetable-category" : ""
                    }
                    style={{
                      color: categoryIcons[stock.category]?.color || "#000",
                    }}
                  >
                    <Dynamic component={categoryIcons[stock.category]?.icon} />
                    {stock.category}
                  </td>
                  <td>{stock.type}</td>
                  <td>{new Date(stock.time).toLocaleString()}</td>
                  <td>{stock.quantity}</td>
                  <td>
                    {stock.imageUrl ? (
                      <img
                        src={stock.imageUrl}
                        alt={stock.itemName}
                        width="50"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleQuantityChange(stock, -1)}
                      disabled={stock.quantity <= 0}
                    >
                      -
                    </button>
                    <button onClick={() => handleQuantityChange(stock, 1)}>
                      +
                    </button>
                  </td>
                  <td>
                    {isOlderThan10Days(stock.time) && (
                      <TbAlertCircle className="alert-icon" />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
