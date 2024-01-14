import React from "react";
import { indicatorChartCanvasSize, indicatorYAxisCanvasSize, offChartIndicatorSignal, onChartIndicatorSignal } from "../../signals/indicatorsSignal";
import { computed } from "@preact/signals-react";
import { setCanvasSize } from "../../utility/chartUtils";
import IndicatorsList from "../indicators/indicatorsList";

function DrawIndicator({
  mode,
  index,
  offChartIndicators,
  handleOnMouseMove,
  removeCursor,
  indicatorsChartRef,
  xAxisRef,
  indicatorsYAxisRef,
}) {
    indicatorChartCanvasSize.value.push(setCanvasSize(indicatorsChartRef.current[2*index]));
    setCanvasSize(indicatorsChartRef.current[2*index + 1]);
    indicatorYAxisCanvasSize.value.push(setCanvasSize(indicatorsYAxisRef.current[2*index]));
    setCanvasSize(indicatorsYAxisRef.current[2*index + 1]);
  const indicatorsLength = computed(() => offChartIndicatorSignal.value.length);
  return (
    <div
      className={`flex direction-row relative flex-wrap w-[100%] ${
        indicatorsLength.value ? "h-[50%]" : "h-[100%]"
      }`}
    >
      <div className="w-[95%] h-[100%] relative">
        <canvas
          ref={el => indicatorsChartRef.current[2*index] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={el => indicatorsChartRef.current[2*index+1] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          onMouseMove={(e) => {
            handleOnMouseMove(e, indicatorsChartRef.current[2*index+1]);
          }}
          onMouseLeave={(e) => {
            removeCursor(e, indicatorsChartRef.current[2*index+1], xAxisRef.current[1], indicatorsYAxisRef.current[2*index + 1]);
          }}
        ></canvas>
      </div>
      <div className="w-[5%] h-[100%] relative">
        <canvas
          ref={el => indicatorsYAxisRef.current[2*index] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={el => indicatorsYAxisRef.current[2*index+1] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ns-resize`}
        ></canvas>
      </div>
      <IndicatorsList mode={mode} indicators={[offChartIndicators[index]]} />
    </div>
  );
}

export default DrawIndicator;
