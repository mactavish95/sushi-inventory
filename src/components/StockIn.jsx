// import { createSignal } from "solid-js"; // Import the createSignal function
// import axios from "axios"; // Import the axios library

// export function StockIn() {
//     const [itemName, setItemName] = createSignal(""); // Stores the item's name
//     const [stockInTime, setStockInTime] = createSignal(""); // Stores the stock-in time
//     const [quantity, setQuantity] = createSignal(""); // Stores the quantity being stocked in
//     const [image, setImage] = createSignal(null); // Stores the image file of the item (optional for quality)
  
//     const handleImageUpload = (event) => {
//       const file = event.target.files[0]; // Gets the uploaded file
//       if (file) {
//         setImage(file); // Updates the state with the uploaded file
//       }
//     };
  
//     const handleSubmit = async () => {
//       try {
//         const formData = {
//           itemName: itemName(), // Item name
//           type: "in", // Type is always 'in' for stock in
//           time: stockInTime(), // Time the item is stocked in
//           quantity: quantity(), // Quantity of the item
//         };
  
//         await axios.post("http://localhost:5000/stock", formData); // Sends the data to the backend
//         alert("Stock In recorded successfully!");
//       } catch (error) {
//         console.error("Failed to record stock in:", error); // Handles any errors
//       }
//     };

//     const addItem = async (itemName) => {
//       try {
//           const response = await fetch('http://localhost:5000/stock', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(item),
//           });
  
//           const data = await response.json();
//           alert(data.message); // Alerts the user to double-check
//       } catch (error) {
//           console.error('Error adding item:', error);
//       }
//   };
  
  
//     return (
//       <div class="p-4">
//         <h2 class="text-lg font-bold mb-4">Stock In</h2>
//         <form onSubmit={(e) => e.preventDefault()}>
//           <label class="block mb-2">
//             Item Name:
//             <input
//               type="text"
//               value={itemName()}
//               onInput={(e) => setItemName(e.target.value)} // Updates item name
//               class="border p-2 w-full"
//             />
//           </label>
//           <label class="block mb-2">
//             Stock In Time:
//             <input
//               type="datetime-local"
//               value={stockInTime()}
//               onInput={(e) => setStockInTime(e.target.value)} // Updates stock-in time
//               class="border p-2 w-full"
//             />
//           </label>
//           <label class="block mb-2">
//             Quantity:
//             <input
//               type="number"
//               value={quantity()}
//               onInput={(e) => setQuantity(e.target.value)} // Updates quantity
//               class="border p-2 w-full"
//             />
//           </label>
//           <label class="block mb-2">
//             Upload Quality Image:
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload} // Updates image file
//               class="border p-2 w-full"
//             />
//           </label>
//           <button
//             type="submit"
//             onClick={handleSubmit} // Calls the API when submitted
//             class="bg-green-500 text-white py-2 px-4 rounded mt-4"
//           >
//             Submit Stock In
//           </button>
//         </form>
//       </div>
//     );
//   }



  

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

  const handleSubmit = async () => {
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

      const response = await axios.post("http://localhost:5000/stock", formData);
      alert(response.data.message);
      
      // Reset form
      setItemName("");
      setStockInTime("");
      setQuantity(0);
      setOperation("in");
      setCategory(""); // Reset category
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

      <div class="form-group">
        <label>Quantity:</label>
        <div class="quantity-control">
          <button 
            onClick={() => handleQuantityChange(quantity() - 1)}
            disabled={operation() === "out" && quantity() <= 0}
          >-</button>
          <input 
            type="number" 
            value={quantity()} 
            onInput={(e) => handleQuantityChange(e.target.value)}
            min="0"
          />
          <button 
            onClick={() => handleQuantityChange(quantity() + 1)}
          >+</button>
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