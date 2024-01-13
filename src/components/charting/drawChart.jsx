import { computed } from "@preact/signals-react";
import React from "react";
import { offChartIndicatorSignal } from "../../signals/indicatorsSignal";

function DrawChart({
  handleOnMouseMove,
  removeCursor,
  ChartRef,
  xAxisRef,
  yAxisRef,
}) {
  const indicatorsLength = computed(() => offChartIndicatorSignal.value.length);
  return (
    <div
      className={`flex direction-row flex-wrap w-[100%] ${
        indicatorsLength.value ? "h-[50%]" : "h-[100%]"
      }`}
    >
      <div className="w-[95%] h-[100%] relative">
        <canvas
          ref={el => ChartRef.current[0] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={el => ChartRef.current[1] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          onMouseMove={(e) => {
            handleOnMouseMove(e, ChartRef.current[1]);
          }}
          onMouseLeave={(e) => {
            removeCursor(e, ChartRef.current[1], xAxisRef.current[1], yAxisRef.current[1]);
          }}
        ></canvas>
      </div>
      <div className="w-[5%] h-[100%] relative">
        <canvas
          ref={el => yAxisRef.current[0] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={el => yAxisRef.current[1] = el}
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ns-resize`}
        ></canvas>
      </div>
    </div>
  );
}

export default DrawChart;
