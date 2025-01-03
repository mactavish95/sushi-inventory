// import { createSignal, onMount } from "solid-js";

// const Dashboard = () => {
//   const [stocks, setStocks] = createSignal([]);
//   const [oldItems, setOldItems] = createSignal([]);

//   const downloadMonthlyReport = () => {
//     window.open('http://localhost:5000/export/monthly', '_blank');
// };

//   const fetchData = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/stock"); // Corrected endpoint
//       if (!response.ok) throw new Error(`Error: ${response.status}`);
//       const data = await response.json();
//       setStocks(data);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };


//   const fetchOldItems = async () => {
//       try {
//           const response = await fetch('http://localhost:5000/stock/10days');
//           const data = await response.json();
//           setOldItems(data);
//       } catch (error) {
//           console.error('Error fetching reminders:', error);
//       }
//   };

//   onMount(() => {
//       fetchOldItems();
//   });



//   onMount(() => {
//     fetchData();
//   });

//   return (
//     <div>
//       <h1>Inventory Dashboard</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Item Name</th>
//             <th>Type</th>
//             <th>Quantity</th>
//             <th>Time</th>
//           </tr>
//         </thead>
//         <tbody>
//           <For each={stocks()}>
//             {(stock) => (
//               <tr>
//                 <td>{stock.itemName}</td>
//                 <td>{stock.type}</td>
//                 <td>{stock.quantity}</td>
//                 <td>{new Date(stock.time).toLocaleString()}</td>
//               </tr>
//             )}
//           </For>
//         </tbody>
//       </table>
//       <div>
//         <h2>Items Stored for More Than 10 Days</h2>
//         <ul>
//             <For each={oldItems()}>
//                 {(item) => (
//                     <li>
//                         {item.itemName} - {new Date(item.time).toLocaleDateString()}
//                     </li>
//                 )}
//             </For>
//         </ul>
//     </div>
//       <button onClick={downloadMonthlyReport}>Download Monthly Report</button>
//     </div>
//   );
// };

// export default Dashboard;


import { createSignal, onMount } from "solid-js";
import "./DashBoard.css";

const Dashboard = () => {
  const [stats, setStats] = createSignal({
    totalItems: 0,
    lowStock: 0,
    totalCategories: 0,
    expiredItems: 0,
  });

  const [stockTrends, setStockTrends] = createSignal([]);
  const [categories, setCategories] = createSignal([]);
  const [recentActivities, setRecentActivities] = createSignal([]);

  onMount(() => {
    // Fetch stats, trends, categories, and activities from API
    fetch("http://localhost:5000/stock/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data.stats));

    fetch("/api/stock-trends")
      .then((res) => res.json())
      .then((data) => setStockTrends(data.trends));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories));

    fetch("/api/recent-activities")
      .then((res) => res.json())
      .then((data) => setRecentActivities(data.activities));
  });

  return (
    <div class="dashboard">
      {/* Quick Stats Section */}
      <div class="quick-stats">
        <div class="stat">
          <h3>Total Items</h3>
          <p>{stats().totalItems}</p>
        </div>
        <div class="stat">
          <h3>Low Stock</h3>
          <p>{stats().lowStock}</p>
        </div>
        <div class="stat">
          <h3>Categories</h3>
          <p>{stats().totalCategories}</p>
        </div>
        <div class="stat">
          <h3>Expired</h3>
          <p>{stats().expiredItems}</p>
        </div>
      </div>

      {/* Stock Trends Section */}
      <div class="stock-trends">
        <h2>Stock Trends</h2>
        <div class="chart">
          {/* Example chart: You can use a chart library like Chart.js */}
          <p>Chart rendering here...</p>
        </div>
      </div>

      {/* Category Distribution Section */}
      <div class="category-distribution">
        <h2>Category Distribution</h2>
        <ul>
          {categories().map((category) => (
            <li>{category.name}: {category.count} items</li>
          ))}
        </ul>
      </div>

      {/* Recent Activities Section */}
      <div class="recent-activities">
        <h2>Recent Activities</h2>
        <ul>
          {recentActivities().map((activity) => (
            <li>
              <p>{activity.message}</p>
              <small>{activity.time}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
