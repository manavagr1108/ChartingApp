import { getCoordsArray } from "../../toolsUtils";

export const drawTrendLine = (state, i, lineSelected = false) => {
    const { trendLinesData, ChartRef } = state;
    const canvas = ChartRef.current[0];
    const canvas1 = ChartRef.current[1];
    const ctx = canvas.getContext("2d");
    const ctx1 = canvas1.getContext("2d");
    const lineData = trendLinesData.peek()[i];
    const points = getCoordsArray(state, lineData.points);
    switch (lineData.toolItemNo) {
        case 0: drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1); break;
        case 1: drawRayLineUsingPoints(state, canvas, points, lineSelected, ctx1); break;
        case 2: drawInfoLineUsingPoints(state, canvas, points, lineSelected, ctx1); break;
        case 3: drawExtendedLineUsingPoints(state, canvas, points, lineSelected, ctx1); break;
    }
}

export const drawTrendLineUsingPoints = (state, canvas, points, lineSelected = false, ctx1 = null) => {
    const [startCoords, endCoords] = getCoordsArray(state, points);
    const ctx = canvas.getContext("2d");
    ctx1 = ctx1 === null ? ctx : ctx1;
    ctx.strokeStyle = "Black";
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.lineTo(endCoords.x, endCoords.y);
    ctx.stroke();
    if (lineSelected) {
        ctx1.fillStyle = "White";
        ctx1.strokeStyle = "blue";
        ctx1.beginPath();
        ctx1.arc(startCoords.x, startCoords.y, 5, 0, 2 * Math.PI);
        ctx1.fill();
        ctx1.stroke();
        ctx1.beginPath();
        ctx1.arc(endCoords.x, endCoords.y, 5, 0, 2 * Math.PI);
        ctx1.fill();
        ctx1.stroke();
        ctx1.strokeStyle = "black";
        ctx1.fillStyle = "black";
    }
}
export const drawRayLineUsingPoints = (state, canvas, points, lineSelected = false, ctx1 = null) => {
    const [startCoords, endCoords] = getCoordsArray(state, points);
    const ctx = canvas.getContext('2d');
    ctx1 = ctx1 === null ? ctx : ctx1;
    const slope = (endCoords.y - startCoords.y) / (endCoords.x - startCoords.x);
    const constant = endCoords.y - (slope * endCoords.x);
    const newEndYCoord = endCoords.x > startCoords.x ? slope * canvas.width + constant : slope * 0 + constant;
    const newEndXCoord = (newEndYCoord - constant) / slope;
    if (ctx1 !== null) {
        ctx1.fillStyle = "White";
        ctx1.strokeStyle = "blue";
        ctx1.beginPath();
        ctx1.arc(endCoords.x, endCoords.y, 5, 0, 2 * Math.PI);
        ctx1.fill();
        ctx1.stroke();
        ctx1.strokeStyle = "black";
        ctx1.fillStyle = "black";
    }
    drawTrendLineUsingPoints(state, canvas, [startCoords, { x: newEndXCoord, y: newEndYCoord }], false, ctx1);
}

export const drawExtendedLineUsingPoints = (state, canvas, points, lineSelected = false, ctx1 = null) => {
    const [startCoords, endCoords] = getCoordsArray(state, points);
    const ctx = canvas.getContext('2d');
    ctx1 = ctx1 === null ? ctx : ctx1;
    const slope = (endCoords.y - startCoords.y) / (endCoords.x - startCoords.x);
    const constant = endCoords.y - (slope * endCoords.x);
    const newStartYCoord = endCoords.x < startCoords.x ? slope * canvas.width + constant : slope * 0 + constant;
    const newStartXCoord = (newStartYCoord - constant) / slope;
    const newEndYCoord = endCoords.x > startCoords.x ? slope * canvas.width + constant : slope * 0 + constant;
    const newEndXCoord = (newEndYCoord - constant) / slope;
    if (ctx1 !== null) {
        ctx1.fillStyle = "White";
        ctx1.strokeStyle = "blue";
        ctx1.beginPath();
        ctx1.arc(endCoords.x, endCoords.y, 5, 0, 2 * Math.PI);
        ctx1.fill();
        ctx1.stroke();
        ctx1.beginPath();
        ctx1.arc(startCoords.x, startCoords.y, 5, 0, 2 * Math.PI);
        ctx1.fill();
        ctx1.stroke();
        ctx1.strokeStyle = "black";
        ctx1.fillStyle = "black";
    }
    drawTrendLineUsingPoints(state, canvas, [{ x: newStartXCoord, y: newStartYCoord }, { x: newEndXCoord, y: newEndYCoord }], false, ctx1);
}

export const drawInfoLineUsingPoints = (state, canvas, points, lineSelected = false, ctx1 = null) => {
    const [startCoords, endCoords] = getCoordsArray(state, points);
    const { yAxisRange, chartCanvasSize } = state;
    const { xAxisConfig } = state.ChartWindow;
    const ctx = canvas.getContext('2d');
    ctx1 = ctx1 === null ? ctx : ctx1;
    let price1 =
        yAxisRange.peek().minPrice +
        ((chartCanvasSize.peek().height - startCoords.y) *
            (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
        chartCanvasSize.peek().height;
    let price2 =
        yAxisRange.peek().minPrice +
        ((chartCanvasSize.peek().height - endCoords.y) *
            (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
        chartCanvasSize.peek().height;
    const dateIndex1 = Math.floor(
        (chartCanvasSize.peek().width - startCoords.x) / xAxisConfig.peek().widthOfOneCS
    );
    const dateIndex2 = Math.floor(
        (chartCanvasSize.peek().width - endCoords.x) / xAxisConfig.peek().widthOfOneCS
    );
    drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
    ctx.beginPath();
    ctx.clearRect((startCoords.x + endCoords.x) / 2 + 10, (startCoords.y + endCoords.y) / 2 + 10, 200, 50);
    ctx.fillStyle = "rgba(58,220,255,0.3)"
    ctx.rect((startCoords.x + endCoords.x) / 2 + 10, (startCoords.y + endCoords.y) / 2 + 10, 200, 50);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillText(`↕ ${(price2 - price1).toFixed(2)} (${((price2 - price1) / price1 * 100).toFixed(2)}%)`, (startCoords.x + endCoords.x) / 2 + 20, (startCoords.y + endCoords.y) / 2 + 30);
    ctx.fillText(`↔ ${Math.abs(dateIndex1 - dateIndex2)} Number of Bars; ${Math.abs(startCoords.x - endCoords.x).toFixed(2)}px`, (startCoords.x + endCoords.x) / 2 + 20, (startCoords.y + endCoords.y) / 2 + 50);
    ctx.stroke();
}


export const drawTrendLines = (state) => {
    const { trendLinesData } = state;
    trendLinesData.peek().forEach((lineData, i) => {
        drawTrendLine(state, i);
    })
}