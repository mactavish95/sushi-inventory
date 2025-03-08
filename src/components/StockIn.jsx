import { createSignal } from "solid-js";
import axios from "axios";

export function StockIn() {
  const [itemName, setItemName] = createSignal("");
  const [stockInTime, setStockInTime] = createSignal("");
  const [quantity, setQuantity] = createSignal(0);
  const [operation, setOperation] = createSignal("in");
  const [category, setCategory] = createSignal(""); // New category state

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ...existing form submission code...
    try {
      if (!itemName() || !quantity() || !category()) {
        alert("Please fill all required fields");
        return;
      }

      const formData = {
        itemName: itemName(),
        type: operation(),
        time: stockInTime() || new Date().toISOString(),
        quantity: Math.abs(parseInt(quantity())),
        category: category(), // Include category in form data
      };

      const response = await axios.post(
        "sushi-backend-production.up.railway.app/stock",
        formData
      );

      alert(response.data.message);
      if (response.status === 201) {
        // Refresh the page after successful submission
        window.location.reload();
      }
      // Reset form
      // setItemName("");
      // setStockInTime("");
      // setQuantity(0);
      // setOperation("in");
      // setCategory(""); // Reset category
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Error updating stock");
    }
  };
  return (
    <div class="stock-form">
      <h2>Stock Management</h2>
      <div class="form-group">
        <label>Item Name:</label>
        <input
          type="text"
          value={itemName()}
          onInput={(e) => setItemName(e.target.value)}
        />
      </div>

      <div class="form-group">
        <label>Category:</label>
        <input
          type="text"
          value={category()}
          onInput={(e) => setCategory(e.target.value)}
        />
      </div>

      <div class="form-group">
        <label>Operation:</label>
        <select
          value={operation()}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="in">Add Stock</option>
          <option value="out">Remove Stock</option>
        </select>
      </div>

      <div
        class="fo
        const updatedInventory = [...prevInventory];m-group"
      >
        <label>Quantity:</label>
        <div class="quantity-control">
          <button
            onClick={() => handleQuantityChange(quantity() - 1)}
            disabled={operation() === "out" && quantity() <= 0}
          >
            -
          </button>
          <input
            type="number"
            value={quantity()}
            onInput={(e) => handleQuantityChange(e.target.value)}
            min="0"
          />
          <button onClick={() => handleQuantityChange(quantity() + 1)}>
            +
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Time:</label>
        <input
          type="datetime-local"
          value={stockInTime()}
          onInput={(e) => setStockInTime(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} class="btn-primary">
        {operation() === "in" ? "Add Stock" : "Remove Stock"}
      </button>
    </div>
  );
}
