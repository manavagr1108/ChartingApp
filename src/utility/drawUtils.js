import { monthMap } from "../data/TIME_MAP";
import {
    indicatorConfig,
} from "../config/indicatorsConfig";
import { calculateEMA, calculateSMA, calculateZigZag } from "./indicatorsUtil";
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
import { drawLinesData, prevLineData, prevSelectedCanvas, selectedLine } from "../signals/toolbarSignals";

export function drawChart(state, mode) {
    const { data, yAxisRange, ChartRef, yAxisRef, chartCanvasSize } = state;
    const { xAxisRef, dateConfig, timeRange, xAxisConfig, chartType, selectedStock } = state.ChartWindow;
    if (
        data.peek().length === 0 ||
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
    ctx.fillText(selectedStock.peek(), 10, 20);
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
    });
    drawIndicators(startIndex, endIndex, ctx, mode, state);
    state.ChartWindow.drawChartObjects.peek().forEach(obj => drawTrendLines(obj));
}

export function drawIndicators(startIndex, endIndex, ctx, mode, state) {
    const { data } = state;
    const { onChartIndicatorSignal } = state.ChartWindow;
    onChartIndicatorSignal.peek().forEach((indicator) => {
        if (indicator.label === indicatorConfig["SMA"].label) {
            const smaData = calculateSMA(data.peek(), indicator.period);
            const SMA = smaData
                .slice(startIndex - indicator.period + 1, endIndex + 1)
                .reverse();
            drawSMAIndicator(indicator, ctx, SMA, mode, state);
        }
        if (indicator.label === indicatorConfig["EMA"].label) {
            const emaData = calculateEMA(data.peek(), indicator.period);
            const EMA = emaData
                .slice(startIndex - indicator.period + 1, endIndex + 1)
                .reverse();
            drawEMAIndicator(indicator, ctx, EMA, mode, state);
        }
        if (indicator.label === indicatorConfig["ZigZag"].label) {
            const zigZagData = calculateZigZag(
                data.peek(),
                indicator.deviation,
                indicator.pivotLegs
            );
            drawZigZagIndicator(ctx, zigZagData, mode, startIndex, endIndex, state);
        }
    });
}

export function drawRSIIndicatorChart(state, mode) {
    const { yAxisRange, yAxisConfig, ChartRef, yAxisRef, chartCanvasSize, yAxisCanvasSize, data } = state;
    const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } = state.ChartWindow;
    if (
        data.peek().length === 0 ||
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
            // drawCandleStick(
            //   d,
            //   yAxisRange.peek().minPrice,
            //   yAxisRange.peek().maxPrice,
            //   chartCanvasSize.peek().height,
            //   xCoord,
            //   ctx,
            //   xAxisConfig.peek().widthOfOneCS - 2
            // );
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
}
export function drawSMAIndicator(
    indicator,
    ctx,
    smaData,
    mode,
    state
) {
    const { chartCanvasSize, yAxisRange } = state;
    const { timeRange, xAxisConfig } = state.ChartWindow;
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
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        if (i === 0) ctx.moveTo(xCoord, yCoord);
        else ctx.lineTo(xCoord, yCoord);
    });
    ctx.stroke();
    ctx.lineWidth = 1;
}

export function drawEMAIndicator(
    indicator,
    ctx,
    emaData,
    mode,
    state
) {
    const { chartCanvasSize, yAxisRange } = state;
    const { xAxisConfig, timeRange } = state.ChartWindow;
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
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        if (i === 0) ctx.moveTo(xCoord, yCoord);
        else ctx.lineTo(xCoord, yCoord);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
}

export function drawZigZagIndicator(
    ctx,
    zigZagData,
    mode,
    startIndex,
    endIndex,
    state
) {
    const { chartCanvasSize, yAxisRange, data } = state;
    const { dateConfig, timeRange, xAxisConfig } = state.ChartWindow;
    const zigzagColor = mode === "Light" ? "#0b69ac" : "#f0a70b";
    ctx.lineWidth = 1;
    ctx.strokeStyle = zigzagColor;
    ctx.beginPath();
    for (let i = startIndex; i <= endIndex; i++) {
        if (zigZagData[data.peek()[i].Date]) {
            const index = endIndex - i;
            if (flag === false) {
                const zigZagValues = Object.values(zigZagData);
                const index1 =
                    dateConfig.peek().dateToIndex[
                    zigZagValues[zigZagData[data.peek()[i].Date].index - 1]?.date
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
                        zigZagValues[zigZagData[data.peek()[i].Date].index - 1]?.value,
                        yAxisRange.peek().minPrice,
                        yAxisRange.peek().maxPrice,
                        chartCanvasSize.peek().height
                    )
                );
                flag = true;
            }
            const price = zigZagData[data.peek()[i].Date].value;
            const xCoord = getXCoordinate(
                chartCanvasSize.peek().width,
                xAxisConfig.peek().widthOfOneCS,
                timeRange.peek().scrollDirection,
                timeRange.peek().scrollOffset,
                index
            );
            const yCoord = getYCoordinate(
                price,
                yAxisRange.peek().minPrice,
                yAxisRange.peek().maxPrice,
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
            data.peek()[endIndex].Low,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        )
    );
    ctx.stroke();
}

export const drawTrendLine = (state, i, lineSelected = false) => {
    const { chartCanvasSize, yAxisRange, trendLinesData, ChartRef } = state;
    const { dateConfig, xAxisConfig, timeRange } = state.ChartWindow;
    const canvas = ChartRef.current[0];
    const canvas1 = ChartRef.current[1];
    const ctx = canvas.getContext("2d");
    const ctx1 = canvas1.getContext("2d");
    const lineData = trendLinesData.peek()[i];
    const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.startPoint.xLabel];
    const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.endPoint.xLabel];
    const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
    const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
    const endXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
    const startYCoord = getYCoordinate(lineData.startPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    const endYCoord = getYCoordinate(lineData.endPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    switch (lineData.toolItemNo) {
        case 0: drawTrendLineUsingPoints(ctx, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, ctx1);
    }
}

export const drawTrendLineUsingPoints = (ctx, startCoords, endCoords, lineSelected = false, ctx1 = null) => {
    ctx1 = ctx1 === null ? ctx : ctx1;
    ctx.strokeStyle = "Black";
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.lineTo(endCoords.x, endCoords.y);
    ctx.stroke();
    ctx.strokeStyle = "Black";
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


export const drawTrendLines = (state) => {
    const { trendLinesData } = state;
    trendLinesData.peek().forEach((lineData, i) => {
        drawTrendLine(state, i);
    })
}