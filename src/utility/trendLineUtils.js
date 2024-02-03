import { cursorConfig, prevLineData, prevSelectedCanvas, prevToolItemNo } from "../signals/toolbarSignals";
import { drawFib } from "./drawUtils";
import { drawFibs } from "./drawUtils";
import { drawTrendLine, drawTrendLines } from "./drawUtils";
import { getObjtoStringTime, getXCoordinate } from "./xAxisUtils";
import { getYCoordinate } from "./yAxisUtils";

function isIntersect(x, y, startXCoord, startYCoord, radius) {
    return Math.sqrt((x - startXCoord) ** 2 + (y - startYCoord) ** 2) <= radius;
}
function isCursorOnTrendLine(e, lineData, state) {
    const {
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
    } = lineData;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (x > Math.max(startXCoord, endXCoord) || x < Math.min(startXCoord, endXCoord)) return 0;
    if (isIntersect(x, y, startXCoord + 5, startYCoord + 5, 5)) return 2;
    if (isIntersect(x, y, endXCoord - 5, endYCoord - 5, 5)) return 3;
    const slope = (startYCoord - endYCoord) / (startXCoord - endXCoord);
    const constant = startYCoord - slope * startXCoord;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 1;
    }
    return 0;
}
function isCursorOnRayLine(e, lineData, state) {
    const {
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
    } = lineData;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (startXCoord < endXCoord) {
        if (x < startXCoord) return 0;
    } else if (endXCoord > startXCoord) {
        if (x > startXCoord) return 0;
    }
    if (isIntersect(x, y, startXCoord + 5, startYCoord + 5, 5)) return 2;
    if (isIntersect(x, y, endXCoord - 5, endYCoord - 5, 5)) return 3;
    const slope = (startYCoord - endYCoord) / (startXCoord - endXCoord);
    const constant = startYCoord - slope * startXCoord;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 1;
    }
    return 0;
}
function isCursorOnExtendedLine(e, lineData, state) {
    const {
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
    } = lineData;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (isIntersect(x, y, startXCoord + 5, startYCoord + 5, 5)) return 2;
    if (isIntersect(x, y, endXCoord - 5, endYCoord - 5, 5)) return 3;
    const slope = (startYCoord - endYCoord) / (startXCoord - endXCoord);
    const constant = startYCoord - slope * startXCoord;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 1;
    }
    return 0;
}
export const isCursorOnLine = (e, lineData, state) => {
    const { toolItemNo } = lineData;
    switch (toolItemNo) {
        case 0: return isCursorOnTrendLine(e, lineData, state);
        case 1: return isCursorOnRayLine(e, lineData, state);
        case 2: return isCursorOnTrendLine(e, lineData, state);
        case 3: return isCursorOnExtendedLine(e, lineData, state);
    }
}

export const isCursorOnFibLine = (e, fibData, state) => {
    let {
        startXCoord,
        endXCoord,
        startYCoord,
        endYCoord
    } = fibData;
    if (startYCoord < endYCoord) {
        const temp = startYCoord;
        startYCoord = endYCoord;
        endYCoord = temp;
    }
    if (startXCoord > endXCoord) {
        const temp = startXCoord;
        startXCoord = endXCoord;
        endXCoord = temp;
    }
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    let result = 0;
    let prevY = 0;
    fibValues.forEach((val) => {
        const yi = Math.abs(val * (endYCoord - startYCoord));
        if(x < startXCoord || x > endXCoord) return 0;
        for (let i = -5; i <= 5; i++) {
            if (parseInt(y) + i === parseInt(prevY + endYCoord)) {
                result = 1;
            }
            prevY = yi;
        }

    })
    return result;
}

export const isCursorFib = (e, fibData, state) => {
    const { toolItemNo } = fibData;
    switch (toolItemNo) {
        case 0: {
            const onDiagonal = isCursorOnTrendLine(e, fibData, state);
            if(onDiagonal !== 0) return onDiagonal;
            return isCursorOnFibLine(e, fibData, state);
        }
    }
}

