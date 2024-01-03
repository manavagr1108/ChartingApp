import React, { useLayoutEffect, useRef } from "react";
import { getStockData } from "../../utility/stock_api";
import { effect } from "@preact/signals-react";
import {
  buildSegmentTree,
  getMinMaxPrices,
  drawCandleStick,
} from "../../utility/yAxisUtils";
import {
  canvasSize,
  dateConfig,
  priceRange,
  stockData,
  timeRange,
  xAxisConfig,
  yAxisConfig,
} from "../../signals/stockSignals";
import {
  getObjtoStringTime,
  getTime,
  getCandleSticksMoved,
  getNewTime,
} from "../../utility/xAxisUtils";
import { monthMap } from "../../data/TIME_MAP";

const updateConfig = () => {
  if (stockData.peek().length) {
    const segmentTreeData = buildSegmentTree(stockData.peek());
    const startTime = getTime(stockData.peek()[stockData.peek().length - 1].Date);
    const endTime = getTime(stockData.peek()[stockData.peek().length - 150].Date);
    const noOfDataPoints =
      segmentTreeData.datesToIndex[getObjtoStringTime(startTime)] -
      segmentTreeData.datesToIndex[getObjtoStringTime(endTime)];
    const widthOfOneCS = canvasSize.peek().width / noOfDataPoints;
    xAxisConfig.value.noOfDataPoints = noOfDataPoints;
    xAxisConfig.value.widthOfOneCS = widthOfOneCS;
    timeRange.value = { startTime, endTime };
    yAxisConfig.value.segmentTree = segmentTreeData.segmentTree;
    dateConfig.value.dateToIndex = segmentTreeData.datesToIndex;
    dateConfig.value.indexToDate = segmentTreeData.indexToDates;
    updatePriceRange();
  }
};

function drawChart(ChartContainerRef) {
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
    ctx.fillStyle = "black";
    ctx.fillText(parseInt(text), parseInt(xCoord - 5), parseInt(yCoord + 5));
  }
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  const resultData = stockData.peek().slice(startIndex, endIndex).reverse();
  resultData.forEach((d, i) => {
    const xCoord =
      canvasSize.peek().width -
      5 -
      yAxisConfig.peek().margin -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2;

    if (xCoord < 0) return;
    if (
      i < resultData.length - 1 &&
      parseInt(d.Date.split("-")[1]) !==
        parseInt(resultData[i + 1].Date.split("-")[1])
    ) {
      const yCoord = canvasSize.peek().height - xAxisConfig.peek().margin;
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      ctx.fillStyle = "black";
      if (currentMonth === 1) {
        ctx.fillText(currentYear, xCoord, yCoord);
      } else {
        ctx.fillText(monthMap[currentMonth - 1], xCoord, yCoord);
      }
    }
    drawCandleStick(
      d,
      priceRange.peek().minPrice,
      priceRange.peek().maxPrice,
      canvasSize.peek().height,
      xAxisConfig.peek().margin,
      xCoord,
      ctx,
      xAxisConfig.peek().widthOfOneCS - 4
    );
  });
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
    const data = await getStockData(symbol.value, interval.value);
    const rows = data.split("\n");
    const headers = rows[0].split(",");
    const jsonData = rows
      .slice(1)
      .filter((row) => row.trim() !== "")
      .map((row) => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] =
            index === 0
              ? values[index].trim()
              : parseFloat(values[index].trim());
          return obj;
        }, {});
      });

    const fetchedData = [];
    jsonData.forEach((item) => {
      fetchedData.push({
        Date: item.Date,
        Open: item.Open,
        High: item.High,
        Low: item.Low,
        Close: item.Close,
        AdjClose: item["Adj Close"],
        Volume: item.Volume,
      });
    });
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

function handleScroll(e) {
  e.preventDefault();
  updatePriceRange();
  let noOfCSMoved = Math.floor(e.deltaX);
  if (
    noOfCSMoved > 0 &&
    getObjtoStringTime(timeRange.peek().startTime) ===
      dateConfig.peek().indexToDate[stockData.peek().length - 1]
  ) {
    noOfCSMoved = 0;
    return;
  } else if (
    noOfCSMoved < 0 &&
    getObjtoStringTime(timeRange.peek().endTime) ===
      dateConfig.peek().indexToDate[0]
  ) {
    noOfCSMoved = 0;
    return;
  }
  timeRange.value = getNewTime(
    timeRange.peek().startTime,
    timeRange.peek().endTime,
    noOfCSMoved,
    dateConfig.value.dateToIndex
  );
}

function Charting({ selectedStock, interval, stockData }) {
  console.log("render");
  const ChartContainerRef = useRef(null);
  function handleResize() {
    setCanvasSize(ChartContainerRef.current);
    updateConfig();
  }
  useLayoutEffect(() => {
    setCanvasSize(ChartContainerRef.current);
    setStockData(selectedStock, interval, stockData);
    ChartContainerRef.current.addEventListener(
      "wheel",
      (e) => handleScroll(e),
      false
    );
    window.addEventListener("resize", handleResize);
  });
  effect(() => {
    if (
      timeRange.value.endTime.Date !== 0 &&
      timeRange.value.startTime.Date !== 0
    ) {
      if (ChartContainerRef.current !== null) drawChart(ChartContainerRef);
    }
  });
  return (
    <div className="flex w-[100%] flex-col border-l-2 border-gray-300">
      <div className="w-[100%] h-[95%]">
        <canvas
          ref={ChartContainerRef}
          className="w-[100%] border-b-2 border-gray-300"
        ></canvas>
      </div>

      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
