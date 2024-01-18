import { useState } from "react";
import "./App.css";
import Charting from "./components/charting/charting";
import NavBar from "./components/nav_bar/nav_bar";
import StockSelect from "./components/stock_select/stock_select";
import ToolBar from "./components/tool_bar/tool_bar";
import useChartWindow from "./hooks/useChartWindow";

function App() {
  const [mode, setMode] = useState("Light");
  function toggleMode() {
    setMode((prev) => (prev === "Light" ? "Dark" : "Light"));
  }
  const ChartWindow = useChartWindow(mode);
  return (
    <div className="app">
      <div className="grid grid-cols-[3rem_1fr] grid-rows-[3rem_1fr] h-screen">
        <StockSelect mode={mode} />
        <NavBar
          mode={mode}
          ChartWindow={ChartWindow}
          toggleMode={toggleMode}
        />
        <ToolBar mode={mode} />
        <Charting
          mode={mode}
          ChartWindow={ChartWindow}
        />
      </div>
    </div>
  );
}

export default App;