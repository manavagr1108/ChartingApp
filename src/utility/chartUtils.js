import { getStockData } from "./stockApi";
import {
  getNewScrollTime,
  getNewZoomTime,
  getObjtoStringTime,
} from "./xAxisUtils";
import {
  prevLineData,
  prevSelectedCanvas,
  prevToolItemNo,
  selectedLine,
} from "../signals/toolbarSignals";
import { detectTrendLine, setTool, getCoordsArray } from "./toolsUtils";
import {
  drawFibChannelUsingPoints,
  drawFibTimeZoneUsingPoints,
  drawFibUsingPoints,
  drawFibs,
  drawTrendFibTimeUsingPoints,
  drawTrendFibUsingPoints,
} from "./drawUtils/toolsDraw/fibTool";
import {
  drawCrossLineUsingPoints,
  drawExtendedLineUsingPoints,
  drawHorizontalLineUsingPoints,
  drawHorizontalRayUsingPoints,
  drawInfoLineUsingPoints,
  drawRayLineUsingPoints,
  drawTrendAngleUsingPoints,
  drawTrendLineUsingPoints,
  drawTrendLines,
  drawVerticalLineUsingPoints,
} from "./drawUtils/toolsDraw/lineTool";

export async function getStockDataCallback(
  instrumentKey,
  interval,
  setStockDataState
) {
  try {
    const fetchedData = await getStockData(instrumentKey.value, interval.value);
    if (fetchedData.length) {
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
  const { dateCursor, xAxisConfig, dateConfig, timeRange, selectedTool } =
    state.ChartWindow;
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
    let dateIndex = Math.round(
      (chartCanvasSize.peek().width - x) / xAxisConfig.peek().widthOfOneCS
    );
    if (
      dateIndex * xAxisConfig.peek().widthOfOneCS >
      chartCanvasSize.peek().width - x
    ) {
      dateIndex -= 1;
    }
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
      let flag = 0;
      const points = prevLineData.peek().map((point) => {
        if (point === null) {
          flag = 1;
          return { x, y };
        } else {
          return point;
        }
      });
      if (flag === 0) points.push({ x, y });
      switch (selectedTool.peek()) {
        case "Line":
          switch (prevToolItemNo.peek()) {
            case 0:
              drawTrendLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 1:
              drawRayLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 2:
              drawInfoLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 3:
              drawExtendedLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 4:
              drawTrendAngleUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 5:
              drawHorizontalLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 6:
              drawHorizontalRayUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 7:
              drawVerticalLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
            case 8:
              drawCrossLineUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                true
              );
              break;
          }
          break;
        case "Fib":
          switch (prevToolItemNo.peek()) {
            case 0:
              drawFibUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                false,
                true
              );
              break;
            case 1:
              drawTrendFibUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                false,
                true
              );
              break;
            case 2:
              drawFibChannelUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                false,
                true
              );
              break;
            case 3:
              drawFibTimeZoneUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                false,
                true
              );
              break;
            case 4:
              drawTrendFibTimeUsingPoints(
                state,
                prevSelectedCanvas.peek(),
                points,
                false,
                true
              );
              break;
          }
          break;
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
    const isCanvas =
      drawChartobj.ChartRef.current[1] === dateCursor.peek().canvas;
    const { ChartRef, yAxisRef, chartCanvasSize, yAxisRange, chartMovement } =
      drawChartobj;
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
      ctx.fillText(dateCursor.peek().text, 10, 40);
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
    if (
      chartMovement.peek().isItem &&
      chartMovement.peek().itemData?.points !== undefined
    ) {
      const { points, toolName, toolItemNo } = chartMovement.peek().itemData;
      switch (toolName) {
        case "Line":
          switch (toolItemNo) {
            case 0:
              drawTrendLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 1:
              drawRayLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 2:
              drawInfoLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 3:
              drawExtendedLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 4:
              drawTrendAngleUsingPoints(drawChartobj, canvas, points);
              break;
            case 5:
              drawHorizontalLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 6:
              drawHorizontalRayUsingPoints(drawChartobj, canvas, points);
              break;
            case 7:
              drawVerticalLineUsingPoints(drawChartobj, canvas, points);
              break;
            case 8:
              drawCrossLineUsingPoints(drawChartobj, canvas, points);
              break;
          }
          break;
        case "Fib":
          switch (toolItemNo) {
            case 0:
              drawFibUsingPoints(
                drawChartobj,
                canvas,
                points,
                false,
                true,
                ctx
              );
              break;
            case 1:
              drawTrendFibUsingPoints(
                drawChartobj,
                canvas,
                points,
                false,
                true,
                ctx
              );
              break;
            case 2:
              drawFibChannelUsingPoints(
                drawChartobj,
                canvas,
                points,
                false,
                true,
                ctx
              );
              break;
            case 3:
              drawFibTimeZoneUsingPoints(
                drawChartobj,
                canvas,
                points,
                false,
                true,
                ctx
              );
              break;
            case 4:
              drawTrendFibTimeUsingPoints(
                drawChartobj,
                canvas,
                points,
                false,
                true,
                ctx
              );
              break;
          }
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
      isItem: false,
    };
    dateCursor.value = null;
  }
};

