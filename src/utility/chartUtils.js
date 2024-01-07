import { monthMap } from "../data/TIME_MAP";
import {
  chartCanvasSize,
  chartType,
  dateConfig,
  dateCursor,
  priceRange,
  selectedStock,
  stockData,
  timeRange,
  xAxisCanvasSize,
  xAxisConfig,
  yAxisCanvasSize,
  yAxisConfig,
} from "../signals/stockSignals";
import { getStockData } from "./stock_api";
import {
  getNewScrollTime,
  getNewZoomTime,
  getObjtoStringTime,
  getTime,
  updateXAxisConfig,
} from "./xAxisUtils";
import {
  buildSegmentTree,
  drawCandleStick,
  drawLineChart,
  getMinMaxPrices,
} from "./yAxisUtils";
import { updatePriceRange } from "./yAxisUtils";

export const updateConfig = () => {
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

export function drawChart(ChartRef, xAxisRef, yAxisRef, mode) {
  if (
    !stockData.peek().length ||
    priceRange.peek().maxPrice === priceRange.peek().minPrice
  )
    return;
  const canvas = ChartRef.current;
  const canvasXAxis = xAxisRef.current;
  const canvasYAxis = yAxisRef.current;
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
  ctx.fillText(selectedStock.peek(), 10, 20);
  const pDiff = priceRange.peek().maxPrice - priceRange.peek().minPrice;
  for (let i = yAxisConfig.peek().noOfColumns - 1; i >= 0; i--) {
    const text =
      priceRange.peek().maxPrice -
      (pDiff / yAxisConfig.peek().noOfColumns) *
        (yAxisConfig.peek().noOfColumns - i);
    const yCoord =
      chartCanvasSize.peek().height -
      i * (chartCanvasSize.peek().height / yAxisConfig.peek().noOfColumns);
    yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    yAxisCtx.fillText(text.toFixed(2), 0, yCoord);
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
  const resultData = stockData
    .peek()
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().multiplier * timeRange.peek().offset;
    if (xCoord < 0) return;

    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        xAxisCtx.fillText(currentYear, xCoord, 12);
      } else {
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord, 12);
      }
    }
    if (chartType.peek() === "Candles") {
      drawCandleStick(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        xAxisConfig.peek().widthOfOneCS - 4
      );
    } else if (chartType.peek() === "Line") {
      drawLineChart(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx
      );
    }
  });
  ctx.stroke();
}

export function drawGridLines(ctx, width, height, mode) {
  const gridSizeX = 50;
  const gridSizeY = 50;
  const gridColor =
    mode === "Light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";

  for (let x = gridSizeX; x < width; x += gridSizeX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }

  for (let y = gridSizeY; y < height; y += gridSizeY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }
}

export async function setStockData(symbol, interval, stockData) {
  try {
    const fetchedData = await getStockData(symbol.value, interval.value);
    stockData.value = [...fetchedData];
    updateConfig();
  } catch {
    console.log("Error in fetching data!!");
  }
}

export function setCanvasSize(element) {
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
  return {
    width: width,
    height: height,
  };
}

export function handleOnMouseMove(e, ChartRef) {
  const canvas = ChartRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = e.pageX - rect.left;
  const y = e.pageY - rect.top;
  if (
    x >= 0 &&
    x <= chartCanvasSize.peek().width &&
    y >= 0 &&
    y <= chartCanvasSize.peek().height
  ) {
    const dateIndex = Math.floor(
      (chartCanvasSize.peek().width - x) / xAxisConfig.peek().widthOfOneCS
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
          chartCanvasSize.peek().width -
          dateIndex * xAxisConfig.peek().widthOfOneCS -
          xAxisConfig.peek().widthOfOneCS / 2 -
          timeRange.peek().multiplier * timeRange.peek().offset,
        y: y,
      };
    }
  } else {
    dateCursor.value = null;
  }
}

export function handleScroll(e, ChartRef) {
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
  handleOnMouseMove(e, ChartRef);
}

export function updateCursorValue(ChartContainerRef, mode) {
  const canvas = ChartContainerRef.current;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    chartCanvasSize.peek().width,
    chartCanvasSize.peek().height
  );

  const dateText = dateCursor.value.date;
  const xCoord = dateCursor.value.x - 75;
  const yCoord = chartCanvasSize.peek().height - xAxisConfig.peek().margin;
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
    ((chartCanvasSize.peek().height -
      xAxisConfig.peek().margin -
      dateCursor.value.y +
      50) *
      (priceRange.peek().maxPrice - priceRange.peek().minPrice)) /
      (chartCanvasSize.peek().height - xAxisConfig.peek().margin);
  const priceText = price.toFixed(2);
  const xCoord1 = chartCanvasSize.peek().width - xAxisConfig.peek().margin - 50;
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
  ctx.lineTo(dateCursor.value.x - 50, chartCanvasSize.peek().height);

  ctx.moveTo(0, dateCursor.value.y - 50);
  ctx.lineTo(chartCanvasSize.peek().width, dateCursor.value.y - 50);

  ctx.stroke();
  ctx.setLineDash([]);
}
