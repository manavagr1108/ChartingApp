import React, { useCallback, useLayoutEffect, useRef } from "react";
import { effect } from "@preact/signals-react";
import {
  buildSegmentTree,
  getMinMaxPrices,
  drawCandleStick,
  drawLineChart,
} from "../../utility/yAxisUtils";
import {
  chartCanvasSize,
  xAxisCanvasSize,
  yAxisCanvasSize,
  dateConfig,
  priceRange,
  selectedStock,
  stockData,
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
  console.log("render");
  const ChartRef = useRef(null);
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
      const canvas = ChartRef1.current;
      const canvasXAxis = xAxisRef1.current;
      const canvasYAxis = yAxisRef1.current;
      const ctx = canvas.getContext("2d");
      const xAxisCtx = canvasXAxis.getContext("2d");
      const yAxisCtx = canvasYAxis.getContext("2d");
      ctx.clearRect(
        0,
        0,
        chartCanvasSize.peek().width,
        chartCanvasSize.peek().height
      );
      xAxisCtx.clearRect(
        0,
        0,
        xAxisCanvasSize.peek().width,
        xAxisCanvasSize.peek().height
      );
      yAxisCtx.clearRect(
        0,
        0,
        yAxisCanvasSize.peek().width,
        yAxisCanvasSize.peek().height
      );
      ctx.font = "12px Arial";
      ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      xAxisCtx.font = "12px Arial";
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      yAxisCtx.font = "12px Arial";
      yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;

      const dateText = dateCursor.value.date;
      const xCoord = dateCursor.value.x - 30;
      xAxisCtx.fillRect(
        xCoord - 10,
        10 - 14,
        dateText.length * 8,
        20,
        mode === "Light" ? "white" : "black"
      );
      xAxisCtx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
      xAxisCtx.fillText(dateText, xCoord, 12);
      ctx.fillText(dateCursor.value.text, 50, 20);

      const price =
        priceRange.peek().minPrice +
        ((chartCanvasSize.peek().height -
          dateCursor.value.y +
          50) *
          (priceRange.peek().maxPrice - priceRange.peek().minPrice)) /
          (chartCanvasSize.peek().height);
      const priceText = price.toFixed(2);
      const yCoord1 = dateCursor.value.y;
      yAxisCtx.fillRect(
        5 - 5,
        yCoord1 - 14,
        priceText.length * 8,
        20,
        mode === "Light" ? "white" : "black"
      );
      yAxisCtx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
      yAxisCtx.fillText(priceText, 5, yCoord1);
      ctx.strokeStyle = `${mode === "Light" ? "black" : "white"}`;

      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      ctx.moveTo(dateCursor.value.x, 0);
      ctx.lineTo(dateCursor.value.x, chartCanvasSize.peek().height);

      ctx.moveTo(0, dateCursor.value.y);
      ctx.lineTo(chartCanvasSize.peek().width, dateCursor.value.y);

      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
  effect(() => {
    if (selectedStock.value && interval.value)
      setStockData(selectedStock, interval, stockData);
  });
  useLayoutEffect(() => {
    chartCanvasSize.value = setCanvasSize(ChartRef.current);
    setCanvasSize(ChartRef1.current);
    xAxisCanvasSize.value = setCanvasSize(xAxisRef.current);
    setCanvasSize(xAxisRef1.current);
    yAxisCanvasSize.value = setCanvasSize(yAxisRef.current);
    setCanvasSize(yAxisRef1.current);
    ChartRef.current.addEventListener("wheel", (e) => handleScroll(e, ChartRef), false);
    ChartRef1.current.addEventListener("wheel", (e) => handleScroll(e, ChartRef1), false);
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
      if (
        ChartRef.current !== null &&
        xAxisRef.current !== null &&
        yAxisRef.current !== null
      )
        drawChart(ChartRef, xAxisRef, yAxisRef, mode);
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
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-3`}
          ></canvas>
        </div>
      </div>
      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
