import { createSignal, onMount } from "solid-js";
import axios from "axios";
import './StockList.css'; // Import the CSS file

export function StockList() {
  const [stockList, setStockList] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`http://localhost:5000/stock/${itemId}`, {
        quantity: newQuantity
      });
      fetchStockData(); // Refresh list
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const handleQuantityChange = async (stock, change) => {
    const newQuantity = stock.quantity + change;
    if (newQuantity >= 0) {
      await updateQuantity(stock._id, newQuantity);
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
            {Array.isArray(stockList()) && stockList().map((stock) => (
              <tr key={stock._id} className={stock.quantity < 10 ? 'low-quantity' : ''}>
                <td>{stock.itemName}</td>
                <td>{stock.category}</td>
                <td>{stock.type}</td>
                <td>{new Date(stock.time).toLocaleString()}</td>
                <td>{stock.quantity}</td>
                <td>
                  {stock.imageUrl ? (
                    <img src={stock.imageUrl} alt={stock.itemName} width="50" />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>
                  <button onClick={() => handleQuantityChange(stock, -1)} disabled={stock.quantity <= 0}>-</button>
                  <button onClick={() => handleQuantityChange(stock, 1)}>+</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}