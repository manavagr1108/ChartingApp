import { useState } from "react";
import "./App.css";
import Charting from "./components/charting/charting";
import SearchBar from "./components/search_bar/search_bar";
import StockSelect from "./components/stock_select/stock_select";
import ToolBar from "./components/tool_bar/tool_bar";
import { selectedStock, interval, stockData } from "./signals/stockSignals";

function App() {
  const [mode, setMode] = useState("Light");
  function toggleMode() {
    setMode((prev) => (prev === "Light" ? "Dark" : "Light"));
  }
  return (
    <div className="app">
      <div className="grid grid-cols-[3rem_1fr] grid-rows-[3rem_1fr] h-screen">
        <StockSelect mode={mode} />
        <SearchBar
          selectedStock={selectedStock}
          interval={interval}
          mode={mode}
          toggleMode={toggleMode}
        />
        <ToolBar mode={mode} />
        <Charting
          selectedStock={selectedStock}
          interval={interval}
          stockData={stockData}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default App;
