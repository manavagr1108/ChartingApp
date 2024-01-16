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
import { chartType, stockData } from "../signals/stockSignals";
import { onChartIndicatorSignal } from "../signals/indicatorsSignal";

const initialState = {
  timeRange: signal({
    startTime: {
      Year: 0,
      Month: 0,
      Date: 0,
      Hrs: 0,
      Min: 0,
      Sec: 0,
    },
    endTime: {
      Year: 0,
      Month: 0,
      Date: 0,
      Hrs: 0,
      Min: 0,
      Sec: 0,
    },
    scrollOffset: 0,
    scrollDirection: 0,
    zoomOffset: 0,
    zoomDirection: 0,
  }),
  chartCanvasSize: signal({
    width: 0,
    height: 0,
  }),
  xAxisCanvasSize: signal({
    width: 0,
    height: 0,
  }),
  yAxisCanvasSize: signal({
    width: 0,
    height: 0,
  }),
  priceRange: signal({
    minPrice: 0,
    maxPrice: 0,
  }),
  xAxisConfig: signal({
    noOfDataPoints: 0,
    widthOfOneCS: 0,
  }),
  dateConfig: signal({
    dateToIndex: {},
    indexToDate: {},
  }),
  yAxisConfig: signal({
    colDiff: 2,
    priceDiff: 0,
    segmentTree: [],
  }),

  dateCursor: signal(null),

  xAxisMovement: signal({
    mouseDown: false,
    mouseMove: false,
    prevXCoord: 0,
  }),

  yAxisMovement: signal({
    mouseDown: false,
    mouseMove: false,
    prevXCoord: 0,
  }),

  chartMovement: signal({
    mouseDown: false,
    mouseMove: false,
    prevXCoord: 0,
    prevYCoord: 0,
  }),

  lockUpdatePriceRange: signal(false),

  stockData: signal([]),
};

const handleResize = ({
  chartCanvasSize,
  yAxisCanvasSize,
  ChartRef,
  yAxisRef,
}) => {
  chartCanvasSize.value = setCanvasSize(ChartRef.current[0]);
  setCanvasSize(ChartRef.current[1]);
  yAxisCanvasSize.value = setCanvasSize(yAxisRef.current[0]);
  setCanvasSize(yAxisRef.current[1]);
};

const useDrawChart = (xAxisRef, mode, stockDataState) => {
  const state = { ChartRef: useRef([]), yAxisRef: useRef([]), ...initialState };
  const { ChartRef, yAxisRef } = state;
  // setting up use ref
  ChartRef.current = ChartRef.current.slice(0, 2);
  yAxisRef.current = yAxisRef.current.slice(0, 2);
  // adding event listeners to the ref and window
  useEffect(() => {
    handleResize({ ...state });
    window.addEventListener("resize", () => handleResize({ ...state }));
    ChartRef.current[1].addEventListener("mousedown", (e) =>
      chartMouseDown({ e, ...state })
    );
    window.addEventListener("mousemove", (e) =>
      chartMouseMove({ e, ...state })
    );
    window.addEventListener("mouseup", (e) => chartMouseUp({ e, ...state }));
    yAxisRef.current[1].addEventListener("mousedown", (e) =>
      yAxisMouseDown({ e, ...state })
    );
    window.addEventListener("mousemove", (e) =>
      yAxisMouseMove({ e, ...state })
    );
    window.addEventListener("mouseup", (e) => yAxisMouseUp({ e, ...state }));
    ChartRef.current[0].addEventListener(
      "wheel",
      (e) => handleScroll({ e, ...state }),
      false
    );
    ChartRef.current[1].addEventListener(
      "wheel",
      (e) => handleScroll({ e, ...state }),
      false
    );
    return () => {
      window.removeEventListener("resize", () => handleResize({ ...state }));
      ChartRef.current[1].removeEventListener("mousedown", (e) =>
        chartMouseDown({ e, ...state })
      );
      window.removeEventListener("mousemove", (e) =>
        chartMouseMove({ e, ...state })
      );
      window.removeEventListener("mouseup", (e) =>
        chartMouseUp({ e, ...state })
      );
      yAxisRef.current[1].removeEventListener("mousedown", (e) =>
        yAxisMouseDown({ e, ...state })
      );
      window.removeEventListener("mousemove", (e) =>
        yAxisMouseMove({ e, ...state })
      );
      window.removeEventListener("mouseup", (e) =>
        yAxisMouseUp({ e, ...state })
      );
      ChartRef.current[0].removeEventListener(
        "wheel",
        (e) => handleScroll({ e, ...state }),
        false
      );
      ChartRef.current[1].removeEventListener(
        "wheel",
        (e) => handleScroll({ e, ...state }),
        false
      );
    };
  });
  // update config
  useEffect(() => {
    if (stockDataState.length) {
      state.stockData.value = stockDataState;
      updateConfig({ ...state });
    }
  }, [stockDataState]);
  // draw chart
  let val = 0;
  effect(() => {
    if (
      state.timeRange.value.endTime.Date !== 0 &&
      state.timeRange.value.startTime.Date !== 0 &&
      chartType.value &&
      onChartIndicatorSignal.value
    ) {
      if (
        ChartRef.current[0] !== null &&
        yAxisRef.current[0] !== null &&
        xAxisRef.current[0] !== null &&
        state.priceRange.value.minPrice > 0
      ) {
        if (val === 0) {
          val++;
          setTimeout(() => {
            drawChart(xAxisRef, mode, { ...state });
          }, 0.1);
        } else {
          drawChart(xAxisRef, mode, { ...state });
        }
      }
    }
  });
  effect(() => {
    if (
      state.dateCursor.value !== null &&
      state.dateCursor.peek().x !== null &&
      state.dateCursor.peek().y !== null &&
      state.ChartRef.current[1] !== undefined &&
      xAxisRef.current[1] !== undefined &&
      state.yAxisRef.current[1] !== undefined
    ) {
      updateCursorValue(xAxisRef, mode, { ...state });
    }
  });
  return state;
};

export default useDrawChart;
