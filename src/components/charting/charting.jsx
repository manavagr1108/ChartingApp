import React, { useCallback, useLayoutEffect, useRef } from "react";
import { effect } from "@preact/signals-react";
import {
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
} from "../../utility/chartUtils";

function Charting({ selectedStock, interval, stockData, chartType, mode }) {
  const ChartContainerRef = useRef(null);
  const ChartContainerRef1 = useRef(null);
  const handleResize = useCallback(() => {
    setCanvasSize(ChartContainerRef.current);
    setCanvasSize(ChartContainerRef1.current);
    updateConfig();
  }, []);
  effect(() => {
    if (
      dateCursor.value &&
      dateCursor.value.x !== null &&
      dateCursor.value.y !== null &&
      ChartContainerRef1.current !== null
    ) {
      updateCursorValue(ChartContainerRef1, mode);
    }
  });
  effect(() => {
    if (selectedStock.value && interval.value)
      setStockData(selectedStock, interval, stockData);
  });
  useLayoutEffect(() => {
    setCanvasSize(ChartContainerRef.current);
    setCanvasSize(ChartContainerRef1.current);
    ChartContainerRef.current.addEventListener(
      "wheel",
      (e) => handleScroll(e),
      false
    );
    ChartContainerRef1.current.addEventListener(
      "wheel",
      (e) => handleScroll(e),
      false
    );
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  effect(() => {
    if (
      timeRange.value.endTime.Date !== 0 &&
      timeRange.value.startTime.Date !== 0 &&
      chartType.value
    ) {
      if (ChartContainerRef.current !== null)
        drawChart(ChartContainerRef, mode);
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
      <div className="w-[100%] h-[95%] relative">
        <canvas
          ref={ChartContainerRef}
          className={`w-[100%] border-b-2 ${
            mode === "Light" ? "border-gray-300" : "border-gray-800"
          } cursor-crosshair absolute top-0 left-0 z-2`}
        ></canvas>
        <canvas
          ref={ChartContainerRef1}
          className={`w-[100%] border-b-2 ${
            mode === "Light" ? "border-gray-300" : "border-gray-800"
          } cursor-crosshair absolute top-0 left-0 z-3`}
          onMouseMove={(e) => {
            handleOnMouseMove(e);
          }}
        ></canvas>
      </div>
      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
