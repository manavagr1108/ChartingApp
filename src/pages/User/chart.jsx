import { useState } from "react";
import Charting from "../../components/charting/charting";
import NavBar from "../../components/navbar/navbar";
import StockSelect from "../../components/stockSelect/stockSelect";
import ToolBar from "../../components/toolbar/toolbar";
import useChartWindow from "../../hooks/useChartWindow";

function Chart() {
  const [mode, setMode] = useState("Light");
  function toggleMode() {
    setMode((prev) => (prev === "Light" ? "Dark" : "Light"));
  }
  const ChartWindow = useChartWindow(mode);
  return (
    <div className="app">
      <div className="grid grid-cols-[3rem_1fr] grid-rows-[3rem_1fr] h-screen">
        <StockSelect mode={mode} />
        <NavBar mode={mode} ChartWindow={ChartWindow} toggleMode={toggleMode} />
        <ToolBar mode={mode} ChartWindow={ChartWindow} />
        <Charting mode={mode} ChartWindow={ChartWindow} />
      </div>
    </div>
  );
}

export default Chart;
