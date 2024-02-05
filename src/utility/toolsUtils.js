import { cursorConfig, prevLineData, prevSelectedCanvas, prevToolItemNo } from "../signals/toolbarSignals";
import { drawFib, drawFibs } from "./drawUtils/toolsDraw/fibTool";
import { drawTrendLine, drawTrendLines } from "./drawUtils/toolsDraw/lineTool";
import { getObjtoStringTime, getXCoordinate } from "./xAxisUtils";
import { getYCoordinate } from "./yAxisUtils";

function isIntersect(x, y, startXCoord, startYCoord, radius) {
    return Math.sqrt((x - startXCoord) ** 2 + (y - startYCoord) ** 2) <= radius;
}


export const getCoordsArray = (state, points) => {
    const { chartCanvasSize, yAxisRange } = state
    const { timeRange, xAxisConfig, dateConfig } = state.ChartWindow;
    const firstIndex =
        dateConfig.peek().dateToIndex[
        getObjtoStringTime(timeRange.peek().startTime)
        ];
    const coordsArray = [];
    points.forEach((point, index) => {
        if (point.x !== undefined) {
            coordsArray.push({
                x: point.x,
                y: point.y
            })
        } else {
            const prevXCoordIndex = dateConfig.peek().dateToIndex[point.xLabel];
            const xCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - prevXCoordIndex);
            const yCoord = getYCoordinate(parseFloat(point.yLabel), yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
            coordsArray.push({
                x: xCoord,
                y: yCoord
            })
        }
    })
    return coordsArray;
}
function isCursorOnTrendLine(e, lineData, state) {
    let {
        points
    } = lineData;
    const canvas = state.ChartRef.current[1];
    let [startCoords, endCoords] = points;
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (x > Math.max(startCoords.x, endCoords.x) || x < Math.min(startCoords.x, endCoords.x)) return -1;
    if (isIntersect(x, y, startCoords.x + 5, startCoords.y + 5, 5)) return 0;
    if (isIntersect(x, y, endCoords.x - 5, endCoords.y - 5, 5)) return 1;
    const slope = (startCoords.y - endCoords.y) / (startCoords.x - endCoords.x);
    const constant = startCoords.y - slope * startCoords.x;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 2;
    }
    return -1;
}
function isCursorOnRayLine(e, lineData, state) {
    let {
        points
    } = lineData;
    let [startCoords, endCoords] = points;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (startCoords.x < endCoords.x) {
        if (x < startCoords.x) return -1;
    } else if (endCoords.x > startCoords.x) {
        if (x > startCoords.x) return -1;
    }
    if (isIntersect(x, y, startCoords.x + 5, startCoords.y + 5, 5)) return 0;
    if (isIntersect(x, y, endCoords.x - 5, endCoords.y - 5, 5)) return 1;
    const slope = (startCoords.y - endCoords.y) / (startCoords.x - endCoords.x);
    const constant = startCoords.y - slope * startCoords.x;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 2;
    }
    return -1;
}
function isCursorOnExtendedLine(e, lineData, state) {
    let {
        points
    } = lineData;
    let [startCoords, endCoords] = points;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    if (isIntersect(x, y, startCoords.x + 5, startCoords.y + 5, 5)) return 0;
    if (isIntersect(x, y, endCoords.x - 5, endCoords.y - 5, 5)) return 1;
    const slope = (startCoords.y - endCoords.y) / (startCoords.x - endCoords.x);
    const constant = startCoords.y - slope * startCoords.x;
    for (let i = -5; i < 5; i++) {
        if (parseInt(y) + i === parseInt(slope * x + constant)) return 2;
    }
    return -1;
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
        points
    } = fibData;
    let [startCoords, endCoords] = points;
    if (startCoords.y < e) {
        const temp = endCoords.y;
        startCoords.y = endCoords.y;
        endCoords.y = temp;
    }
    if (startCoords.x > endCoords.x) {
        const temp = startCoords.x;
        startCoords.x = endCoords.x;
        endCoords.x = temp;
    }
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    let result = 0;
    let prevY = 0;
    fibValues.forEach((val) => {
        const yi = Math.abs(val * (endCoords.y - startCoords.y));
        if (x < startCoords.x || x > endCoords.x) return -1;
        for (let i = -5; i <= 5; i++) {
            if (parseInt(y) + i === parseInt(prevY + endCoords.y)) {
                result = 1;
            }
            prevY = yi;
        }

    })
    return result;
}

