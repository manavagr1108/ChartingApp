import { monthMap } from "../data/TIME_MAP";
import { indicatorConfig, indicatorSignal } from "../signals/indicatorsSignal";
import {
  chartCanvasSize,
  chartMovement,
  chartType,
  dateConfig,
  dateCursor,
  lockUpdatePriceRange,
  priceRange,
  selectedStock,
  stockData,
  timeRange,
  xAxisConfig,
  yAxisCanvasSize,
  yAxisConfig,
} from "../signals/stockSignals";
import { calculateEMA, calculateSMA, calculateZigZag } from "./indicatorsUtil";
import { getStockData } from "./stock_api";
import {
  getNewScrollTime,
  getNewZoomTime,
  getObjtoStringTime,
  getTime,
  getXCoordinate,
  updateXAxisConfig,
} from "./xAxisUtils";
import {
  buildSegmentTree,
  drawCandleStick,
  drawLineChart,
  drawYAxis,
  updatePriceRange,
  updateYConfig,
  getYCoordinate,
} from "./yAxisUtils";

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
    timeRange.value = {
      startTime,
      endTime,
      scrollOffset: 0,
      scrollDirection: 0,
      zoomOffset: 0,
      zoomDirection: 0,
    };
    yAxisConfig.value.segmentTree = segmentTreeData.segmentTree;
    dateConfig.value.dateToIndex = segmentTreeData.datesToIndex;
    dateConfig.value.indexToDate = segmentTreeData.indexToDates;
    updatePriceRange();
    updateYConfig();
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
  drawYAxis(ctx, yAxisCtx, mode);
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
  const resultData = stockData
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
      drawCandleStick(
        d,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
        chartCanvasSize.peek().height,
        xCoord,
        ctx,
        xAxisConfig.peek().widthOfOneCS - 2
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
  drawIndicators(startIndex, endIndex, ctx, mode);
}

export function drawIndicators(startIndex, endIndex, ctx, mode) {
  indicatorSignal.peek().forEach((indicator) => {
    if (indicator.label === indicatorConfig["SMA"].label) {
      const smaData = calculateSMA(stockData.peek(), indicator.period);
      const SMA = smaData
        .slice(startIndex - indicator.period + 1, endIndex + 1)
        .reverse();
      drawSMAIndicator(indicator, ctx, SMA, mode);
    }
    if (indicator.label === indicatorConfig["EMA"].label) {
      const emaData = calculateEMA(stockData.peek(), indicator.period);
      const EMA = emaData
        .slice(startIndex - indicator.period + 1, endIndex + 1)
        .reverse();
      drawEMAIndicator(indicator, ctx, EMA, mode);
    }
    if (indicator.label === indicatorConfig["ZigZag"].label) {
      const zigZagData = calculateZigZag(
        stockData.peek(),
        indicator.deviation,
        indicator.pivotLegs
      );
      drawZigZagIndicator(ctx, zigZagData, mode, startIndex, endIndex);
    }
  });
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
          timeRange.peek().scrollDirection * timeRange.peek().scrollOffset,
        y: y,
      };
    }
  } else {
    dateCursor.value = null;
  }
}

export function handleScroll(e, ChartRef) {
  e.preventDefault();
  if (e.deltaY) {
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
      timeRange.peek().scrollOffset,
      timeRange.peek().scrollDirection,
      timeRange.peek().zoomOffset,
      timeRange.peek().zoomDirection,
      xAxisConfig.peek().widthOfOneCS,
      noOfCSMovedLeft,
      dateConfig.value.dateToIndex
    );
    updateXAxisConfig(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      dateConfig.peek().dateToIndex
    );
  } 
  if(e.deltaX) {
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
      timeRange.peek().scrollOffset,
      timeRange.peek().scrollDirection,
      timeRange.peek().zoomOffset,
      timeRange.peek().zoomDirection,
      xAxisConfig.peek().widthOfOneCS,
      pixelMovement,
      dateConfig.value.dateToIndex
    );
  }
  if (!lockUpdatePriceRange.peek()) updatePriceRange();
  updateYConfig();
  handleOnMouseMove(e, ChartRef);
}

export function updateCursorValue(ChartRef, xAxisRef, yAxisRef, mode) {
  const canvas = ChartRef.current;
  const canvasXAxis = xAxisRef.current;
  const canvasYAxis = yAxisRef.current;
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

  const dateText = dateCursor.value.date;
  let xCoord = dateCursor.value.x - 30;
  if (xCoord - 10 + dateText.length * 8 > chartCanvasSize.peek().width) {
    xCoord = chartCanvasSize.peek().width - dateText.length * 8 + 10;
  } else if (xCoord - 10 < 0) {
    xCoord = 10;
  }
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
    ((chartCanvasSize.peek().height - dateCursor.value.y) *
      (priceRange.peek().maxPrice - priceRange.peek().minPrice)) /
      chartCanvasSize.peek().height;
  const priceText = price.toFixed(2);
  const yCoord1 = dateCursor.value.y;
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

  ctx.setLineDash([5, 5]);
  ctx.beginPath();

  ctx.moveTo(dateCursor.value.x, 0);
  ctx.lineTo(dateCursor.value.x, chartCanvasSize.peek().height);

  ctx.moveTo(0, dateCursor.value.y);
  ctx.lineTo(chartCanvasSize.peek().width, dateCursor.value.y);

  ctx.stroke();
  ctx.setLineDash([]);
}

