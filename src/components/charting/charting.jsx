import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getStockData } from "../../utility/stock_api";
import { effect } from "@preact/signals-react";
import {
  buildSegmentTree,
  getMinMaxPrices,
  drawCandleStick,
  drawLineChart,
} from "../../utility/yAxisUtils";
import {
  canvasSize,
  dateConfig,
  priceRange,
  selectedStock,
  stockData,
  timeRange,
  xAxisConfig,
  yAxisConfig,
  dateCursor,
  chartType,
} from "../../signals/stockSignals";
import {
  getObjtoStringTime,
  getTime,
  getCandleSticksMoved,
  getNewScrollTime,
  getNewZoomTime,
} from "../../utility/xAxisUtils";
import { monthMap } from "../../data/TIME_MAP";

const updateXAxisConfig = (startTime, endTime, datesToIndex, chartType) => {
  const noOfDataPoints =
    datesToIndex[getObjtoStringTime(startTime)] -
    datesToIndex[getObjtoStringTime(endTime)];
  const widthOfOneCS = canvasSize.peek().width / noOfDataPoints;
  xAxisConfig.value.noOfDataPoints = noOfDataPoints;
  xAxisConfig.value.widthOfOneCS = widthOfOneCS;
};

const updateConfig = () => {
  if (stockData.peek().length) {
    const segmentTreeData = buildSegmentTree(stockData.peek());
    const startTime = getTime(
      stockData.peek()[stockData.peek().length - 1].Date
    );
    const endTime = getTime(
      stockData.peek()[stockData.peek().length - 150].Date
    );
    updateXAxisConfig(startTime, endTime, segmentTreeData.datesToIndex);
    timeRange.value = { startTime, endTime, offset: 0, multiplier: 0 };
    yAxisConfig.value.segmentTree = segmentTreeData.segmentTree;
    dateConfig.value.dateToIndex = segmentTreeData.datesToIndex;
    dateConfig.value.indexToDate = segmentTreeData.indexToDates;
    updatePriceRange();
  }
};

function drawChart(ChartContainerRef, mode) {
  if (
    ChartContainerRef !== null &&
    ChartContainerRef.current !== null &&
    (!stockData.peek().length ||
      priceRange.peek().maxPrice === priceRange.peek().minPrice)
  )
    return;
  const canvas = ChartContainerRef.current;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasSize.peek().width, canvasSize.peek().height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  ctx.fillText(selectedStock.peek(), 10, 20);
  const pDiff = priceRange.peek().maxPrice - priceRange.peek().minPrice;
  for (let i = yAxisConfig.peek().noOfColumns - 1; i > 0; i--) {
    const text =
      priceRange.peek().maxPrice -
      (pDiff / yAxisConfig.peek().noOfColumns) *
        (yAxisConfig.peek().noOfColumns - i);
    const xCoord = canvasSize.peek().width - yAxisConfig.peek().margin;
    const yCoord =
      canvasSize.peek().height -
      xAxisConfig.peek().margin -
      i *
        ((canvasSize.peek().height - xAxisConfig.peek().margin) /
          yAxisConfig.peek().noOfColumns);
    ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    ctx.fillText(text.toFixed(2), parseInt(xCoord - 5), parseInt(yCoord + 5));
  }
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  const resultData = stockData.peek().slice(startIndex, endIndex).reverse();
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      canvasSize.peek().width -
      yAxisConfig.peek().margin -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().multiplier * timeRange.peek().offset;

    if (xCoord < 0) return;

    if (
      i < resultData.length - 1 &&
      parseInt(d.Date.split("-")[1]) !==
        parseInt(resultData[i + 1].Date.split("-")[1])
    ) {
      const yCoord = canvasSize.peek().height - xAxisConfig.peek().margin;
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        ctx.fillText(currentYear, xCoord, yCoord);
      } else {
        ctx.fillText(monthMap[currentMonth - 1], xCoord, yCoord);
      }
    }
    if (chartType.peek() === "Candles") {
      drawCandleStick(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        canvasSize.peek().height,
        xAxisConfig.peek().margin,
        xCoord,
        ctx,
        xAxisConfig.peek().widthOfOneCS - 4,
        mode
      );
    } else if (chartType.peek() === "Line") {
      drawLineChart(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        canvasSize.peek().height,
        xAxisConfig.peek().margin,
        xCoord,
        ctx,
        xAxisConfig.peek().widthOfOneCS - 4
      );
    }
  });
  ctx.stroke();
}

function updatePriceRange() {
  const result = getMinMaxPrices(
    yAxisConfig.peek().segmentTree,
    dateConfig.peek().dateToIndex,
    getObjtoStringTime(timeRange.value.endTime),
    getObjtoStringTime(timeRange.value.startTime),
    stockData.peek().length
  );
  if (
    result &&
    (result.maxPrice !== priceRange.peek().maxPrice ||
      result.minPrice !== priceRange.peek().minPrice) &&
    (result.maxPrice !== Number.MIN_SAFE_INTEGER ||
      result.minPrice !== Number.MAX_SAFE_INTEGER)
  ) {
    priceRange.value = result;
  }
}

async function setStockData(symbol, interval, stockData) {
  try {
    const fetchedData = await getStockData(symbol.value, interval.value);
    stockData.value = [...fetchedData];
    updateConfig();
  } catch {
    console.log("Error in fetching data!!");
  }
}