export const isCursorOnFibRevLine = (e, fibData, state) => {
    let {
        points
    } = fibData;
    let [lineStartCoords, lineEndCoords, fibEndCoords] = points;
    if (fibEndCoords.x > lineEndCoords.x) {
        const temp = fibEndCoords.x;
        fibEndCoords.x = lineEndCoords.x;
        lineEndCoords.x = temp;
    }
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    let result = 0;
    fibValues.forEach((val) => {
        const yi = Math.abs(val * (lineStartCoords.y - lineEndCoords.y));
        if (x < fibEndCoords.x || x > lineEndCoords.x) return -1;
        for (let i = -5; i <= 5; i++) {
            if (parseInt(y) + i === parseInt(fibEndCoords.y - yi)) {
                result = 1;
                break;
            }
        }

    })
    return result;
}

export const isCursorOnFibChannelLine = (e, fibData, state) => {
    let {
        points
    } = fibData;
    let [lineStartCoords, lineEndCoords, fibEndCoords] = points;
    if (fibEndCoords.x > lineEndCoords.x) {
        const temp = fibEndCoords.x;
        fibEndCoords.x = lineEndCoords.x;
        lineEndCoords.x = temp;
    }
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    let result = 0;
    fibValues.forEach((val) => {
        // if (x < fibEndCoords.x || x > lineEndCoords.x) return -1;
        const len = (Math.sqrt((fibEndCoords.y - lineStartCoords.y) ** 2 + (fibEndCoords.x - lineStartCoords.x) ** 2));
        const yi = Math.abs(val * len);
        const cos0 = (fibEndCoords.x - lineStartCoords.x) / len;
        const sin0 = (fibEndCoords.y - lineStartCoords.y) / len;
        const x3 = yi * cos0 + lineStartCoords.x;
        const y3 = yi * sin0 + lineStartCoords.y;

        const slope1 = (fibEndCoords.y - lineStartCoords.y) / (fibEndCoords.x - lineStartCoords.x);
        const constant1 = lineEndCoords.y - slope1 * lineEndCoords.x;

        const slope2 = (lineEndCoords.y - lineStartCoords.y) / (lineEndCoords.x - lineStartCoords.x);
        const constant2 = y3 - slope2 * x3;

        const x4 = (constant2 - constant1) / (slope1 - slope2);
        const y4 = slope1 * x4 + constant1;
        if (isCursorOnTrendLine(e, { points: [{ x: x3, y: y3 }, { x: x4, y: y4 }] }, state) !== -1) {
            result = 1;
        }

    })
    return result;
}


export const isCursorOnFibTimeZoneLine = (e, fibData, state) => {
    let {
        points
    } = fibData;
    const [lineStartCoords, lineEndCoords] = points;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 1, 2, 3, 5, 8, 13, 21];
    let result = 0;
    fibValues.forEach((val) => {
        const width = val * (lineEndCoords.x - lineStartCoords.x);
        for (let i = -5; i < 5; i++) {
            if (parseInt(x) + i === parseInt(lineStartCoords.x + width)) {
                result = 1;
                return 1;
            }
        }
    })
    return result;
}

