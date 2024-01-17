import React, { useEffect, useState } from "react";
import {
  indicatorChartCanvasSize,
  indicatorConfig,
  indicatorYAxisCanvasSize,
  offChartIndicatorSignal,
  onChartIndicatorSignal,
} from "../../signals/indicatorsSignal";
import { computed, effect } from "@preact/signals-react";
import { setCanvasSize, updateConfig } from "../../utility/chartUtils";
import IndicatorsList from "../indicators/indicatorsList";
import useIndicator from "../../hooks/useIndicator";
import { calculateRSI, drawIndicatorChart } from "../../utility/indicatorsUtil";

function DrawIndicator({
  mode,
  index,
  offChartIndicators,
  handleOnMouseMove,
  removeCursor,
  xAxisRef,
  drawChart,
}) {
  const drawIndicator = useIndicator(
    xAxisRef,
    mode,
    offChartIndicators[index]
  );
  effect(() => {
    if(drawChart.data.value){
      const data = calculateRSI(drawChart.data.peek(), offChartIndicators[index].period);
      if(data.length == drawIndicator.drawChart.data.peek().length) return;
      drawIndicator.drawChart.data.value = data;
      updateConfig(drawIndicator.drawChart);
      drawIndicatorChart(xAxisRef, mode, {...drawIndicator.drawChart});
    }
  })
  const indicatorsLength = computed(() => offChartIndicatorSignal.value.length);
  return (
    <div
      className={`flex direction-row relative flex-wrap w-[100%] ${
        indicatorsLength.value ? "h-[50%]" : "h-[100%]"
      }`}
    >
      <div className="w-[95%] h-[100%] relative">
        <canvas
          ref={(el) => (drawIndicator.drawChart.ChartRef.current[0] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={(el) => (drawIndicator.drawChart.ChartRef.current[1] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          onMouseMove={(e) => handleOnMouseMove({ e, ...drawIndicator.drawChart })}
          onMouseLeave={(e) => removeCursor(e, xAxisRef, { ...drawIndicator.drawChart })}
        ></canvas>
      </div>
      <div className="w-[5%] h-[100%] relative">
        <canvas
          ref={(el) => (drawIndicator.drawChart.yAxisRef.current[0] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={(el) => (drawIndicator.drawChart.yAxisRef.current[1] = el)}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ns-resize`}
        ></canvas>
      </div>
      <IndicatorsList mode={mode} indicators={[offChartIndicators[index]]} />
    </div>
  );
}

export default DrawIndicator;
