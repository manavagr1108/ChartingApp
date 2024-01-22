import { monthMap } from "../data/TIME_MAP";
import { getObjtoStringTime } from "./xAxisUtils";
import { drawBarChart, drawLineChart, drawYAxis, getYCoordinate } from "./yAxisUtils";

export function calculateSMA(data, period) {
  const smaValues = [];
  for (let i = 0; i < period - 1; i++) {
    smaValues.push({ Date: data[i].Date, Close: 0 })
  }
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + value.Close, 0);
    let average = sum / period;
    smaValues.push({ Date: data[i].Date, Close: average });
  }

  return smaValues;
}

export function calculateEMA(data, period) {
  const emaValues = [];
  const multiplier = 2 / (period + 1);
  for (let i = 0; i < period - 1; i++) {
    emaValues.push({ Date: data[i].Date, Close: 0 });
  }
  if (
    data[period - 1].Date !== null &&
    data[period - 1].Close !== null &&
    data[period]
  ) {
    const sma =
      data.slice(0, period - 1).reduce((acc, value) => acc + value.Close, 0) /
      (period - 1);
    emaValues.push({ Date: data[period - 1].Date, Close: sma });
  }
  for (let i = period; i < data.length; i++) {
    const close = data[i].Close;
    const prevEMA = emaValues[i - 1].Close;
    const ema = (close - prevEMA) * multiplier + prevEMA;
    emaValues.push({ Date: data[i].Date, Close: ema });
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

export const calculateRSI = (data, indicator) => {
  let gains = 0;
  let losses = 0;
  const { period } = indicator;
  const rsiValues = [];
  for (let i = 1; i <= period; i++) {
    const change = data[i]?.Close - data[i - 1]?.Close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
    rsiValues.push({ Date: data[i - 1].Date, Close: 0 });
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].Close - data[i - 1].Close;
    let gain = change > 0 ? change : 0;
    let loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    let rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);
    rsiValues.push({ Date: data[i - 1].Date, Close: rsi });
  }
  return [rsiValues];
};

export const calculateMACD = (data, indicator) => {
  const { fastPeriod, slowPeriod, signalPeriod } = indicator;
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const macdValues = [];

  const minMACDValues = Math.min(fastEMA.length, slowEMA.length);

  for (let i = 0; i < minMACDValues; i++) {
    macdValues.push({
      Date: slowEMA[i].Date,
      Close: fastEMA[i].Close - slowEMA[i].Close,
    });
  }

  const signalEMA = calculateEMA(macdValues, signalPeriod);

  const minHistogramValue = Math.min(signalEMA.length, macdValues.length);

  const histogramValues = [];
  for (let i = 0; i < minHistogramValue; i++) {
    histogramValues.push({
      Date: macdValues[i].Date,
      Close: macdValues[i].Close - signalEMA[i].Close,
    });
  }

  return [macdValues, signalEMA, histogramValues];
};

export const calculateParabolicSAR = (data, acceleration, maximum) => {
  console.log(data, "data");
  const sarValues = [];
  let trend = "up";
  let ep = data[0].Low;
  let sar = data[0].High;
  let af = acceleration;
  let prevSar = data[0].Low;
  let prevEP = data[0].Low;
  let prevAF = acceleration;
  let prevTrend = "up";

  for (let i = 0; i < data.length; i++) {
    if (trend === "up") {
      if (data[i].Low <= sar) {
        trend = "down";
        sar = ep;
        ep = data[i].High;
        af = acceleration;
      } else {
        sar = prevSar + prevAF * (prevEP - prevSar);
        if (data[i].High > prevEP) {
          ep = data[i].High;
          af = Math.min(af + acceleration, maximum);
        } else {
          ep = prevEP;
          af = prevAF;
        }
      }
    } else {
      if (data[i].High >= sar) {
        trend = "up";
        sar = ep;
        ep = data[i].Low;
        af = acceleration;
      } else {
        sar = prevSar + prevAF * (prevEP - prevSar);
        if (data[i].Low < prevEP) {
          ep = data[i].Low;
          af = Math.min(af + acceleration, maximum);
        } else {
          ep = prevEP;
          af = prevAF;
        }
      }
    }

    sarValues.push({ Date: data[i].Date, Close: sar });
    prevSar = sar;
    prevTrend = trend;
    prevEP = ep;
    prevAF = af;
  }
  return sarValues;
};

export function drawRSIIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
    Indicator
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
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
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
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
  let prev = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  const y30RSI = getYCoordinate(30, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
  const y70RSI = getYCoordinate(70, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
  ctx.fillStyle = 'rgba(0,148,255,0.3)';
  ctx.strokeStyle = 'gray';
  ctx.setLineDash([5, 2]);
  ctx.beginPath();
  ctx.fillRect(0, y70RSI, chartCanvasSize.peek().width, Math.abs(y70RSI - y30RSI));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, y70RSI);
  ctx.lineTo(chartCanvasSize.peek().width, y70RSI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, y30RSI);
  ctx.lineTo(chartCanvasSize.peek().width, y30RSI);
  ctx.stroke();
  ctx.setLineDash([]);
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
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    prev = drawLineChart(
      d,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev,
      Indicator.peek().indicatorOptions.peek().color
    );
  });
}
export function drawMACDIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
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
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
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
  let prev = null;
  let prev1 = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  const resultData1 = data
    .peek()[1]
    .slice(startIndex, endIndex + 1)
    .reverse();
  const resultData2 = data
    .peek()[2]
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
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    prev = drawLineChart(
      d,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev,
      'blue'
    );
    prev1 = drawLineChart(
      resultData1[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev1,
      'orange'
    )
    drawBarChart(
      resultData2[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      xAxisConfig.peek().widthOfOneCS - 2
    )
  });
}
