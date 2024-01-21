import { monthMap } from "../data/TIME_MAP";
import { indicatorConfig } from "../config/indicatorsConfig";
import {
  calculateBB,
  calculateEMA,
  calculateParabolicSAR,
  calculateSMA,
  calculateZigZag,
  calculateDonchainChannels,
  calculateKeltnerChannels,
} from "./indicatorsUtil";
import { getStockData } from "./stock_api";
import {
  getNewScrollTime,
  getNewZoomTime,
  getObjtoStringTime,
  getXCoordinate,
} from "./xAxisUtils";
import {
  drawCandleStick,
  drawLineChart,
  drawYAxis,
  getYCoordinate,
} from "./yAxisUtils";
import { drawLinesData, prevLineData, selectedLine } from "../signals/toolbarSignals";
import { effect } from "@preact/signals-react";

export function drawChart(state, mode) {
  const { data, yAxisRange, ChartRef, yAxisRef, chartCanvasSize } = state;
  const {
    xAxisRef,
    dateConfig,
    timeRange,
    xAxisConfig,
    chartType,
    selectedStock,
  } = state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  ctx.fillText(selectedStock.peek(), 10, 20);
  drawYAxis(ctx, yAxisCtx, mode, state);
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
  let prev = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
          }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
          }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }
    if (chartType.peek() === "Candles") {
      drawCandleStick(
        d,
        yAxisRange.peek().minPrice,
        yAxisRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        xAxisConfig.peek().widthOfOneCS - 2
      );
    } else if (chartType.peek() === "Line") {
      ctx.strokeStyle = "rgba(0,0,255,0.9)";
      prev = drawLineChart(
        d,
        yAxisRange.peek().minPrice,
        yAxisRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        prev
      );
    }
  });
  drawIndicators(startIndex, endIndex, ctx, mode, state);
}

export function drawIndicators(startIndex, endIndex, ctx, mode, state) {
  const { data } = state;
  const { onChartIndicatorSignal } = state.ChartWindow;
  onChartIndicatorSignal.peek().forEach((indicator) => {
    if (indicator.label === indicatorConfig["SMA"].label) {
      const smaData = calculateSMA(data.peek()[0], indicator.period);
      const SMA = smaData
        .slice(startIndex - indicator.period + 1, endIndex + 1)
        .reverse();
      drawSMAIndicator(indicator, ctx, SMA, mode, state);
    }
    if (indicator.label === indicatorConfig["EMA"].label) {
      const emaData = calculateEMA(data.peek()[0], indicator.period);
      const EMA = emaData
        .slice(startIndex - indicator.period + 1, endIndex + 1)
        .reverse();
      drawEMAIndicator(indicator, ctx, EMA, mode, state);
    }
    if (indicator.label === indicatorConfig["ZigZag"].label) {
      const zigZagData = calculateZigZag(
        data.peek()[0],
        indicator.deviation,
        indicator.pivotLegs
      );
      drawZigZagIndicator(ctx, zigZagData, mode, startIndex, endIndex, state);
    }
    if (indicator.label === indicatorConfig["ParabolicSAR"].label) {
      const sarData = calculateParabolicSAR(
        data.peek()[0],
        indicator.acceleration,
        indicator.maximum
      );
      const SAR = sarData.slice(startIndex, endIndex + 1).reverse();
      drawParabolicSAR(indicator, ctx, SAR, mode, state);
    }
    if (indicator.label === indicatorConfig["BB"].label) {
      const bbData = calculateBB(
        data.peek()[0],
        indicator.period,
        indicator.stdDev
      );
      const BB = bbData.slice(startIndex, endIndex + 1).reverse();
      drawBB(indicator, ctx, BB, mode, state);
    }
    if (indicator.label === indicatorConfig["KeltnerChannels"].label) {
      const KeltnerData = calculateKeltnerChannels(
        data.peek()[0],
        indicator.period,
        indicator.multiplier
      );
      const KELTNER = KeltnerData.slice(startIndex, endIndex + 1).reverse();
      drawBB(indicator, ctx, KELTNER, mode, state);
    }
    if (indicator.label === indicatorConfig["DonchainChannels"].label) {
      const donchainData = calculateDonchainChannels(
        data.peek()[0],
        indicator.period
      );
      const DONCHAIN = donchainData.slice(startIndex, endIndex + 1).reverse();
      drawBB(indicator, ctx, DONCHAIN, mode, state);
    }
  });
}

