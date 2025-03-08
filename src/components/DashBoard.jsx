import { createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
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
  const [groupedByCategory, setGroupedByCategory] = createSignal({});
  const [recentActivities, setRecentActivities] = createSignal([]);

  const fetchData = async () => {
    try {
      const resStats = await fetch(
        "http://localhost:5000/stock/dashboard-stats"
      );
      const dataStats = await resStats.json();
      setStats(dataStats.stats);

      const resTrends = await fetch("http://localhost:5000/stock/stock-trends");
      const dataTrends = await resTrends.json();
      setStockTrends(dataTrends.trends);

      const resCategories = await fetch("http://localhost:5000/stock");
      const dataCategories = await resCategories.json();
      setCategories(dataCategories);

      const resActivities = await fetch(
        "http://localhost:5000/stock/recent-activities"
      );
      const dataActivities = await resActivities.json();
      setRecentActivities(dataActivities.activities);

      // Group items by category
      const grouped = dataCategories.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});
      setGroupedByCategory(grouped);

      // Render category distribution chart for each category after data is fetched
      Object.keys(grouped).forEach((category, index) => {
        const ctx = document
          .getElementById(`categoryChart${index}`)
          .getContext("2d");
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: grouped[category].map((item) => item.itemName),
            datasets: [
              {
                label: "Item Distribution",
                data: grouped[category].map((item) => item.quantity),
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                ],
                borderColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                ],
                borderWidth: 1,
              },
            ],
          },
          plugins: [ChartDataLabels],
          options: {
            plugins: {
              datalabels: {
                formatter: (value, context) => {
                  const total = context.chart.data.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(2) + "%";
                  return percentage;
                },
                color: "#fff",
                font: {
                  weight: "bold",
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  onMount(() => {
    fetchData();
    window.refreshDashboard = fetchData;
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
        {Object.keys(groupedByCategory()).map((category, index) => (
          <div key={index}>
            <h3>{category}</h3>
            <canvas id={`categoryChart${index}`}></canvas>
          </div>
        ))}
      </div>

      {/* Recent Activities Section */}
      <div class="recent-activities">
        <h2>Recent Activities</h2>
        <ul>
          {recentActivities().map((activity) => (
            <li key={activity._id}>{activity.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
