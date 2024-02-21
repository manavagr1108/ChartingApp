import { stocksConfig } from "../../config/stocksConfig";
import { monthMap } from "../../data/TIME_MAP";
import { dateToColMap, getNumTime, getNumTimeDiff, getObjtoStringTime, getTime } from "../xAxisUtils";
import { getYCoordinate } from "../yAxisUtils";
import { drawIndicators } from "./indicatorDraw";
import { drawFibs } from "./toolsDraw/fibTool";
import { drawTrendLines } from "./toolsDraw/lineTool";
export function drawChart(state, mode) {
  const { data, yAxisRange, ChartRef, yAxisRef, chartCanvasSize } = state;
  const {
    xAxisRef,
    dateConfig,
    timeRange,
    xAxisConfig,
    chartType,
    instrumentKey,
    selectedItem
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
  ctx.fillText(stocksConfig[instrumentKey.peek()], 10, 20);
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
  drawXAxis(state, resultData, mode);
  resultData.forEach((d, i) => {
    if (i === 0 && endIndex <= data.peek()[0].length - 3) {
      i = i - 1;
      d = data.peek()[0][endIndex + 1];
      const xCoord =
        chartCanvasSize.peek().width -
        i * xAxisConfig.peek().widthOfOneCS -
        xAxisConfig.peek().widthOfOneCS / 2 -
        timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
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
      i = 0;
      d = resultData[0];
    }
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
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
  state.ChartWindow.drawChartObjects
    .peek()
    .forEach((obj) => drawTrendLines(obj, true));
  state.ChartWindow.drawChartObjects
    .peek()
    .forEach((obj) => drawFibs(obj, true));
}

export const drawYAxis = (ctx, yAxisCtx, mode, state) => {
  const { yAxisConfig, yAxisRange, chartCanvasSize, yAxisCanvasSize } = state;
  const colDiff = yAxisConfig.peek().colDiff;
  const minPrice = yAxisRange.peek().minPrice;
  const maxPrice = yAxisRange.peek().maxPrice;
  const noOfCols = Math.floor((maxPrice - minPrice) / colDiff);
  for (let i = noOfCols + 3; i >= 0; i--) {
    const text =
      Math.floor(yAxisRange.peek().minPrice / colDiff) * colDiff +
      (i - 1) * colDiff;
    const yCoord = getYCoordinate(
      text,
      minPrice,
      maxPrice,
      yAxisCanvasSize.peek().height
    );
    yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    yAxisCtx.lineWidth = 1;
    yAxisCtx.fillText(text.toFixed(2), 15, yCoord + 4);
    const lineColor = `${mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`;
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.moveTo(0, yCoord);
    ctx.lineTo(chartCanvasSize.peek().width, yCoord);
    ctx.stroke();
  }
};

export const drawCandleStick = (
  data,
  minPrice,
  maxPrice,
  height,
  x,
  context,
  width
) => {
  let fillColor, borderColor;
  if (data["Close"] > data["Open"]) {
    fillColor = "green";
    borderColor = "green";
  } else {
    borderColor = "red";
    fillColor = "red";
  }
  const open = getYCoordinate(data["Open"], minPrice, maxPrice, height);
  const close = getYCoordinate(data["Close"], minPrice, maxPrice, height);
  const high = getYCoordinate(data["High"], minPrice, maxPrice, height);
  const low = getYCoordinate(data["Low"], minPrice, maxPrice, height);
  const bodyHeight = Math.abs(open - close);
  const bodyY = Math.min(open, close);
  // Draw candlestick body
  context.fillStyle = fillColor;
  context.fillRect(x - width / 2, bodyY, width, bodyHeight);

  // Draw candlestick wicks
  context.strokeStyle = borderColor;
  context.lineWidth = 0.5;
  context.beginPath();
  context.moveTo(x, high);
  context.lineTo(x, Math.min(open, close));
  context.moveTo(x, low);
  context.lineTo(x, Math.max(open, close));
  context.stroke();
};

export const drawLineChart = (
  data,
  minPrice,
  maxPrice,
  height,
  x,
  context,
  prev,
  color
) => {
  const y = getYCoordinate(
    data["Close"] ? data["Close"] : data,
    minPrice,
    maxPrice,
    height
  );
  if (prev === null) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    context.moveTo(x, y);
    context.stroke();
  } else {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(prev.x, prev.y);
    context.lineTo(x, y);
    context.stroke();
  }
  return { x, y };
};

export const drawBarChart = (
  data,
  minPrice,
  maxPrice,
  height,
  x,
  context,
  width
) => {
  const y = getYCoordinate(data["Close"], minPrice, maxPrice, height);
  const yZero = getYCoordinate(0, minPrice, maxPrice, height);
  if (data["Close"] > 0) {
    context.fillStyle = "Green";
    context.strokeStyle = "Green";
    context.beginPath();
    context.fillRect(x - width / 2, y, width, Math.abs(y - yZero));
    context.stroke();
  } else {
    context.fillStyle = "Red";
    context.strokeStyle = "Red";
    context.beginPath();
    context.fillRect(x - width / 2, yZero, width, Math.abs(y - yZero));
    context.stroke();
  }
};

export const drawXAxis = (state, resultData, mode) => {
  const { chartCanvasSize, ChartRef } = state;
  const { timeRange, xAxisConfig, xAxisRef, interval } = state.ChartWindow;
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const timeDiff = getNumTimeDiff(timeRange.peek().startTime, timeRange.peek().endTime);
  let freq = 0;
  let index = 0;
  const nums = Object.keys(dateToColMap[interval.peek()])
  nums.some((num, i) => {
    num = parseInt(num);
    if (i === nums.length - 1 || num >= timeDiff) {
      freq = dateToColMap[interval.peek()][num].freq;
      index = dateToColMap[interval.peek()][num].index;
      return true;
    }
  })
  let prevIndex = -1;
  const indexToDraw = [];
  let diff = 0;
  let startId = 0;
  let endId = 0;
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < -2 * xAxisConfig.widthOfOneCS) {
      return;
    }
    const currentTime = getTime(d.Date);
    if (
      i < resultData.length - 1 &&
      currentTime[index] !== getTime(resultData[i + 1].Date)[index]
    ) {
      if (prevIndex === -1) startId = i;
      endId = i;
      if (prevIndex !== -1) {
        diff = parseInt((i - prevIndex) / (freq + 1));
        for (let j = 1; j <= freq; j++) {
          indexToDraw.push(parseInt(((i - prevIndex) / (freq + 1) * j) + prevIndex))
        }
      }
      prevIndex = i;
      const currentMonth = currentTime['Month'];
      const currentYear = currentTime['Year'];
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1 && currentMonth !== getTime(resultData[i + 1].Date)['Month']) {
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
        if (index === 'Month') {
          xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
        } else if (index === 'Date') {
          if (currentTime['Month'] !== getTime(resultData[i + 1].Date)['Month']) {
            xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
          } else {
            xAxisCtx.fillText(currentTime[index], xCoord - 10, 12);
          }
        }
      }
    }
  })
  let temp = endId;
  if (index === 'Month') {
    if (diff === 0) {
      if (interval.peek() === 'day') diff = 5;
      else if (interval.peek() === '30minute') diff = 20;
    }
    while (diff !== 0 && temp + diff < resultData.length) {
      indexToDraw.push(temp + diff);
      temp += diff;
    }
    temp = startId;
    while (diff !== 0 && temp - diff > 0) {
      indexToDraw.push(temp - diff);
      temp -= diff;
    }
    indexToDraw.forEach(i => {
      const xCoord =
        chartCanvasSize.peek().width -
        i * xAxisConfig.peek().widthOfOneCS -
        xAxisConfig.peek().widthOfOneCS / 2 -
        timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
      const d = resultData[i];
      const time = getTime(d.Date);
      const lineColor = `${mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.moveTo(xCoord, 0);
      ctx.lineTo(xCoord, chartCanvasSize.peek().height);
      ctx.stroke();
      xAxisCtx.fillText(time.Date, xCoord - 10, 12);
    })
  }
}