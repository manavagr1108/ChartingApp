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
import { drawLinesData, prevLineData, prevSelectedCanvas, prevToolItemNo, selectedLine } from "../signals/toolbarSignals";
import { effect } from "@preact/signals-react";
import { detectTrendLine, setTool, setTrendLine } from "./trendLineUtils";
import { drawTrendLineUsingPoints, drawTrendLines } from "./drawUtils";

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
  if (data.peek()[0] === undefined) return;
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
    if (cursordata === undefined) return;
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
      const prevXCoordIndex = dateConfig.peek().dateToIndex[prevLineData.peek().xLabel];
      const prevXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - prevXCoordIndex);
      const prevYCoord = getYCoordinate(prevLineData.peek().yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
      switch (prevToolItemNo.peek()) {
        case 0: drawTrendLineUsingPoints(prevSelectedCanvas.peek().getContext("2d"), { x: prevXCoord, y: prevYCoord }, { x, y });
      }
    }
  } else {
    dateCursor.value = null;
  }
  detectTrendLine(e, state);
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
    const isCanvas = drawChartobj.ChartRef.current[1] === dateCursor.peek().canvas;
    const { ChartRef, yAxisRef, chartCanvasSize, yAxisRange, chartMovement } = drawChartobj;
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
    if (chartMovement.peek().isItem && chartMovement.peek().itemData?.startXCoord !== undefined) {
      const { startXCoord, endXCoord, startYCoord, endYCoord } = chartMovement.peek().itemData;
      switch (chartMovement.peek().itemData.toolItemNo) {
        case 0: drawTrendLineUsingPoints(ctx, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord });
      }
    }
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
      isItem: false
    };
    dateCursor.value = null;
  }
};

export const chartMouseDown = (e, state) => {
  const { chartMovement, ChartRef, trendLinesData } = state;
  const { selectedTool, selectedItem } = state.ChartWindow;
  const selectedEle = detectTrendLine(e, state);
  if (selectedTool.peek() !== 'Cursor') {
    setTool(e, state);
  } else if (selectedEle !== null) {
    selectedItem.value = trendLinesData.peek()[selectedEle.index];
    if (selectedEle.endPoint === null) {
      prevLineData.value = selectedEle.startPoint;
      prevToolItemNo.value = selectedEle.toolItemNo;
      prevSelectedCanvas.value = ChartRef.current[1];
      trendLinesData.value = trendLinesData.peek().filter((ele, i) => i !== selectedEle.index);
      drawTrendLines(state);
      selectedTool.value = 'TrendLine';
    } else if (selectedEle.startPoint === null) {
      prevLineData.value = selectedEle.endPoint;
      prevToolItemNo.value = selectedEle.toolItemNo;
      prevSelectedCanvas.value = ChartRef.current[1];
      trendLinesData.value = trendLinesData.peek().filter((ele, i) => i !== selectedEle.index);
      drawTrendLines(state);
      selectedTool.value = 'TrendLine';
    } else {
      chartMovement.value.isItem = true;
      chartMovement.value.itemData = { toolItemNo: selectedEle.toolItemNo }
      chartMovement.value.mouseDown = true;
      chartMovement.value.prevXCoord = e.pageX;
      chartMovement.value.prevYCoord = e.pageY;
      const canvas = e.target;
      canvas.classList.add("cursor-grabbing");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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
  const { chartMovement, yAxisConfig, yAxisCanvasSize, yAxisRange, data, chartCanvasSize, ChartRef } = state;
  const { lockUpdatePriceRange, timeRange, dateConfig, xAxisConfig, selectedItem, drawChartObjects } = state.ChartWindow;
  if (
    !chartMovement.peek().isItem &&
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
  } else if (chartMovement.peek().isItem) {
    if (!chartMovement.peek().mouseMove) {
      const lineData = selectedItem.peek();
      const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.startPoint.xLabel];
      const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.endPoint.xLabel];
      const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
      const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
      const endXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
      const startYCoord = getYCoordinate(lineData.startPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
      const endYCoord = getYCoordinate(lineData.endPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
      chartMovement.value.mouseMove = true;
      drawChartObjects.peek().forEach((obj) => {
        const { trendLinesData } = obj;
        trendLinesData.peek().forEach((trendLine, i) => {
          if (trendLine === selectedItem.peek()) {
            trendLinesData.value = trendLinesData
              .peek()
              .filter((_, j) => i !== j);
            return;
          }
        });
      });
      chartMovement.value.itemData = {
        ...chartMovement.value.itemData,
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
      }
    }
    const { startXCoord, startYCoord, endXCoord, endYCoord } = chartMovement.peek().itemData;
    const newStartXCoord = startXCoord - chartMovement.peek().prevXCoord + e.pageX;
    const newEndXCoord = endXCoord - chartMovement.peek().prevXCoord + e.pageX;
    const newStartYCoord = startYCoord - chartMovement.peek().prevYCoord + e.pageY;
    const newEndYCoord = endYCoord - chartMovement.peek().prevYCoord + e.pageY;
    chartMovement.value.itemData = {
      ...chartMovement.value.itemData,
      startXCoord: newStartXCoord,
      endXCoord: newEndXCoord,
      startYCoord: newStartYCoord,
      endYCoord: newEndYCoord
    }
    chartMovement.value.prevXCoord = e.pageX;
    chartMovement.value.prevYCoord = e.pageY;
  }
};
export const chartMouseUp = (e, state) => {
  const { chartMovement, trendLinesData, chartCanvasSize, yAxisRange, data } = state;
  const { xAxisConfig, dateConfig, timeRange } = state.ChartWindow;
  if (!chartMovement.peek().mouseMove && chartMovement.peek().mouseDown) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value.mouseDown = false;
    chartMovement.value.isItem = false;
  }
  if (chartMovement.peek().isItem) {
    const {
      startXCoord,
      endXCoord,
      startYCoord,
      endYCoord,
      toolItemNo
    } = chartMovement.peek().itemData;
    const x1 = startXCoord;
    const y1 = startYCoord;
    const x2 = endXCoord;
    const y2 = endYCoord;
    const dateIndex1 = Math.floor(
      (chartCanvasSize.peek().width - x1) / xAxisConfig.peek().widthOfOneCS
    );
    const dateIndex2 = Math.floor(
      (chartCanvasSize.peek().width - x2) / xAxisConfig.peek().widthOfOneCS
    );
    const firstIndex =
      dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
      ];
    const cursordata1 = data.peek()[0][firstIndex - dateIndex1];
    const cursordata2 = data.peek()[0][firstIndex - dateIndex2];
    let price1 =
      yAxisRange.peek().minPrice +
      ((chartCanvasSize.peek().height - y1) *
        (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
      chartCanvasSize.peek().height;
    let price2 =
      yAxisRange.peek().minPrice +
      ((chartCanvasSize.peek().height - y2) *
        (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
      chartCanvasSize.peek().height;
    const lineStartPoint = {
      xLabel: cursordata1.Date,
      yLabel: price1.toFixed(2),
    }
    const lineEndPoint = {
      xLabel: cursordata2.Date,
      yLabel: price2.toFixed(2),
    }
    trendLinesData.value.push({
      startPoint: lineStartPoint,
      endPoint: lineEndPoint,
      toolItemNo: toolItemNo
    })
    drawTrendLines(state);
  }
  if (chartMovement.peek().mouseMove) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value = {
      mouseDown: false,
      mouseMove: false,
      prevXCoord: 0,
      prevYCoord: 0,
      isItem: false,
    };
  }
};