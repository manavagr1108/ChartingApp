import React, { useEffect } from "react";
import { computed } from "@preact/signals-react";
import IndicatorsList from "../indicators/indicatorsList";
import useDrawChart from "../../hooks/useDrawChart";
import PaneSeparator from "../paneSeparator/paneSeparator";
import { canvasSizeConfig } from "./drawChart";

function DrawIndicator({
  mode,
  index,
  offChartIndicators,
  handleOnMouseMove,
  removeCursor,
  ChartWindow,
}) {
  const drawChart = useDrawChart(
    ChartWindow,
    true,
    mode,
    offChartIndicators[index]
  );
  useEffect(() => {
    if (drawChart.ChartRef.current.length === 2) {
      let temp = 0;
      ChartWindow.drawChartObjects.peek().forEach(obj => {
          if(obj.ChartRef.current[0] === drawChart.ChartRef.current[0]){
            temp = 1;
          }
      });
      if(temp === 0){
        ChartWindow.drawChartObjects.value = [
          ...ChartWindow.drawChartObjects.peek(),
          drawChart,
        ];
        drawChart.setDrawChartSignal(drawChart.data.peek());
        drawChart.drawChartFunction(drawChart, mode);
      }
    }
  });
  const { ChartRef, yAxisRef } = drawChart;
  const indicatorsLength = computed(
    () =>
      canvasSizeConfig[
        drawChart.ChartWindow.offChartIndicatorSignal.value.length + 1
      ]
  );
  return (
    <>
      <PaneSeparator mode={mode} ChartWindow={ChartWindow} index={index} />
      <div
        className={`flex direction-row relative flex-wrap w-[100%]`}
        style={{ height: indicatorsLength.peek() }}
      >
        <div className="w-[95%] h-[100%] relative">
          <canvas
            ref={(el) => (ChartRef.current[0] = el)}
            className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={(el) => (ChartRef.current[1] = el)}
            className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
            onMouseMove={(e) => handleOnMouseMove(e, drawChart)}
            onMouseLeave={(e) => removeCursor(e, drawChart)}
          ></canvas>
        </div>
        <div className="w-[5%] h-[100%] relative">
          <canvas
            ref={(el) => (yAxisRef.current[0] = el)}
            className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={(el) => (yAxisRef.current[1] = el)}
            className={`w-[100%] h-[100%] absolute top-0 left-0 z-3 cursor-ns-resize`}
          ></canvas>
        </div>
        <IndicatorsList
          mode={mode}
          indicators={[offChartIndicators[index]]}
          ChartWindow={ChartWindow}
        />
      </div>
    </>
  );
}

export default DrawIndicator;