export async function getStockDataCallback(
  symbol,
  interval,
  setStockDataState
) {
  try {
    const fetchedData = await getStockData(symbol.value, interval.value);
    if (fetchedData.length) {
      // setStockDataState([...fetchedData]);
      setStockDataState.value = [...fetchedData];
      return;
    }
  } catch (e) {
    console.log(e, "Error in fetching data!!");
  }
}

export function setCanvasSize(element) {
  if (element === undefined || element === null) return;
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

export function handleOnMouseMove(e, state) {
  const { chartCanvasSize, data, yAxisRange } = state;
  const { dateCursor, xAxisConfig, dateConfig, timeRange } = state.ChartWindow;
  const canvas = e.target;
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
    const cursordata = data.peek()[0][firstIndex - dateIndex];
    if (cursordata?.Low !== undefined && cursordata?.High !== null) {
      dateCursor.value = {
        date: cursordata.Date,
        text: `${cursordata.Date} Open: ${cursordata.Open.toFixed(
          2
        )} High: ${cursordata.High.toFixed(2)} Low: ${cursordata.Low.toFixed(
          2
        )} Close: ${cursordata.Close.toFixed(2)} Volume: ${cursordata.Volume.toFixed(2)}`,
        x:
          chartCanvasSize.peek().width -
          dateIndex * xAxisConfig.peek().widthOfOneCS -
          xAxisConfig.peek().widthOfOneCS / 2 -
          timeRange.peek().scrollDirection * timeRange.peek().scrollOffset,
        y: y,
        canvas: state.ChartRef.current[1],
      };
    } else if (cursordata.Date !== undefined) {
      dateCursor.value = {
        date: cursordata.Date,
        text: `${cursordata.Date} val: ${cursordata.Close.toFixed(2)}`,
        x:
          chartCanvasSize.peek().width -
          dateIndex * xAxisConfig.peek().widthOfOneCS -
          xAxisConfig.peek().widthOfOneCS / 2 -
          timeRange.peek().scrollDirection * timeRange.peek().scrollOffset,
        y: y,
        canvas: state.ChartRef.current[1],
      };
    }
    if (prevLineData.peek() !== null) {
      const ctx = canvas.getContext("2d");
      const prevXCoordIndex = dateConfig.peek().dateToIndex[prevLineData.peek().xLabel];
      const prevXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - prevXCoordIndex);
      const prevYCoord = getYCoordinate(prevLineData.peek().yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
      ctx.beginPath();
      ctx.arc(prevXCoord, prevYCoord, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(prevXCoord, prevYCoord);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    dateCursor.value = null;
  }
  drawTrendLine(e, state);
}

export function handleScroll(e, state) {
  e.preventDefault();
  const { data } = state;
  const {
    timeRange,
    dateConfig,
    xAxisConfig,
    lockUpdatePriceRange,
    drawChartObjects,
  } = state.ChartWindow;
  let newTime = null;
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    let noOfCSMovedLeft = -Math.floor(e.deltaY);
    if (
      getObjtoStringTime(timeRange.peek().endTime) ===
      dateConfig.peek().indexToDate[0]
    ) {
      return;
    }
    if (noOfCSMovedLeft === 0) return;

    newTime = getNewZoomTime(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      timeRange.peek().scrollOffset,
      timeRange.peek().scrollDirection,
      timeRange.peek().zoomOffset,
      timeRange.peek().zoomDirection,
      xAxisConfig.peek().widthOfOneCS,
      noOfCSMovedLeft,
      dateConfig.value.dateToIndex
    );
    state.ChartWindow.setXAxisConfig();
  }
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    let pixelMovement = e.deltaX;
    if (
      Math.abs(pixelMovement) === 0 ||
      (pixelMovement > 0 &&
        getObjtoStringTime(timeRange.peek().startTime) ===
        dateConfig.peek().indexToDate[data.peek()[0].length - 1]) ||
      (pixelMovement < 0 &&
        getObjtoStringTime(timeRange.peek().endTime) ===
        dateConfig.peek().indexToDate[0])
    ) {
      return;
    }
    newTime = getNewScrollTime(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      timeRange.peek().scrollOffset,
      timeRange.peek().scrollDirection,
      timeRange.peek().zoomOffset,
      timeRange.peek().zoomDirection,
      xAxisConfig.peek().widthOfOneCS,
      pixelMovement,
      dateConfig.value.dateToIndex
    );
  }
  if (newTime !== null) timeRange.value = { ...newTime };
  if (!lockUpdatePriceRange.peek()) {
    drawChartObjects.peek().forEach((drawChartObject) => {
      drawChartObject.setYRange();
    });
  }
  state.setYAxisConfig();
  handleOnMouseMove(e, state);
}

