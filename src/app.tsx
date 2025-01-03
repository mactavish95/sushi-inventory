import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

import { StockIn } from "./components/StockIn";
import { StockOut } from "./components/StockOut";
import {StockList}  from "./components/StockList";
import Dashboard from "./components/DashBoard";

function App() {
  return (
    <div class="min-h-screen p-4 bg-gray-100">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-center">Sushi Bar Inventory Management</h1>
      </header>
      <main class="container mx-auto">
        {/* Stock In Component */}
        
        <div class="mb-8 bg-white p-4 shadow rounded">
          <StockIn />
        </div>

        {/* Stock Out Component */}
        <div class="bg-white p-4 shadow rounded">
         <StockList />

        </div>

        <Dashboard />
      </main>
    </div>
  );
}

export default App;