export const detectTrendLine = (e, state) => {
    const { chartCanvasSize, yAxisRange, trendLinesData, fibData } = state;
    const { dateConfig, xAxisConfig, timeRange, selectedCursor } = state.ChartWindow;
    const canvas = e.target;
    if (canvas.classList.contains('cursor-pointer')) {
        canvas.classList.remove("cursor-pointer");
        canvas.classList.add(`cursor-${cursorConfig[selectedCursor.value]}`);
    }
    if (canvas.classList.contains('cursor-default')) {
        canvas.classList.remove("cursor-default");
        canvas.classList.add(`cursor-${cursorConfig[selectedCursor.value]}`);
    }
    let returnVal = null
    trendLinesData.peek().forEach((lineData, i) => {
        const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.points[0].xLabel];
        const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.points[1].xLabel];
        const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
        const startXCoord = -5 + getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
        const endXCoord = 5 + getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
        const startYCoord = -5 + getYCoordinate(lineData.points[0].yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const endYCoord = 5 + getYCoordinate(lineData.points[1].yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const toolItemNo = lineData.toolItemNo;
        const online = isCursorOnLine(e, {
            startXCoord,
            endXCoord,
            startYCoord,
            endYCoord,
            toolItemNo
        }, state);
        if (online === 1) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-pointer");
            drawTrendLine(state, i, true);
            returnVal = {
                ...lineData,
                index: i,
                toolItemNo,
                toolName: 'Line'
            };
            return lineData;
        }
        if (online === 2 || online === 3) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-default");
            drawTrendLine(state, i, true);
            if (online == 2) {
                returnVal = {
                    startPoint: null,
                    endPoint: lineData.points[1],
                    points: [],
                    index: i,
                    toolItemNo,
                    toolName: 'Line'
                }
            } else {
                returnVal = {
                    startPoint: lineData.points[0],
                    endPoint: null,
                    index: i,
                    toolItemNo,
                    toolName: 'Line'
                }
            }
            return lineData.startPoint;
        }
    })
    fibData.peek().forEach((fib, i) => {
        const startXCoordIndex = dateConfig.peek().dateToIndex[fib.points[0].xLabel];
        const endXCoordIndex = dateConfig.peek().dateToIndex[fib.points[1].xLabel];
        const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
        const startXCoord = -5 + getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
        const endXCoord = 5 + getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
        const startYCoord = -5 + getYCoordinate(fib.points[0].yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const endYCoord = 5 + getYCoordinate(fib.points[1].yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const toolItemNo = fib.toolItemNo;
        const online = isCursorFib(e, {
            startXCoord,
            endXCoord,
            startYCoord,
            endYCoord,
            toolItemNo
        }, state);
        if (online === 1) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-pointer");
            drawFib(state, i, true, true);
            returnVal = {
                ...fib,
                index: i,
                toolItemNo,
                toolName: 'Fib'
            };
            return;
        }
        if (online === 2 || online === 3) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-default");
            drawFib(state, i, true, true);
            if (online == 2) {
                returnVal = {
                    startPoint: null,
                    endPoint: fib.points[1],
                    index: i,
                    toolItemNo,
                    toolName: 'Fib'
                }
            } else {
                returnVal = {
                    startPoint: fib.points[0],
                    endPoint: null,
                    index: i,
                    toolItemNo,
                    toolName: 'Fib'
                }
            }
            return;
        }
    })
    return returnVal;
}
export const setTool = (e, state) => {
    const { selectedTool, selectedToolItem } = state.ChartWindow;
    switch (selectedTool.peek()) {
        case 'Line': setTrendLine(e, state); break;
        case 'Fib': setFibTool(e, state); break;
    }
}
export const setTrendLine = (e, state) => {
    const { chartCanvasSize, data, yAxisRange, ChartRef } = state;
    const { dateConfig, xAxisConfig, timeRange, selectedTool, selectedToolItem } = state.ChartWindow;
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
    const cursordata = data.peek()[0][firstIndex - dateIndex];
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
                    toolItemNo: selectedToolItem.peek(),
                    points: [...prevLineData.peek(), lineStartPoint]
                })
                drawTrendLines(obj);
                prevLineData.value = null;
                prevToolItemNo.value = null;
                prevSelectedCanvas.value = null;
                selectedTool.value = 'Cursor';
            }
        })
    } else {
        const ctx = canvas.getContext("2d");
        ctx.font = "12px Arial";
        ctx.fillStyle = 'White';
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        prevLineData.value = [lineStartPoint];
        prevToolItemNo.value = selectedToolItem.peek();
        prevSelectedCanvas.value = canvas;
    }
}

export const setFibTool = (e, state) => {
    const { chartCanvasSize, data, yAxisRange, ChartRef } = state;
    const { dateConfig, xAxisConfig, timeRange, selectedTool, selectedToolItem } = state.ChartWindow;
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
    const cursordata = data.peek()[0][firstIndex - dateIndex];
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
                obj.fibData.value.push({
                    points: [...prevLineData.peek(), lineStartPoint],
                    toolItemNo: selectedToolItem.peek(),
                })
                drawFibs(obj, true, false);
                prevLineData.value = null;
                prevToolItemNo.value = null;
                prevSelectedCanvas.value = null;
                selectedTool.value = 'Cursor';
            }
        })
    } else {
        const ctx = canvas.getContext("2d");
        ctx.font = "12px Arial";
        ctx.fillStyle = 'White';
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        prevLineData.value = [lineStartPoint];
        prevToolItemNo.value = selectedToolItem.peek();
        prevSelectedCanvas.value = canvas;
    }
}