function setCanvasSize(element) {
  const canvas = element;
  let width = element.parentElement.offsetWidth;
  let height = element.parentElement.offsetHeight;
  const dpr = window.devicePixelRatio | 1;
  const ctx = canvas.getContext("2d");
  if (width < window.innerWidth) {
    canvas.width = width * dpr;
  }
  if (height < window.innerHeight) {
    canvas.height = height * dpr;
  }
  ctx.scale(dpr, dpr);
  canvasSize.value = {
    width: width,
    height: height,
  };
}
function handleOnMouseMove(e) {
  const canvas = document.querySelector("canvas:nth-child(2)");
  const x = e.pageX - canvas.offsetLeft;
  const y = e.pageY - canvas.offsetTop;
  if (
    x >= 0 &&
    x <= canvasSize.peek().width &&
    y >= 0 &&
    y <= canvasSize.peek().height
  ) {
    const dateIndex = Math.floor(
      (canvasSize.peek().width - x) / xAxisConfig.peek().widthOfOneCS + 0.5
    );
    const firstIndex =
      dateConfig.peek().dateToIndex[
        getObjtoStringTime(timeRange.peek().startTime)
      ];
    const data = stockData.peek()[firstIndex - dateIndex];
    if (data) {
      dateCursor.value = {
        date: data.Date,
        text: `${data.Date} Open: ${data.Open.toFixed(
          2
        )} High: ${data.High.toFixed(2)} Low: ${data.Low.toFixed(
          2
        )} Close: ${data.Close.toFixed(2)} Volume: ${data.Volume.toFixed(2)}`,
        x:
          canvasSize.peek().width - dateIndex * xAxisConfig.peek().widthOfOneCS,
        y: e.pageY,
      };
    }
  } else {
    dateCursor.value = null;
  }
}

function handleScroll(e) {
  e.preventDefault();

  if (e.ctrlKey) {
    let noOfCSMovedLeft = -Math.floor(e.deltaY);
    if (
      getObjtoStringTime(timeRange.peek().endTime) ===
      dateConfig.peek().indexToDate[0]
    ) {
      return;
    }
    if (noOfCSMovedLeft === 0) return;

    timeRange.value = getNewZoomTime(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      timeRange.peek().offset,
      timeRange.peek().multiplier,
      noOfCSMovedLeft,
      dateConfig.value.dateToIndex
    );
    updateXAxisConfig(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      dateConfig.peek().dateToIndex
    );
  } else {
    let pixelMovement = e.deltaX;
    if (
      Math.abs(pixelMovement) === 0 ||
      (pixelMovement > 0 &&
        getObjtoStringTime(timeRange.peek().startTime) ===
          dateConfig.peek().indexToDate[stockData.peek().length - 1]) ||
      (pixelMovement < 0 &&
        getObjtoStringTime(timeRange.peek().endTime) ===
          dateConfig.peek().indexToDate[0])
    ) {
      return;
    }
    timeRange.value = getNewScrollTime(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      timeRange.peek().offset,
      timeRange.peek().multiplier,
      xAxisConfig.peek().widthOfOneCS,
      pixelMovement,
      dateConfig.value.dateToIndex
    );
  }
  updatePriceRange();
  handleOnMouseMove(e);
}

function Charting({ selectedStock, interval, stockData, chartType, mode }) {
  console.log("render");
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
      dateCursor.value.y !== null
    ) {
      const canvas = document.querySelector("canvas:nth-child(2)");
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvasSize.peek().width, canvasSize.peek().height);

      const dateText = dateCursor.value.date;
      const xCoord = dateCursor.value.x - 75;
      const yCoord = canvasSize.peek().height - xAxisConfig.peek().margin;
      ctx.font = "12px Arial";
      ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      ctx.fillRect(
        xCoord - 10,
        yCoord - 14,
        dateText.length * 8,
        20,
        mode === "Light" ? "white" : "black"
      );
      ctx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
      ctx.fillText(dateText, xCoord, yCoord);
      ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      ctx.fillText(dateCursor.value.text, 50, 20);

      const price =
        priceRange.peek().minPrice +
        ((canvasSize.peek().height -
          xAxisConfig.peek().margin -
          dateCursor.value.y +
          50) *
          (priceRange.peek().maxPrice - priceRange.peek().minPrice)) /
          (canvasSize.peek().height - xAxisConfig.peek().margin);
      const priceText = price.toFixed(2);
      const xCoord1 = canvasSize.peek().width - xAxisConfig.peek().margin - 50;
      const yCoord1 = dateCursor.value.y - 50;
      ctx.font = "12px Arial";
      ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      ctx.fillRect(
        xCoord1 - 5,
        yCoord1 - 14,
        priceText.length * 8,
        20,
        mode === "Light" ? "white" : "black"
      );
      ctx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
      ctx.fillText(priceText, xCoord1, yCoord1);
      ctx.strokeStyle = `${mode === "Light" ? "black" : "white"}`;

      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      ctx.moveTo(dateCursor.value.x - 50, 0);
      ctx.lineTo(dateCursor.value.x - 50, canvasSize.peek().height);

      ctx.moveTo(0, dateCursor.value.y - 50);
      ctx.lineTo(canvasSize.peek().width, dateCursor.value.y - 50);

      ctx.stroke();
      ctx.setLineDash([]);
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
