import {
    indicatorConfig,
} from "../../config/indicatorsConfig";
import { monthMap } from "../../data/TIME_MAP";
import {
    getObjtoStringTime,
    getXCoordinate,
} from "../xAxisUtils";
import {
    getYCoordinate,
} from "../yAxisUtils";
import { drawBarChart, drawLineChart, drawYAxis } from "./chartDraw";

export function drawIndicators(startIndex, endIndex, ctx, mode, state) {
    const { data } = state;
    const { onChartIndicatorSignal, onChartIndicatorData } = state.ChartWindow;
    onChartIndicatorSignal.peek().forEach((indicator, index) => {
        if (indicatorConfig[indicator.name] === undefined) return;
        else if (indicator.label === indicatorConfig["ZigZag"].label) {
            const zigZagData = calculateZigZag(
                data.peek()[0],
                indicator
            );
            drawZigZagIndicator(ctx, zigZagData, mode, startIndex, endIndex, state);
        }
        else {
            const dataComplete = onChartIndicatorData.peek()[index] === undefined ? (onChartIndicatorData.peek()[index] = indicator.getChartData(data.peek()[0], indicator)) : onChartIndicatorData.peek()[index];
            const dataToDraw = dataComplete
                .slice(startIndex, endIndex + 1)
                .reverse();
            indicator.drawChartFunction(indicator, ctx, dataToDraw, mode, state);
        }
    });
}

export function drawSMAIndicator(indicator, ctx, smaData, mode, state) {
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
            data.Close,
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

export function drawEMAIndicator(indicator, ctx, emaData, mode, state) {
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
            emaData[i].Close,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        if (i === 0) ctx.moveTo(xCoord, yCoord);
        else ctx.lineTo(xCoord, yCoord);
    }
    ctx.stroke();
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
    let flag = false;
    for (let i = startIndex; i <= endIndex; i++) {
        if (zigZagData[data.peek()[0][i].Date]) {
            const index = endIndex - i;
            if (flag === false) {
                const zigZagValues = Object.values(zigZagData);
                const index1 =
                    dateConfig.peek().dateToIndex[
                    zigZagValues[zigZagData[data.peek()[0][i].Date].index - 1]?.date
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
                        zigZagValues[zigZagData[data.peek()[0][i].Date].index - 1]?.value,
                        yAxisRange.peek().minPrice,
                        yAxisRange.peek().maxPrice,
                        chartCanvasSize.peek().height
                    )
                );
                flag = true;
            }
            const price = zigZagData[data.peek()[0][i].Date].value;
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
            data.peek()[0][endIndex].Low,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        )
    );
    ctx.stroke();
}

export function drawParabolicSAR(indicator, ctx, sarData, mode, state) {
    const { chartCanvasSize, yAxisRange } = state;
    const { xAxisConfig, timeRange } = state.ChartWindow;
    ctx.fillStyle = indicator.color;

    for (let i = 0; i < sarData.length; i++) {
        const xCoord = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoord = getYCoordinate(
            sarData[i].Close,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );

        const dotSize = indicator.stroke;

        ctx.beginPath();
        ctx.arc(xCoord, yCoord, parseInt(dotSize), 0, 2 * Math.PI);
        ctx.fill();
    }
}

