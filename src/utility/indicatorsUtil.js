import { monthMap } from "../data/TIME_MAP";
import { chartType, selectedStock } from "../signals/stockSignals";
import { getObjtoStringTime } from "./xAxisUtils";
import { drawLineChart, drawYAxis } from "./yAxisUtils";

export function calculateSMA(data, period) {
  const smaValues = [];

  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + value.Close, 0);
    let average = sum / period;
    smaValues.push({ x: data[i].x, y: average });
  }

  return smaValues;
}

export function calculateEMA(data, period) {
  const emaValues = [];
  const multiplier = 2 / (period + 1);

  if (
    data[period - 1].x !== null &&
    data[period - 1].y !== null &&
    data[period]
  ) {
    const sma =
      data.slice(0, period).reduce((acc, value) => acc + value.Close, 0) /
      period;
    emaValues.push({ x: data[period - 1].x, y: sma });
  }

  for (let i = period; i < data.length; i++) {
    const close = data[i].Close;
    const prevEMA = emaValues[i - period].y;
    const ema = (close - prevEMA) * multiplier + prevEMA;
    emaValues.push({ x: data[i].x, y: ema });
  }

  return emaValues;
}

export function calculateZigZag(data, deviation, pivotLegs) {
  let trend = null;
  let lastPivotPrice = data[0].Close;
  let lastPivotIndex = 0;
  let lastPivotDate = data[0].Date;
  let zigZagPoints = {};
  let count = -1;

  data.forEach((d, i) => {
    if (trend === "up") {
      if (lastPivotPrice <= d.High) {
        lastPivotPrice = d.High;
        lastPivotDate = d.Date;
        lastPivotIndex = i;
      } else if (
        d.Low < lastPivotPrice * (1 - deviation / 100) &&
        i - lastPivotIndex >= pivotLegs
      ) {
        zigZagPoints[lastPivotDate] = {
          index: count,
          value: lastPivotPrice,
          date: lastPivotDate,
        };
        trend = "down";
        lastPivotPrice = d.Low;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    } else if (trend === "down") {
      if (lastPivotPrice >= d.Low) {
        lastPivotPrice = d.Low;
        lastPivotDate = d.Date;
        lastPivotIndex = i;
      } else if (
        d.High > lastPivotPrice * (1 + deviation / 100) &&
        i - lastPivotIndex >= pivotLegs
      ) {
        zigZagPoints[lastPivotDate] = {
          index: count,
          value: lastPivotPrice,
          date: lastPivotDate,
        };
        trend = "up";
        lastPivotPrice = d.High;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    } else {
      if (d.High > lastPivotPrice * (1 + deviation / 100)) {
        trend = "up";
        lastPivotPrice = d.High;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      } else if (d.Low < lastPivotPrice * (1 - deviation / 100)) {
        trend = "down";
        lastPivotPrice = d.Low;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    }
  });

  if (data[data.length - 1].Date !== lastPivotDate)
    zigZagPoints[lastPivotDate] = {
      index: count,
      value: lastPivotPrice,
      date: lastPivotDate,
    };

  return zigZagPoints;
}

export function calculateRSI(data, period) {
  let gains = 0;
  let losses = 0;
  const rsiValues = [];
  for (let i = 1; i <= period; i++) {
    const change = data[i]?.Close - data[i - 1]?.Close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].Close - data[i - 1].Close;
    let gain = change > 0 ? change : 0;
    let loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    // console.log(avgGain, avgLoss);

    let rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);
    rsiValues.push({ Date: data[i].Date, Close: rsi });
  }
  return rsiValues;
}


export function drawIndicatorChart(
  xAxisRef,
  mode,
  {
    priceRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    dateConfig,
    timeRange,
    chartCanvasSize,
    xAxisConfig,
    yAxisCanvasSize,
    data
  }
) {
  if (
    data.peek().length === 0 ||
    priceRange.peek().maxPrice === priceRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  console.log("called");
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
  // console.log(yAxisConfig.peek(),
  //   priceRange.peek(),
  //   chartCanvasSize.peek(),
  //   yAxisCanvasSize.peek());
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    priceRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
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
  console.log(startIndex, endIndex);
  let prev = null;
  const resultData = data
    .peek()
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
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
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
      // drawCandleStick(
      //   d,
      //   priceRange.peek().minPrice,
      //   priceRange.peek().maxPrice,
      //   chartCanvasSize.peek().height,
      //   xCoord,
      //   ctx,
      //   xAxisConfig.peek().widthOfOneCS - 2
      // );
      ctx.strokeStyle = "rgba(0,0,255,0.9)";
      prev = drawLineChart(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        prev
      );
    } else if (chartType.peek() === "Line") {
      ctx.strokeStyle = "rgba(0,0,255,0.9)";
      prev = drawLineChart(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        prev
      );
    }
  });
}