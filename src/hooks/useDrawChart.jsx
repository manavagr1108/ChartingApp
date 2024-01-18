import { effect, signal } from "@preact/signals-react";
import { useEffect, useRef } from "react";
import {
  chartMouseDown,
  chartMouseMove,
  chartMouseUp,
  drawChart,
  handleScroll,
  setCanvasSize,
  updateConfig,
  updateCursorValue,
} from "../utility/chartUtils";
import {
  yAxisMouseDown,
  yAxisMouseMove,
  yAxisMouseUp,
} from "../utility/yAxisUtils";
import { chartType } from "../signals/stockSignals";
import { onChartIndicatorSignal } from "../signals/indicatorsSignal";
import { drawIndicatorChart } from "../utility/indicatorsUtil";
import DrawChart from "../classes/DrawChart";
import { useCanavsSplitRef } from "./useChartWindow";
import useIndicator from "./useIndicator";

// const handleResize = ({
//   chartCanvasSize,
//   yAxisCanvasSize,
//   ChartRef,
//   yAxisRef,
// }) => {
//   chartCanvasSize.value = setCanvasSize(ChartRef.current[0]);
//   setCanvasSize(ChartRef.current[1]);
//   yAxisCanvasSize.value = setCanvasSize(yAxisRef.current[0]);
//   setCanvasSize(yAxisRef.current[1]);
// };

const useDrawChart = (ChartWindow, isIndicator, mode, indicator) => {
  const state = new DrawChart(ChartWindow);
  state.ChartRef = useCanavsSplitRef();
  state.yAxisRef = useCanavsSplitRef();
  if(isIndicator){
    state.isIndicator.value = true;
    const [indicatorObj, data] = useIndicator(indicator, state, mode);
    state.data.value = data;
    state.Indicator.value = indicatorObj;
    state.drawChartFunction = indicator.drawChartFunction;
  }
  // adding event listeners to the ref and window
  useEffect(() => {
    window.addEventListener("resize", state.setCanvasSize());
    state.ChartRef.current[1].addEventListener("mousedown", (e) =>
      chartMouseDown( e, state)
    );
    window.addEventListener("mousemove", (e) =>
      chartMouseMove(e, state)
    );
    window.addEventListener("mouseup", (e) => chartMouseUp(e, state));
    state.yAxisRef.current[1].addEventListener("mousedown", (e) =>
      yAxisMouseDown(e, state)
    );
    window.addEventListener("mousemove", (e) =>
      yAxisMouseMove(e, state)
    );
    window.addEventListener("mouseup", (e) => yAxisMouseUp(e, state));
    state.ChartRef.current[0].addEventListener(
      "wheel",
      (e) => handleScroll(e, state),
      false
    );
    state.ChartRef.current[1].addEventListener(
      "wheel",
      (e) => handleScroll(e, state),
      false
    );
    return () => {
      window.removeEventListener("resize", state.setCanvasSize());
      // state.ChartRef.current[1].removeEventListener("mousedown", (e) =>
      //   chartMouseDown({ e, ...state })
      // );
      window.removeEventListener("mousemove", (e) =>
        chartMouseMove(e, state)
      );
      window.removeEventListener("mouseup", (e) =>
        chartMouseUp(e, state)
      );
      // state.ChartRef.current[1].removeEventListener("mousedown", (e) =>
      //   yAxisMouseDown({ e, ...state })
      // );
      window.removeEventListener("mousemove", (e) =>
        yAxisMouseMove(e, state)
      );
      window.removeEventListener("mouseup", (e) =>
        yAxisMouseUp(e, state)
      );
      // state.ChartRef.current[0].removeEventListener(
      //   "wheel",
      //   (e) => handleScroll({ e, ...state }),
      //   false
      // );
      // state.ChartRef.current[1].removeEventListener(
      //   "wheel",
      //   (e) => handleScroll({ e, ...state }),
      //   false
      // );
    };
  });
  // draw chart
  effect(() => {
    if (
      state.ChartWindow.timeRange.value.endTime.Date !== 0 &&
      state.ChartWindow.timeRange.value.startTime.Date !== 0 &&
      state.ChartWindow.chartType.value && 
      state.ChartWindow.onChartIndicatorSignal.value
    ) {
      if (
        state.ChartRef.current[0] !== null &&
        state.ChartRef.current[0] !== null &&
        state.ChartWindow.xAxisRef.current[0] !== null &&
        state.yAxisRange.value.minPrice > 0
      ) {
          // drawChart(state, mode);
          state.drawChartFunction(state, mode);
      }
    }
  });
  effect(() => {
    if (
      state.ChartWindow.dateCursor.value !== null &&
      state.ChartWindow.dateCursor.peek().x !== null &&
      state.ChartWindow.dateCursor.peek().y !== null &&
      state.ChartRef.current[1] !== undefined &&
      state.ChartWindow.xAxisRef.current[1] !== undefined &&
      state.ChartRef.current[1] !== undefined
    ) {
      updateCursorValue(state, mode);
    }
  });
  return state;
};

export default useDrawChart;
