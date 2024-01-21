import { cursorConfig, prevLineData, prevSelectedCanvas } from "../signals/toolbarSignals";
import { drawTrendLine, drawTrendLines } from "./drawUtils";
import { getObjtoStringTime, getXCoordinate } from "./xAxisUtils";
import { getYCoordinate } from "./yAxisUtils";

export const isCursorOnLine = (e, lineData, state) => {
    const {
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
    } = lineData;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;
    const slope = (startYCoord - endYCoord) / (startXCoord - endXCoord);
    const constant = startYCoord - slope * startXCoord;
    return parseInt(y) === parseInt(slope * x + constant) || parseInt(y) - 1 === parseInt(slope * x + constant) || parseInt(y) + 1 === parseInt(slope * x + constant) || parseInt(y) + 2 === parseInt(slope * x + constant) || parseInt(y) - 2 === parseInt(slope * x + constant);
}

export const detectTrendLine = (e, state) => {
    const { chartCanvasSize, yAxisRange, trendLinesData } = state;
    const { dateConfig, xAxisConfig, timeRange, selectedCursor } = state.ChartWindow;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;
    if (canvas.classList.contains('cursor-pointer')) {
        canvas.classList.remove("cursor-pointer");
        canvas.classList.add(`cursor-${cursorConfig[selectedCursor.value]}`);
    }
    trendLinesData.peek().forEach((lineData, i) => {
        const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.startPoint.xLabel];
        const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.endPoint.xLabel];
        const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
        const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
        const endXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
        const startYCoord = getYCoordinate(lineData.startPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const endYCoord = getYCoordinate(lineData.endPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        if (startXCoord > endXCoord && (x < startXCoord && x > endXCoord)) {
            if (startYCoord > endYCoord && (y < startYCoord && y > endYCoord)) {
                const online = isCursorOnLine(e, {
                    startXCoord,
                    endXCoord,
                    startYCoord,
                    endYCoord
                }, state);
                if (online) {
                    canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
                    canvas.classList.add("cursor-pointer");
                    drawTrendLine(state, i, true);
                    return lineData;
                }
            } else if (startYCoord < endYCoord && (y > startYCoord && y < endYCoord)) {
                const online = isCursorOnLine(e, {
                    startXCoord,
                    endXCoord,
                    startYCoord,
                    endYCoord
                }, state);
                if (online) {
                    canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
                    canvas.classList.add("cursor-pointer");
                    drawTrendLine(state, i, true);
                    return lineData;
                }
            }
        } else if (startXCoord < endXCoord && (x > startXCoord && x < endXCoord)) {
            if (startYCoord > endYCoord && (y < startYCoord && y > endYCoord)) {
                const online = isCursorOnLine(e, {
                    startXCoord,
                    endXCoord,
                    startYCoord,
                    endYCoord
                }, state);
                if (online) {
                    canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
                    canvas.classList.add("cursor-pointer");
                    drawTrendLine(state, i, true);
                    return lineData;
                }
            } else if (startYCoord < endYCoord && (y > startYCoord && y < endYCoord)) {
                const online = isCursorOnLine(e, {
                    startXCoord,
                    endXCoord,
                    startYCoord,
                    endYCoord
                }, state);
                if (online) {
                    canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
                    canvas.classList.add("cursor-pointer");
                    drawTrendLine(state, i, true);
                    return lineData;
                }
            }
        }
    })
    return null;
}

export const setTrendLine = (e, state) => {
    const { chartCanvasSize, data, yAxisRange, ChartRef } = state;
    const { dateConfig, xAxisConfig, timeRange, selectedTool } = state.ChartWindow;
    const canvas = ChartRef.current[1];
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
    let price =
        yAxisRange.peek().minPrice +
        ((chartCanvasSize.peek().height - y) *
            (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
        chartCanvasSize.peek().height;
    if (price > yAxisRange.peek().maxPrice) {
        price = yAxisRange.peek().maxPrice;
    } else if (price < yAxisRange.peek().minPrice) {
        price = yAxisRange.peek().minPrice;
    }
    const priceText = price.toFixed(2);
    const lineStartPoint = {
        xLabel: cursordata.Date,
        yLabel: priceText,
    }
    if (prevLineData.peek() !== null) {
        state.ChartWindow.drawChartObjects.peek().forEach((obj) => {
            if (obj.ChartRef.current[1] === prevSelectedCanvas.peek()) {
                obj.trendLinesData.value.push({
                    startPoint: prevLineData.peek(),
                    endPoint: lineStartPoint,
                    path: null
                })
                drawTrendLines(obj);
                prevLineData.value = null;
                prevSelectedCanvas.value = null;
                selectedTool.value = 'Cursor';
            }
        })
    } else {
        const ctx = canvas.getContext("2d");
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        prevLineData.value = lineStartPoint;
        prevSelectedCanvas.value = canvas;
    }
}