export const isCursorOnTrendBasedFibTimeZoneLine = (e, fibData, state) => {
    let {
        points
    } = fibData;
    const [lineStartCoords, lineEndCoords, fibEndCoords] = points;
    const canvas = state.ChartRef.current[1];
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(e.pageX - rect.left);
    const y = parseInt(e.pageY - rect.top);
    const fibValues = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    let result = 0;
    fibValues.forEach((val) => {
        const len = (lineEndCoords.x - lineStartCoords.x);
        const yi = Math.abs(val * len);
        for (let i = -5; i < 5; i++) {
            if (parseInt(x) + i === parseInt(fibEndCoords.x + yi)) {
                result = 1;
                return 1;
            }
        }
    })
    return result;
}

export const isCursorFib = (e, fibData, state) => {
    const { toolItemNo, points } = fibData;
    switch (toolItemNo) {
        case 0: {
            const onDiagonal = isCursorOnTrendLine(e, fibData, state);
            if (onDiagonal !== -1) return onDiagonal;
            if (isCursorOnFibLine(e, fibData, state) === 1) return points.length;
            return -1;
        }
        case 1: {
            const onDiagonal1 = isCursorOnTrendLine(e, { points: points.slice(0, 2) }, state);
            const onDiagonal2 = isCursorOnTrendLine(e, { points: points.slice(1, 3) }, state);
            if (onDiagonal1 !== -1) {
                if (onDiagonal1 === 2) return points.length;
                return onDiagonal1;
            }
            if (onDiagonal2 !== -1) {
                if (onDiagonal2 === 2) return points.length;
                return onDiagonal2 + 1;
            }
            if (isCursorOnFibRevLine(e, fibData, state) === 1) return points.length;
            return -1;
        }
        case 2: {
            const onDiagonal1 = isCursorOnTrendLine(e, { points: points.slice(0, 2) }, state);
            const onDiagonal2 = isCursorOnTrendLine(e, { points: points.slice(1, 3) }, state);
            if (onDiagonal1 !== -1) {
                if (onDiagonal1 === 2) return points.length;
                return onDiagonal1;
            }
            if (onDiagonal2 !== -1) {
                if (onDiagonal2 === 2) return points.length;
                return onDiagonal2 + 1;
            }
            if (isCursorOnFibChannelLine(e, fibData, state) === 1) return points.length;
            return -1;
        }
        case 3: {
            const onDiagonal = isCursorOnTrendLine(e, fibData, state);
            if (onDiagonal !== -1) return onDiagonal;
            if (isCursorOnFibTimeZoneLine(e, fibData, state) === 1) return points.length;
            return -1;
        }
        case 4: {
            const onDiagonal1 = isCursorOnTrendLine(e, { points: points.slice(0, 2) }, state);
            const onDiagonal2 = isCursorOnTrendLine(e, { points: points.slice(1, 3) }, state);
            if (onDiagonal1 !== -1) {
                if (onDiagonal1 === 2) return points.length;
                return onDiagonal1;
            }
            if (onDiagonal2 !== -1) {
                if (onDiagonal2 === 2) return points.length;
                return onDiagonal2 + 1;
            }
            if (isCursorOnTrendBasedFibTimeZoneLine(e, fibData, state) === 1) return points.length;
            return -1;
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
        const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
        const points = [];
        lineData.points.forEach((point, i) => {
            const startXCoordIndex = dateConfig.peek().dateToIndex[point.xLabel];
            const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
            const startYCoord = getYCoordinate(point.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
            points.push({
                x: startXCoord,
                y: startYCoord
            })
        })
        const toolItemNo = lineData.toolItemNo;
        const online = isCursorOnLine(e, {
            points,
            toolItemNo
        }, state);
        if (online === points.length) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-pointer");
            drawTrendLine(state, i, true);
            returnVal = {
                ...lineData,
                selectedPoint: online,
                index: i,
                toolItemNo,
                toolName: 'Line'
            };
            return lineData;
        }
        if (online !== -1) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-default");
            drawTrendLine(state, i, true);
            returnVal = {
                selectedPoint: online,
                index: i,
                toolItemNo,
                toolName: 'Line'
            }
            return lineData.startPoint;
        }
    })
    fibData.peek().forEach((fib, i) => {
        const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
        const points = [];
        fib.points.forEach((point, i) => {
            const startXCoordIndex = dateConfig.peek().dateToIndex[point.xLabel];
            const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
            const startYCoord = getYCoordinate(point.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
            points.push({
                x: startXCoord,
                y: startYCoord
            })
        })
        const toolItemNo = fib.toolItemNo;
        const online = isCursorFib(e, {
            points,
            toolItemNo
        }, state);
        if (online === points.length) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-pointer");
            drawFib(state, i, true, true);
            returnVal = {
                ...fib,
                selectedPoint: online,
                index: i,
                toolItemNo,
                toolName: 'Fib'
            };
            return;
        }
        if (online !== -1) {
            canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
            canvas.classList.add("cursor-default");
            drawFib(state, i, true, true);
            returnVal = {
                selectedPoint: online,
                index: i,
                toolItemNo,
                toolName: 'Fib'
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
                let flag = 0;
                const points = [];
                prevLineData.peek().forEach((point) => {
                    if (point === null) {
                        flag = 1;
                        points.push(lineStartPoint);
                    } else {
                        points.push(point);
                    }
                });
                if (flag === 0) points.push(lineStartPoint);
                obj.trendLinesData.value.push({
                    toolItemNo: selectedToolItem.peek(),
                    points: points
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

const setToolData = (state, lineStartPoint) => {
    const { selectedTool, selectedToolItem } = state.ChartWindow;
    state.ChartWindow.drawChartObjects.peek().forEach((obj) => {
        if (obj.ChartRef.current[1] === prevSelectedCanvas.peek()) {
            let flag = 0;
            const points = [];
            prevLineData.peek().forEach((point) => {
                if (point === null) {
                    flag = 1;
                    points.push(lineStartPoint);
                } else {
                    points.push(point);
                }
            });
            if (flag === 0) points.push(lineStartPoint);
            obj.fibData.value.push({
                points: points,
                toolItemNo: selectedToolItem.peek(),
            })
            drawFibs(obj, true, false);
            prevLineData.value = null;
            prevToolItemNo.value = null;
            prevSelectedCanvas.value = null;
            selectedTool.value = 'Cursor';
        }
    })
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
        switch (prevToolItemNo.peek()) {
            case 0: {
                setToolData(state, lineStartPoint);
                break;
            }
            case 1: {
                if (prevLineData.peek().length === 1) {
                    const ctx = canvas.getContext("2d");
                    ctx.font = "12px Arial";
                    ctx.fillStyle = 'White';
                    ctx.strokeStyle = "blue";
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    prevLineData.value = [...prevLineData.peek(), lineStartPoint];
                    prevToolItemNo.value = selectedToolItem.peek();
                    prevSelectedCanvas.value = canvas;
                } else {
                    setToolData(state, lineStartPoint);
                }
                break;
            }
            case 2: {
                if (prevLineData.peek().length === 1) {
                    const ctx = canvas.getContext("2d");
                    ctx.font = "12px Arial";
                    ctx.fillStyle = 'White';
                    ctx.strokeStyle = "blue";
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    prevLineData.value = [...prevLineData.peek(), lineStartPoint];
                    prevToolItemNo.value = selectedToolItem.peek();
                    prevSelectedCanvas.value = canvas;
                } else {
                    setToolData(state, lineStartPoint);
                }
                break;
            }
            case 3: {
                setToolData(state, lineStartPoint);
                break;
            }
            case 4: {
                if (prevLineData.peek().length === 1) {
                    const ctx = canvas.getContext("2d");
                    ctx.font = "12px Arial";
                    ctx.fillStyle = 'White';
                    ctx.strokeStyle = "blue";
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    prevLineData.value = [...prevLineData.peek(), lineStartPoint];
                    prevToolItemNo.value = selectedToolItem.peek();
                    prevSelectedCanvas.value = canvas;
                } else {
                    setToolData(state, lineStartPoint);
                }
                break;
            }
        }
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