export const removeCursor = (e, ChartRef, xAxisRef1, yAxisRef1) => {
  if (dateCursor.peek() !== null && ChartRef.current !== null) {
    const chartCanvas = ChartRef.current;
    const xAxisCanvas = xAxisRef1.current;
    const yAxisCanvas = yAxisRef1.current;
    const ctx = chartCanvas.getContext("2d");
    const xAxisCtx = xAxisCanvas.getContext("2d");
    const yAxisCtx = yAxisCanvas.getContext("2d");
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    xAxisCtx.clearRect(0, 0, xAxisCanvas.width, xAxisCanvas.height);
    yAxisCtx.clearRect(0, 0, yAxisCanvas.width, yAxisCanvas.height);
    dateCursor.value = null;
  }
};
export function drawSMAIndicator(indicator, ctx, smaData, mode) {
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
      data.y,
      priceRange.peek().minPrice,
      priceRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    if (i === 0) ctx.moveTo(xCoord, yCoord);
    else ctx.lineTo(xCoord, yCoord);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function drawEMAIndicator(indicator, ctx, emaData, mode) {
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
      emaData[i].y,
      priceRange.peek().minPrice,
      priceRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    if (i === 0) ctx.moveTo(xCoord, yCoord);
    else ctx.lineTo(xCoord, yCoord);
  }
  ctx.stroke();
}

export const chartMouseDown = (e) => {
  chartMovement.value.mouseDown = true;
  chartMovement.value.prevXCoord = e.pageX;
  chartMovement.value.prevYCoord = e.pageY;
  const canvas = e.target;
  canvas.classList.add("cursor-grabbing");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
export const chartMouseMove = (e) => {
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
    const pDiff = priceRange.peek().maxPrice - priceRange.peek().minPrice;
    if (
      lockUpdatePriceRange.peek() &&
      ((pDiff < 4000 && pixelYMovement > 0) ||
        (pDiff > 5 && pixelYMovement < 0))
    ) {
      priceRange.value = {
        minPrice: priceRange.peek().minPrice - pixelYMovement,
        maxPrice: priceRange.peek().maxPrice - pixelYMovement,
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
        updatePriceRange();
        updateYConfig();
      }
    }
    chartMovement.value.prevXCoord = e.pageX;
    chartMovement.value.prevYCoord = e.pageY;
  }
};
export const chartMouseUp = (e) => {
  if (chartMovement.peek().mouseMove) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value = { mouseDown: false, mouseMove: false, prevXCoord: 0 };
  } else if(chartMovement.peek().mouseDown){
    chartMovement.value.mouseDown = false;
  }
};

export function drawZigZagIndicator(
  ctx,
  zigZagData,
  mode,
  startIndex,
  endIndex
) {
  const zigzagColor = mode === "Light" ? "#0b69ac" : "#f0a70b";
  ctx.lineWidth = 1;
  ctx.strokeStyle = zigzagColor;
  ctx.beginPath();
  let flag = false;
  for (let i = startIndex; i <= endIndex; i++) {
    if (zigZagData[stockData.peek()[i].Date]) {
      const index = endIndex - i;
      if (flag === false) {
        const zigZagValues = Object.values(zigZagData);
        const index1 =
          dateConfig.peek().dateToIndex[
            zigZagValues[zigZagData[stockData.peek()[i].Date].index - 1]?.date
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
            zigZagValues[zigZagData[stockData.peek()[i].Date].index - 1]?.value,
            priceRange.peek().minPrice,
            priceRange.peek().maxPrice,
            chartCanvasSize.peek().height
          )
        );
        flag = true;
      }
      const price = zigZagData[stockData.peek()[i].Date].value;
      const xCoord = getXCoordinate(
        chartCanvasSize.peek().width,
        xAxisConfig.peek().widthOfOneCS,
        timeRange.peek().scrollDirection,
        timeRange.peek().scrollOffset,
        index
      );
      const yCoord = getYCoordinate(
        price,
        priceRange.peek().minPrice,
        priceRange.peek().maxPrice,
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
      stockData.peek()[endIndex].Low,
      priceRange.peek().minPrice,
      priceRange.peek().maxPrice,
      chartCanvasSize.peek().height
    )
  );
  ctx.stroke();
}