export function updateCursorValue(state, mode) {
  const { dateCursor, xAxisRef, drawChartObjects } = state;
  drawChartObjects.peek().forEach((drawChartobj) => {
    const isCanvas =
      drawChartobj.ChartRef.current[1] === dateCursor.peek().canvas;
    const { ChartRef, yAxisRef, chartCanvasSize, yAxisRange } = drawChartobj;
    if (ChartRef.current[1] === null || yAxisRef.current[1] === null) return;
    const canvas = ChartRef.current[1];
    const canvasXAxis = xAxisRef.current[1];
    const canvasYAxis = yAxisRef.current[1];
    const ctx = canvas.getContext("2d");
    const xAxisCtx = canvasXAxis.getContext("2d");
    const yAxisCtx = canvasYAxis.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
    yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
    ctx.font = "12px Arial";
    ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    xAxisCtx.font = "12px Arial";
    xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    yAxisCtx.font = "12px Arial";
    yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    const dateText = dateCursor.peek().date;
    let xCoord = dateCursor.peek().x - 30;
    if (xCoord - 10 + dateText.length * 8 > chartCanvasSize.peek().width) {
      xCoord = chartCanvasSize.peek().width - dateText.length * 8 + 10;
    } else if (xCoord - 10 < 0) {
      xCoord = 10;
    }
    // Draw on XAxis
    xAxisCtx.fillRect(
      xCoord - 10,
      10 - 14,
      dateText.length * 8,
      20,
      mode === "Light" ? "white" : "black"
    );
    xAxisCtx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
    xAxisCtx.fillText(dateText, xCoord, 12);
    const price =
      yAxisRange.peek().minPrice +
      ((chartCanvasSize.peek().height - dateCursor.peek().y) *
        (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
      chartCanvasSize.peek().height;
    const priceText = price.toFixed(2);
    const yCoord1 = dateCursor.peek().y;
    if (isCanvas) {
      ctx.fillText(dateCursor.peek().text, 50, 20);
      // Draw on YAxis
      yAxisCtx.fillRect(
        0,
        yCoord1 - 14,
        priceText.length * 12,
        20,
        mode === "Light" ? "white" : "black"
      );
      yAxisCtx.fillStyle = `${mode === "Light" ? "white" : "black"}`;
      yAxisCtx.fillText(priceText, 15, yCoord1);
      ctx.strokeStyle = `${mode === "Light" ? "black" : "white"}`;
    }

    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    ctx.moveTo(dateCursor.peek().x, 0);
    ctx.lineTo(dateCursor.peek().x, chartCanvasSize.peek().height);
    if (isCanvas) {
      ctx.moveTo(0, dateCursor.value.y);
      ctx.lineTo(chartCanvasSize.peek().width, dateCursor.peek().y);
    }

    ctx.stroke();
    ctx.setLineDash([]);
  });
}

export const removeCursor = (e, state) => {
  const { ChartRef, yAxisRef, chartMovement } = state;
  const { dateCursor, xAxisRef } = state.ChartWindow;
  if (dateCursor.peek() !== null && ChartRef !== null) {
    const chartCanvas = ChartRef.current[1];
    const xAxisCanvas = xAxisRef.current[1];
    const yAxisCanvas = yAxisRef.current[1];
    const ctx = chartCanvas.getContext("2d");
    const xAxisCtx = xAxisCanvas.getContext("2d");
    const yAxisCtx = yAxisCanvas.getContext("2d");
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    xAxisCtx.clearRect(0, 0, xAxisCanvas.width, xAxisCanvas.height);
    yAxisCtx.clearRect(0, 0, yAxisCanvas.width, yAxisCanvas.height);
    chartMovement.value = {
      mouseDown: false,
      mouseMove: false,
      prevXCoord: 0,
      prevYCoord: 0,
    };
    dateCursor.value = null;
  }
};
const setTrendLine = (e, state) => {
  const { chartCanvasSize, data, yAxisRange } = state;
  const { dateConfig, xAxisConfig, timeRange } = state.ChartWindow;
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.pageX - rect.left;
  const y = e.pageY - rect.top;
  const dateIndex = Math.floor(
    (chartCanvasSize.peek().width - x) / xAxisConfig.peek().widthOfOneCS
  );
  const firstIndex =
    dateConfig.peek().dateToIndex[
    getObjtoStringTime(timeRange.peek().startTime)
    ];
  const cursordata = data.peek()[firstIndex - dateIndex];
  const price =
    yAxisRange.peek().minPrice +
    ((chartCanvasSize.peek().height - y) *
      (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
    chartCanvasSize.peek().height;
  const priceText = price.toFixed(2);
  const lineStartPoint = {
    xLabel: cursordata.Date,
    yLabel: priceText,
  }
  if (prevLineData.peek() !== null) {
    drawLinesData.value.push({
      startPoint: prevLineData.peek(),
      endPoint: lineStartPoint,
    })
    prevLineData.value = null;
    selectedLine.value = -1;
  } else {
    const ctx = canvas.getContext("2d");
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    prevLineData.value = lineStartPoint;
  }
}

const drawTrendLine = (e, state) => {
  const { chartCanvasSize, yAxisRange } = state;
  const { dateConfig, xAxisConfig, timeRange } = state.ChartWindow;
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.pageX - rect.left;
  const y = e.pageY - rect.top;
  drawLinesData.peek().forEach((lineData) => {
    const ctx = canvas.getContext("2d");
    const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.startPoint.xLabel];
    const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.endPoint.xLabel];
    const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
    const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
    const endXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
    const startYCoord = getYCoordinate(lineData.startPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    const endYCoord = getYCoordinate(lineData.endPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    ctx.beginPath();
    ctx.moveTo(startXCoord, startYCoord);
    ctx.lineTo(endXCoord, endYCoord);
    ctx.stroke();
  })
}

export const chartMouseDown = (e, state) => {
  const { chartMovement } = state;
  if (selectedLine.peek() !== -1) {
    setTrendLine(e, state);
  } else {
    chartMovement.value.mouseDown = true;
    chartMovement.value.prevXCoord = e.pageX;
    chartMovement.value.prevYCoord = e.pageY;
    const canvas = e.target;
    canvas.classList.add("cursor-grabbing");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
export const chartMouseMove = (e, state) => {
  const { chartMovement, yAxisConfig, yAxisCanvasSize, yAxisRange, data } =
    state;
  const { lockUpdatePriceRange, timeRange, dateConfig, xAxisConfig } =
    state.ChartWindow;
  if (
    chartMovement.peek().mouseDown &&
    (e.pageX - chartMovement.peek().prevXCoord !== 0 ||
      e.pageY - chartMovement.peek().prevYCoord !== 0)
  ) {
    if (!chartMovement.peek().mouseMove) {
      chartMovement.value.mouseMove = true;
    }
    const pixelXMovement = chartMovement.peek().prevXCoord - e.pageX;
    const pixelYMovement =
      ((chartMovement.peek().prevYCoord - e.pageY) *
        yAxisConfig.peek().priceDiff) /
      yAxisCanvasSize.peek().height;
    const pDiff = yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice;
    if (
      lockUpdatePriceRange.peek() &&
      ((pDiff < 4000 && pixelYMovement > 0) ||
        (pDiff > 5 && pixelYMovement < 0))
    ) {
      yAxisRange.value = {
        minPrice: yAxisRange.peek().minPrice - pixelYMovement,
        maxPrice: yAxisRange.peek().maxPrice - pixelYMovement,
      };
    }
    if (pixelXMovement) {
      timeRange.value = getNewScrollTime(
        timeRange.peek().startTime,
        timeRange.peek().endTime,
        timeRange.peek().scrollOffset,
        timeRange.peek().scrollDirection,
        timeRange.peek().zoomOffset,
        timeRange.peek().zoomDirection,
        xAxisConfig.peek().widthOfOneCS,
        pixelXMovement,
        dateConfig.value.dateToIndex
      );
      if (!lockUpdatePriceRange.peek()) {
        state.setYRange();
        state.setYAxisConfig();
      }
    }
    chartMovement.value.prevXCoord = e.pageX;
    chartMovement.value.prevYCoord = e.pageY;
  }
};
export const chartMouseUp = (e, state) => {
  const { chartMovement } = state;
  if (chartMovement.peek().mouseMove) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value = { mouseDown: false, mouseMove: false, prevXCoord: 0 };
  } else if (chartMovement.peek().mouseDown) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value.mouseDown = false;
  }
};

export function drawSMAIndicator(indicator, ctx, smaData, mode, state) {
  const { chartCanvasSize, yAxisRange } = state;
  const { timeRange, xAxisConfig } = state.ChartWindow;
  ctx.strokeStyle = indicator.color;
  ctx.lineWidth = indicator.stroke;
  ctx.beginPath();
  smaData.forEach((data, i) => {
    const xCoord = getXCoordinate(
      chartCanvasSize.peek().width,
      xAxisConfig.peek().widthOfOneCS,
      timeRange.peek().scrollDirection,
      timeRange.peek().scrollOffset,
      i
    );
    const yCoord = getYCoordinate(
      data.Close,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    if (i === 0) ctx.moveTo(xCoord, yCoord);
    else ctx.lineTo(xCoord, yCoord);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function drawEMAIndicator(indicator, ctx, emaData, mode, state) {
  const { chartCanvasSize, yAxisRange } = state;
  const { xAxisConfig, timeRange } = state.ChartWindow;
  ctx.strokeStyle = indicator.color;
  ctx.lineWidth = indicator.stroke;
  ctx.beginPath();
  for (let i = 0; i < emaData.length; i++) {
    const xCoord = getXCoordinate(
      chartCanvasSize.peek().width,
      xAxisConfig.peek().widthOfOneCS,
      timeRange.peek().scrollDirection,
      timeRange.peek().scrollOffset,
      i
    );
    const yCoord = getYCoordinate(
      emaData[i].Close,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    if (i === 0) ctx.moveTo(xCoord, yCoord);
    else ctx.lineTo(xCoord, yCoord);
  }
  ctx.stroke();
}

export function drawZigZagIndicator(
  ctx,
  zigZagData,
  mode,
  startIndex,
  endIndex,
  state
) {
  const { chartCanvasSize, yAxisRange, data } = state;
  const { dateConfig, timeRange, xAxisConfig } = state.ChartWindow;
  const zigzagColor = mode === "Light" ? "#0b69ac" : "#f0a70b";
  ctx.lineWidth = 1;
  ctx.strokeStyle = zigzagColor;
  ctx.beginPath();
  let flag = false;
  for (let i = startIndex; i <= endIndex; i++) {
    if (zigZagData[data.peek()[0][i].Date]) {
      const index = endIndex - i;
      if (flag === false) {
        const zigZagValues = Object.values(zigZagData);
        const index1 =
          dateConfig.peek().dateToIndex[
          zigZagValues[zigZagData[data.peek()[0][i].Date].index - 1]?.date
          ];
        ctx.moveTo(
          getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            endIndex - index1
          ),
          getYCoordinate(
            zigZagValues[zigZagData[data.peek()[0][i].Date].index - 1]?.value,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
          )
        );
        flag = true;
      }
      const price = zigZagData[data.peek()[0][i].Date].value;
      const xCoord = getXCoordinate(
        chartCanvasSize.peek().width,
        xAxisConfig.peek().widthOfOneCS,
        timeRange.peek().scrollDirection,
        timeRange.peek().scrollOffset,
        index
      );
      const yCoord = getYCoordinate(
        price,
        yAxisRange.peek().minPrice,
        yAxisRange.peek().maxPrice,
        chartCanvasSize.peek().height
      );
      ctx.lineTo(xCoord, yCoord);
    }
  }
  ctx.lineTo(
    getXCoordinate(
      chartCanvasSize.peek().width,
      xAxisConfig.peek().widthOfOneCS,
      timeRange.peek().scrollDirection,
      timeRange.peek().scrollOffset,
      0
    ),
    getYCoordinate(
      data.peek()[0][endIndex].Low,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    )
  );
  ctx.stroke();
}

export function drawParabolicSAR(indicator, ctx, sarData, mode, state) {
  const { chartCanvasSize, yAxisRange } = state;
  const { xAxisConfig, timeRange } = state.ChartWindow;
  ctx.fillStyle = indicator.color;

  for (let i = 0; i < sarData.length; i++) {
    const xCoord = getXCoordinate(
      chartCanvasSize.peek().width,
      xAxisConfig.peek().widthOfOneCS,
      timeRange.peek().scrollDirection,
      timeRange.peek().scrollOffset,
      i
    );
    const yCoord = getYCoordinate(
      sarData[i].Close,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );

    const dotSize = indicator.stroke;

    ctx.beginPath();
    ctx.arc(xCoord, yCoord, parseInt(dotSize), 0, 2 * Math.PI);
    ctx.fill();
  }
}

export function drawBB(indicator, ctx, BBData, mode, state) {
  const { chartCanvasSize, yAxisRange } = state;
  const { timeRange, xAxisConfig } = state.ChartWindow;
  ctx.strokeStyle = indicator.color;
  ctx.lineWidth = indicator.stroke;
  let prevSma = null;
  let prevUpper = null;
  let prevLower = null;
  BBData.forEach((data, i) => {
    const xCoordSMA = getXCoordinate(
      chartCanvasSize.peek().width,
      xAxisConfig.peek().widthOfOneCS,
      timeRange.peek().scrollDirection,
      timeRange.peek().scrollOffset,
      i
    );
    const yCoordSMA = getYCoordinate(
      data.Close,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    const yCoordUpper = getYCoordinate(
      data.UpperBand,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    const yCoordLower = getYCoordinate(
      data.LowerBand,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    ctx.fillStyle = "rgba(0,148,255,0.3)";
    ctx.lineWidth = indicator.stroke;
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(xCoordSMA, yCoordUpper);
      ctx.lineTo(xCoordSMA, yCoordUpper);
      ctx.moveTo(xCoordSMA, yCoordSMA);
      ctx.lineTo(xCoordSMA, yCoordSMA);
      ctx.moveTo(xCoordSMA, yCoordLower);
      ctx.lineTo(xCoordSMA, yCoordLower);
      ctx.stroke();
      // context.moveTo(xCoordSMA, yCoordLower);
    } else {
      ctx.beginPath();
      ctx.moveTo(prevUpper.xCoordSMA, prevUpper.yCoordUpper);
      ctx.lineTo(xCoordSMA, yCoordUpper);
      ctx.moveTo(prevSma.xCoordSMA, prevSma.yCoordSMA);
      ctx.lineTo(xCoordSMA, yCoordSMA);
      ctx.moveTo(prevLower.xCoordSMA, prevLower.yCoordLower);
      ctx.lineTo(xCoordSMA, yCoordLower);
      ctx.stroke();
      ctx.moveTo(prevLower.xCoordSMA, prevLower.yCoordLower);
      ctx.bezierCurveTo(
        prevLower.xCoordSMA,
        prevLower.yCoordLower,
        prevUpper.xCoordSMA,
        prevUpper.yCoordUpper,
        prevUpper.xCoordSMA,
        prevUpper.yCoordUpper
      );
      ctx.bezierCurveTo(
        prevUpper.xCoordSMA,
        prevUpper.yCoordUpper,
        xCoordSMA,
        yCoordUpper,
        xCoordSMA,
        yCoordUpper
      );
      ctx.bezierCurveTo(
        xCoordSMA,
        yCoordUpper,
        xCoordSMA,
        yCoordLower,
        xCoordSMA,
        yCoordLower
      );
      ctx.bezierCurveTo(
        xCoordSMA,
        yCoordLower,
        prevLower.xCoordSMA,
        prevLower.yCoordLower,
        prevLower.xCoordSMA,
        prevLower.yCoordLower
      );
      ctx.closePath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "rgba(0,148,255,0.3)";
      ctx.fill();
      ctx.strokeStyle = "blue";
    }
    prevSma = { xCoordSMA, yCoordSMA };
    prevUpper = { xCoordSMA, yCoordUpper };
    prevLower = { xCoordSMA, yCoordLower };
  });
  ctx.lineWidth = 1;
}
