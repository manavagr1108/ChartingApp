import { computed, effect } from "@preact/signals-react";
import React, { useEffect } from "react";
import { offChartIndicatorSignal } from "../../signals/indicatorsSignal";
import { updateConfig } from "../../utility/chartUtils";

function DrawChart({
  handleOnMouseMove,
  removeCursor,
  drawChart,
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
          className={`w-[100%] h-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ns-resize`}
        ></canvas>
      </div>
    </div>
  );
}

export default DrawChart;
