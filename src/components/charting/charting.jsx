import React, { useCallback, useLayoutEffect, useRef } from "react";
import { effect } from "@preact/signals-react";
import {
  chartCanvasSize,
  xAxisCanvasSize,
  yAxisCanvasSize,
  timeRange,
  dateCursor,
} from "../../signals/stockSignals";
import {
  updateConfig,
  drawChart,
  setStockData,
  setCanvasSize,
  handleOnMouseMove,
  handleScroll,
  updateCursorValue,
  removeCursor,
} from "../../utility/chartUtils";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../../utility/xAxisUtils";
import { indicatorSignal } from "../../signals/indicatorsSignal";

function Charting({
  ChartRef,
  selectedStock,
  interval,
  stockData,
  chartType,
  mode,
}) {
  const ChartRef1 = useRef(null);
  const xAxisRef = useRef(null);
  const xAxisRef1 = useRef(null);
  const yAxisRef = useRef(null);
  const yAxisRef1 = useRef(null);
  const handleResize = useCallback(() => {
    chartCanvasSize.value = setCanvasSize(ChartRef.current);
    setCanvasSize(ChartRef1.current);
    xAxisCanvasSize.value = setCanvasSize(xAxisRef.current);
    setCanvasSize(xAxisRef1.current);
    yAxisCanvasSize.value = setCanvasSize(yAxisRef.current);
    setCanvasSize(yAxisRef1.current);
    updateConfig();
  }, []);
  effect(() => {
    if (
      dateCursor.value &&
      dateCursor.value.x !== null &&
      dateCursor.value.y !== null &&
      ChartRef1.current !== null &&
      xAxisRef1.current !== null &&
      yAxisRef1.current !== null
    ) {
      updateCursorValue(ChartRef1, xAxisRef1, yAxisRef1, mode);
    }
  });
  effect(() => {
    if (selectedStock.value && interval.value)
      setStockData(selectedStock, interval, stockData);
  });
  useLayoutEffect(() => {
    handleResize();
    xAxisRef1.current.addEventListener("mousedown", xAxisMouseDown);
    window.addEventListener("mousemove", xAxisMouseMove);
    window.addEventListener("mouseup", xAxisMouseUp);
    ChartRef.current.addEventListener(
      "wheel",
      (e) => handleScroll(e, ChartRef),
      false
    );
    ChartRef1.current.addEventListener(
      "wheel",
      (e) => handleScroll(e, ChartRef1),
      false
    );
    window.addEventListener("resize", handleResize);
    return () => {
      ChartRef.current.removeEventListener(
        "wheel",
        (e) => handleScroll(e, ChartRef),
        false
      );
      ChartRef1.current.removeEventListener(
        "wheel",
        (e) => handleScroll(e, ChartRef1),
        false
      );
      window.removeEventListener("resize", handleResize);
      xAxisRef1.current.removeEventListener("mousedown", xAxisMouseDown);
      window.removeEventListener("mousemove", xAxisMouseMove);
      window.removeEventListener("mouseup", xAxisMouseUp);
    };
  });
  effect(() => {
    if (
      timeRange.value.endTime.Date !== 0 &&
      timeRange.value.startTime.Date !== 0 &&
      chartType.value &&
      indicatorSignal.value
    ) {
      if (
        ChartRef.current !== null &&
        xAxisRef.current !== null &&
        yAxisRef.current !== null
      ) {
        drawChart(ChartRef, xAxisRef, yAxisRef, mode);
      }
    }
  });
  return (
    <div
      className={`flex w-[100%] flex-col border-l-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800  bg-gray-900"
      }`}
    >
      <div
        className={`flex direction-row flex-wrap w-[100%] h-[95%] border-b-2 ${
          mode === "Light" ? "border-gray-300" : "border-gray-800"
        }`}
      >
        <div className="w-[95%] h-[97%] relative">
          <canvas
            ref={ChartRef}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={ChartRef1}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
            onMouseMove={(e) => {
              handleOnMouseMove(e, ChartRef1);
            }}
            onMouseLeave={(e) => {
              removeCursor(e, ChartRef1, xAxisRef1, yAxisRef1);
            }}
          ></canvas>
        </div>
        <div className="w-[5%] h-[97%] relative">
          <canvas
            ref={yAxisRef}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={yAxisRef1}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          ></canvas>
        </div>
        <div className="w-[95%] h-[3%] relative">
          <canvas
            ref={xAxisRef}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={xAxisRef1}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ew-resize`}
          ></canvas>
        </div>
      </div>
      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
