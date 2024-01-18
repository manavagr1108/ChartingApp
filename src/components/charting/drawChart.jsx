import { computed } from "@preact/signals-react";
import React from "react";
import { indicatorConfig } from "../../config/indicatorsConfig";

function DrawChart({ handleOnMouseMove, removeCursor, drawChart, mode }) {
  setTimeout(() => {
    drawChart.drawChartFunction(drawChart, mode);
    if (localStorage.getItem("offChartIndicators") !== null ) {
      const indicators = [];
      const {offChartIndicatorSignal} = drawChart.ChartWindow;
      const storedIndicators = JSON.parse(localStorage.getItem("offChartIndicators"));
      if(offChartIndicatorSignal.peek().length === storedIndicators.length)return;
      storedIndicators.forEach((indicator)=>{
        indicators.push(indicatorConfig[indicator.label]);
      })
      drawChart.ChartWindow.offChartIndicatorSignal.value = [...indicators];
    }
  }, 1);
  const indicatorsLength = computed(
    () => drawChart.ChartWindow.offChartIndicatorSignal.value.length
  );
  return (
    <div
      className={`flex direction-row flex-wrap w-[100%] ${
        indicatorsLength.value ? "h-[50%]" : "h-[100%]"
      }`}
    >
      <div className="w-[95%] h-[100%] relative">
        <canvas
          ref={(el) => (drawChart.ChartRef.current[0] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={(el) => (drawChart.ChartRef.current[1] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          onMouseMove={(e) => handleOnMouseMove(e, drawChart)}
          onMouseLeave={(e) => removeCursor(e, drawChart)}
        ></canvas>
      </div>
      <div className="w-[5%] h-[100%] relative">
        <canvas
          ref={(el) => (drawChart.yAxisRef.current[0] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={(el) => (drawChart.yAxisRef.current[1] = el)}
          className={`w-[100%] h-[100%] absolute top-0 left-0 z-3 cursor-ns-resize`}
        ></canvas>
      </div>
    </div>
  );
}

export default DrawChart;