export function drawBB(indicator, ctx, BBData, mode, state) {
    const { chartCanvasSize, yAxisRange } = state;
    const { timeRange, xAxisConfig } = state.ChartWindow;
    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = indicator.stroke;
    let prevSma = null;
    let prevUpper = null;
    let prevLower = null;
    BBData.forEach((data, i) => {
        const xCoordSMA = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoordSMA = getYCoordinate(
            data.Close,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const yCoordUpper = getYCoordinate(
            data.UpperBand,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const yCoordLower = getYCoordinate(
            data.LowerBand,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        ctx.fillStyle = "rgba(0,148,255,0.3)";
        ctx.lineWidth = indicator.stroke;
        if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(xCoordSMA, yCoordUpper);
            ctx.lineTo(xCoordSMA, yCoordUpper);
            ctx.moveTo(xCoordSMA, yCoordSMA);
            ctx.lineTo(xCoordSMA, yCoordSMA);
            ctx.moveTo(xCoordSMA, yCoordLower);
            ctx.lineTo(xCoordSMA, yCoordLower);
            ctx.stroke();
            // context.moveTo(xCoordSMA, yCoordLower);
        } else {
            ctx.beginPath();
            ctx.moveTo(prevUpper.xCoordSMA, prevUpper.yCoordUpper);
            ctx.lineTo(xCoordSMA, yCoordUpper);
            ctx.moveTo(prevSma.xCoordSMA, prevSma.yCoordSMA);
            ctx.lineTo(xCoordSMA, yCoordSMA);
            ctx.moveTo(prevLower.xCoordSMA, prevLower.yCoordLower);
            ctx.lineTo(xCoordSMA, yCoordLower);
            ctx.stroke();
            ctx.moveTo(prevLower.xCoordSMA, prevLower.yCoordLower);
            ctx.bezierCurveTo(
                prevLower.xCoordSMA,
                prevLower.yCoordLower,
                prevUpper.xCoordSMA,
                prevUpper.yCoordUpper,
                prevUpper.xCoordSMA,
                prevUpper.yCoordUpper
            );
            ctx.bezierCurveTo(
                prevUpper.xCoordSMA,
                prevUpper.yCoordUpper,
                xCoordSMA,
                yCoordUpper,
                xCoordSMA,
                yCoordUpper
            );
            ctx.bezierCurveTo(
                xCoordSMA,
                yCoordUpper,
                xCoordSMA,
                yCoordLower,
                xCoordSMA,
                yCoordLower
            );
            ctx.bezierCurveTo(
                xCoordSMA,
                yCoordLower,
                prevLower.xCoordSMA,
                prevLower.yCoordLower,
                prevLower.xCoordSMA,
                prevLower.yCoordLower
            );
            ctx.closePath();
            ctx.lineWidth = 5;
            ctx.fillStyle = "rgba(0,148,255,0.3)";
            ctx.fill();
            ctx.strokeStyle = "blue";
        }
        prevSma = { xCoordSMA, yCoordSMA };
        prevUpper = { xCoordSMA, yCoordUpper };
        prevLower = { xCoordSMA, yCoordLower };
    });
    ctx.lineWidth = 1;
}

export function drawAlligator(indicator, ctx, alligatorData, mode, state) {
    const { chartCanvasSize, yAxisRange } = state;
    const { timeRange, xAxisConfig } = state.ChartWindow;
    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = indicator.stroke;
    ctx.beginPath();
    let prevJaw = null;
    let prevTeeth = null;
    let prevLips = null;

    alligatorData.forEach((data, i) => {
        const xCoordJaw = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoordJaw = getYCoordinate(
            data.Jaw,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const xCoordTeeth = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoordTeeth = getYCoordinate(
            data.Teeth,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const xCoordLips = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoordLips = getYCoordinate(
            data.Lips,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        ctx.fillStyle = "rgba(0,148,255,0.3)";
        ctx.lineWidth = indicator.stroke;
        if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(xCoordJaw, yCoordJaw);
            ctx.lineTo(xCoordJaw, yCoordJaw);
            ctx.moveTo(xCoordTeeth, yCoordTeeth);
            ctx.lineTo(xCoordTeeth, yCoordTeeth);
            ctx.moveTo(xCoordLips, yCoordLips);
            ctx.lineTo(xCoordLips, yCoordLips);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(prevJaw.xCoordJaw, prevJaw.yCoordJaw);
            ctx.lineTo(xCoordJaw, yCoordJaw);
            ctx.moveTo(prevTeeth.xCoordTeeth, prevTeeth.yCoordTeeth);
            ctx.lineTo(xCoordTeeth, yCoordTeeth);
            ctx.moveTo(prevLips.xCoordLips, prevLips.yCoordLips);
            ctx.lineTo(xCoordLips, yCoordLips);
            ctx.stroke();
            ctx.moveTo(prevLips.xCoordLips, prevLips.yCoordLips);
            ctx.bezierCurveTo(
                prevLips.xCoordLips,
                prevLips.yCoordLips,
                prevJaw.xCoordJaw,
                prevJaw.yCoordJaw,
                prevJaw.xCoordJaw,
                prevJaw.yCoordJaw
            );
            ctx.bezierCurveTo(
                prevJaw.xCoordJaw,
                prevJaw.yCoordJaw,
                xCoordJaw,
                yCoordJaw,
                xCoordJaw,
                yCoordJaw
            );
            ctx.bezierCurveTo(
                xCoordJaw,
                yCoordJaw,
                xCoordTeeth,
                yCoordTeeth,
                xCoordTeeth,
                yCoordTeeth
            );
            ctx.bezierCurveTo(
                xCoordTeeth,
                yCoordTeeth,
                xCoordLips,
                yCoordLips,
                xCoordLips,
                yCoordLips
            );
            ctx.bezierCurveTo(
                xCoordLips,
                yCoordLips,
                prevLips.xCoordLips,
                prevLips.yCoordLips,
                prevLips.xCoordLips,
                prevLips.yCoordLips
            );
            ctx.closePath();
            ctx.lineWidth = 5;
            ctx.fillStyle = "rgba(0,148,255,0.3)";
            ctx.fill();
            ctx.strokeStyle = "blue";
        }
        prevJaw = { xCoordJaw, yCoordJaw };
        prevTeeth = { xCoordTeeth, yCoordTeeth };
        prevLips = { xCoordLips, yCoordLips };
    });
    ctx.lineWidth = 1;
}
export function drawIchimokuIndicator(
    indicator,
    ctx,
    ichimokuData,
    mode,
    state
) {
    const { chartCanvasSize, yAxisRange } = state;
    const { timeRange, xAxisConfig } = state.ChartWindow;
    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = indicator.stroke;
    ctx.beginPath();
    let prevConversion = null;
    let prevBase = null;
    let prevSpanA = null;
    let prevSpanB = null;
    let prevLaggingSpan = null;

    ichimokuData.forEach((data, i) => {
        const xCoordConversion = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        prevConversion = drawLineChart(
            data.Conversion,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoordConversion,
            ctx,
            prevConversion,
            "red"
        );
        prevBase = drawLineChart(
            data.Base,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoordConversion,
            ctx,
            prevBase,
            "green"
        );
        prevSpanA = drawLineChart(
            data.SpanA,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoordConversion,
            ctx,
            prevSpanA,
            "blue"
        );
        prevSpanB = drawLineChart(
            data.SpanB,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoordConversion,
            ctx,
            prevSpanB,
            "pink"
        );
        prevLaggingSpan = drawLineChart(
            data.LaggingSpan,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoordConversion,
            ctx,
            prevLaggingSpan,
            "purple"
        );
    });
    ctx.lineWidth = 1;
}


export function drawSuperTrend(indicator, ctx, superTrendData, mode, state) {
    const { chartCanvasSize, yAxisRange } = state;
    const { timeRange, xAxisConfig } = state.ChartWindow;
    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = indicator.stroke;
    ctx.beginPath();
    let prevSuperTrend = null;
    superTrendData.forEach((data, i) => {

        const xCoord = getXCoordinate(
            chartCanvasSize.peek().width,
            xAxisConfig.peek().widthOfOneCS,
            timeRange.peek().scrollDirection,
            timeRange.peek().scrollOffset,
            i
        );
        const yCoord1 = getYCoordinate(data.UpperBand, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const yCoord2 = getYCoordinate(data.LowerBand, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        const yCoord3 = getYCoordinate(data.Close, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
        if (prevSuperTrend === null || data.Trend !== prevSuperTrend.Trend) {
        } else if (data.Trend === 1) {
            ctx.strokeStyle = 'Green';
            ctx.beginPath();
            ctx.moveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord2);
            ctx.lineTo(xCoord, yCoord2);
            ctx.stroke();
            ctx.moveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord2);
            ctx.bezierCurveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord2, prevSuperTrend.xCoord, prevSuperTrend.yCoord3, prevSuperTrend.xCoord, prevSuperTrend.yCoord3);
            ctx.bezierCurveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord3, xCoord, yCoord3, xCoord, yCoord3);
            ctx.bezierCurveTo(xCoord, yCoord3, xCoord, yCoord2, xCoord, yCoord2);
            ctx.bezierCurveTo(xCoord, yCoord2, prevSuperTrend.xCoord, prevSuperTrend.yCoord2, prevSuperTrend.xCoord, prevSuperTrend.yCoord2);
            ctx.closePath();
            ctx.fillStyle = "rgba(0,255,0,0.2)";
            ctx.fill();
        } else if (data.Trend === -1) {
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.moveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord1);
            ctx.lineTo(xCoord, yCoord1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord3);
            ctx.bezierCurveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord3, prevSuperTrend.xCoord, prevSuperTrend.yCoord1, prevSuperTrend.xCoord, prevSuperTrend.yCoord1);
            ctx.bezierCurveTo(prevSuperTrend.xCoord, prevSuperTrend.yCoord1, xCoord, yCoord1, xCoord, yCoord1);
            ctx.bezierCurveTo(xCoord, yCoord1, xCoord, yCoord3, xCoord, yCoord3);
            ctx.bezierCurveTo(xCoord, yCoord3, prevSuperTrend.xCoord, prevSuperTrend.yCoord3, prevSuperTrend.xCoord, prevSuperTrend.yCoord3);
            ctx.closePath();
            ctx.fillStyle = "rgba(255,0,0,0.2)";
            ctx.fill();
        }
        prevSuperTrend = {
            Trend: data.Trend,
            xCoord: xCoord,
            yCoord1: yCoord1,
            yCoord2: yCoord2,
            yCoord3: yCoord3
        }
    });
    ctx.lineWidth = 1;
}

export function drawRSIIndicatorChart(state, mode) {
    const {
        yAxisRange,
        yAxisConfig,
        ChartRef,
        yAxisRef,
        chartCanvasSize,
        yAxisCanvasSize,
        data,
        Indicator,
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
    if (Indicator.peek().indicatorOptions.peek().label === "Relative Strength Index") {
        ctx.beginPath();
        const y30RSI = getYCoordinate(
            30,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const y70RSI = getYCoordinate(
            70,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        ctx.fillStyle = "rgba(0,148,255,0.3)";
        ctx.strokeStyle = "gray";
        ctx.setLineDash([5, 2]);
        ctx.beginPath();
        ctx.fillRect(
            0,
            y70RSI,
            chartCanvasSize.peek().width,
            Math.abs(y70RSI - y30RSI)
        );
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
    }
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
            "blue"
        );
        prev1 = drawLineChart(
            resultData1[i],
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoord,
            ctx,
            prev1,
            "orange"
        );
        drawBarChart(
            resultData2[i],
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoord,
            ctx,
            xAxisConfig.peek().widthOfOneCS - 2
        );
    });
}
export function drawVortexIndicatorChart(state, mode) {
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
            "blue"
        );
        prev1 = drawLineChart(
            resultData1[i],
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoord,
            ctx,
            prev1,
            "orange"
        );
    });
}

export function drawBBPIndicatorChart(state, mode) {
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
        drawBarChart(
            resultData[i],
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height,
            xCoord,
            ctx,
            xAxisConfig.peek().widthOfOneCS - 2
        );
    });
}

export function drawAwesomeOscillatorIndicator(state, mode) {
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

        const prevClose = i > 0 ? resultData[i - 1].Close : null;
        const currentClose = d.Close;
        const barColor =
            prevClose !== null && prevClose > currentClose ? "green" : "red";
        const width = xAxisConfig.peek().widthOfOneCS - 2;
        const y = getYCoordinate(
            currentClose,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );
        const yZero = getYCoordinate(
            0,
            yAxisRange.peek().minPrice,
            yAxisRange.peek().maxPrice,
            chartCanvasSize.peek().height
        );

        ctx.fillStyle = barColor;
        ctx.fillRect(xCoord - width / 2, y, width, yZero - y);
    });
}