export const chartMouseDown = (e, state) => {
  const { chartMovement, ChartRef, trendLinesData, fibData } = state;
  const { selectedTool, selectedItem } = state.ChartWindow;
  const selectedEle = detectTrendLine(e, state);
  if (selectedTool.peek() !== "Cursor") {
    setTool(e, state);
  } else if (selectedEle !== null) {
    switch (selectedEle.toolName) {
      case "Line":
        selectedItem.value = trendLinesData.peek()[selectedEle.index];
        break;
      case "Fib":
        selectedItem.value = fibData.peek()[selectedEle.index];
        break;
    }
    if (selectedEle.selectedPoint !== selectedItem.peek().points.length) {
      prevToolItemNo.value = selectedEle.toolItemNo;
      prevSelectedCanvas.value = ChartRef.current[1];
      selectedTool.value = selectedEle.toolName;
      switch (selectedEle.toolName) {
        case "Line": {
          prevLineData.value = trendLinesData
            .peek()
            [selectedEle.index].points.map((_, i) => {
              if (i !== selectedEle.selectedPoint) return _;
              else return null;
            });
          trendLinesData.value = trendLinesData
            .peek()
            .filter((ele, i) => i !== selectedEle.index);
          drawTrendLines(state);
          break;
        }
        case "Fib": {
          prevLineData.value = fibData
            .peek()
            [selectedEle.index].points.map((_, i) => {
              if (i !== selectedEle.selectedPoint) return _;
              else return null;
            });
          fibData.value = fibData
            .peek()
            .filter((ele, i) => i !== selectedEle.index);
          drawFibs(state);
          break;
        }
      }
    } else {
      chartMovement.value.isItem = true;
      chartMovement.value.itemData = {
        toolItemNo: selectedEle.toolItemNo,
        toolName: selectedEle.toolName,
      };
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
  const {
    chartMovement,
    yAxisConfig,
    yAxisCanvasSize,
    yAxisRange,
    chartCanvasSize,
  } = state;
  const {
    lockUpdatePriceRange,
    timeRange,
    dateConfig,
    xAxisConfig,
    selectedItem,
    drawChartObjects,
  } = state.ChartWindow;
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
      const points = getCoordsArray(state, lineData.points);
      chartMovement.value.mouseMove = true;
      drawChartObjects.peek().forEach((obj) => {
        const { trendLinesData, fibData } = obj;
        switch (chartMovement.peek().itemData.toolName) {
          case "Line":
            trendLinesData.peek().forEach((trendLine, i) => {
              if (trendLine === selectedItem.peek()) {
                trendLinesData.value = trendLinesData
                  .peek()
                  .filter((_, j) => i !== j);
                return;
              }
            });
            break;
          case "Fib":
            fibData.peek().forEach((fib, i) => {
              if (fib === selectedItem.peek()) {
                fibData.value = fibData.peek().filter((_, j) => i !== j);
                return;
              }
            });
            break;
        }
      });
      chartMovement.value.itemData = {
        ...chartMovement.value.itemData,
        points,
      };
    }
    const { points } = chartMovement.peek().itemData;
    points.forEach((_, i) => {
      points[i].x = points[i].x - chartMovement.peek().prevXCoord + e.pageX;
      points[i].y = points[i].y - chartMovement.peek().prevYCoord + e.pageY;
    });
    chartMovement.value.itemData = {
      ...chartMovement.value.itemData,
      points,
    };
    chartMovement.value.prevXCoord = e.pageX;
    chartMovement.value.prevYCoord = e.pageY;
  }
};
export const chartMouseUp = (e, state) => {
  const {
    chartMovement,
    trendLinesData,
    chartCanvasSize,
    yAxisRange,
    data,
    fibData,
  } = state;
  const { xAxisConfig, dateConfig, timeRange } = state.ChartWindow;
  if (!chartMovement.peek().mouseMove && chartMovement.peek().mouseDown) {
    e.target.classList.remove("cursor-grabbing");
    chartMovement.value.mouseDown = false;
    chartMovement.value.isItem = false;
  }
  if (chartMovement.peek().isItem) {
    const { points, toolItemNo, toolName } = chartMovement.peek().itemData;
    const firstIndex =
      dateConfig.peek().dateToIndex[
        getObjtoStringTime(timeRange.peek().startTime)
      ];
    const result = points.map((point, i) => {
      const x1 = point.x;
      const y1 = point.y;
      const dateIndex1 = Math.floor(
        (chartCanvasSize.peek().width - x1) / xAxisConfig.peek().widthOfOneCS
      );
      const cursordata1 = data.peek()[0][firstIndex - dateIndex1];
      let price1 =
        yAxisRange.peek().minPrice +
        ((chartCanvasSize.peek().height - y1) *
          (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
          chartCanvasSize.peek().height;
      return {
        xLabel: cursordata1.Date,
        yLabel: price1.toFixed(2),
      };
    });
    switch (toolName) {
      case "Line":
        {
          trendLinesData.value.push({
            toolItemNo: toolItemNo,
            points: result,
          });
          drawTrendLines(state);
        }
        break;
      case "Fib": {
        fibData.value.push({
          toolItemNo: toolItemNo,
          points: result,
        });
        drawFibs(state, true, true);
      }
    }
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
