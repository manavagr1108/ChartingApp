import { monthMap } from "../data/TIME_MAP";
import {
    indicatorConfig,
} from "../config/indicatorsConfig";
import { calculateAlligator, calculateBB, calculateDonchainChannels, calculateDoubleEMA, calculateEMA, calculateEnvelope, calculateIchimokuCloud, calculateKeltnerChannels, calculateParabolicSAR, calculateSMA, calculateSuperTrend, calculateTripleEMA, calculateZigZag } from "./indicatorsUtil";
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
    const {
        xAxisRef,
        dateConfig,
        timeRange,
        xAxisConfig,
        chartType,
        selectedStock,
    } = state.ChartWindow;
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
    state.ChartWindow.drawChartObjects.peek().forEach(obj => drawFibs(obj, true));
}

export function drawIndicators(startIndex, endIndex, ctx, mode, state) {
    const { data } = state;
    const { onChartIndicatorSignal } = state.ChartWindow;
    onChartIndicatorSignal.peek().forEach((indicator) => {
        if (indicator.label === indicatorConfig["SMA"].label) {
            const smaData = calculateSMA(data.peek()[0], indicator.period);
            const SMA = smaData
                .slice(startIndex - indicator.period + 1, endIndex + 1)
                .reverse();
            drawSMAIndicator(indicator, ctx, SMA, mode, state);
        }
        if (indicator.label === indicatorConfig["EMA"].label) {
            const emaData = calculateEMA(data.peek()[0], indicator.period);
            const EMA = emaData
                .slice(startIndex - indicator.period + 1, endIndex + 1)
                .reverse();
            drawEMAIndicator(indicator, ctx, EMA, mode, state);
        }
        if (indicator.label === indicatorConfig["ZigZag"].label) {
            const zigZagData = calculateZigZag(
                data.peek()[0],
                indicator.deviation,
                indicator.pivotLegs
            );
            drawZigZagIndicator(ctx, zigZagData, mode, startIndex, endIndex, state);
        }
        if (indicator.label === indicatorConfig["ParabolicSAR"].label) {
            const sarData = calculateParabolicSAR(
                data.peek()[0],
                indicator.acceleration,
                indicator.maximum
            );
            const SAR = sarData.slice(startIndex, endIndex + 1).reverse();
            drawParabolicSAR(indicator, ctx, SAR, mode, state);
        }
        if (indicator.label === indicatorConfig["BB"].label) {
            const bbData = calculateBB(
                data.peek()[0],
                indicator.period,
                indicator.stdDev
            );
            const BB = bbData.slice(startIndex, endIndex + 1).reverse();
            drawBB(indicator, ctx, BB, mode, state);
        }
        if (indicator.label === indicatorConfig["KeltnerChannels"].label) {
            const KeltnerData = calculateKeltnerChannels(
                data.peek()[0],
                indicator.period,
                indicator.multiplier
            );
            const KELTNER = KeltnerData.slice(startIndex, endIndex + 1).reverse();
            drawBB(indicator, ctx, KELTNER, mode, state);
        }
        if (indicator.label === indicatorConfig["DonchainChannels"].label) {
            const donchainData = calculateDonchainChannels(
                data.peek()[0],
                indicator.period
            );
            const DONCHAIN = donchainData.slice(startIndex, endIndex + 1).reverse();
            drawBB(indicator, ctx, DONCHAIN, mode, state);
        }
        if (indicator.label === indicatorConfig["Alligator"].label) {
            const alligatorData = calculateAlligator(
                data.peek()[0],
                indicator.jawPeriod,
                indicator.teethPeriod,
                indicator.lipsPeriod
            );
            const ALLIGATOR = alligatorData.slice(startIndex, endIndex + 1).reverse();
            drawAlligator(indicator, ctx, ALLIGATOR, mode, state);
        }
        if (indicator.label === indicatorConfig["Envelope"].label) {
            const EnvelopeData = calculateEnvelope(
                data.peek()[0],
                indicator.period,
                indicator.percentage
            );
            const ENVELOPE = EnvelopeData.slice(startIndex, endIndex + 1).reverse();
            drawBB(indicator, ctx, ENVELOPE, mode, state);
        }
        if (indicator.label === indicatorConfig["IchimokuCloud"].label) {
            const IchimokuData = calculateIchimokuCloud(
                data.peek()[0],
                indicator.conversionPeriod,
                indicator.basePeriod,
                indicator.spanBPeriod,
                indicator.laggingSpanPeriod
            );
            const ICHIMOKU = IchimokuData.slice(startIndex, endIndex + 1).reverse();
            drawIchimokuIndicator(indicator, ctx, ICHIMOKU, mode, state);
        }
        if (indicator.label === indicatorConfig["SuperTrend"].label) {
            const superTrendData = calculateSuperTrend(
                data.peek()[0],
                indicator.period,
                indicator.multiplier
            );
            const SUPER_TREND = superTrendData
                .slice(startIndex, endIndex + 1)
                .reverse();
            drawSuperTrend(indicator, ctx, SUPER_TREND, mode, state);
        }
        if (indicator.label === indicatorConfig["DoubleEMA"].label) {
            const doubleEMAData = calculateDoubleEMA(
                data.peek()[0],
                indicator.period
            );
            const DEMA = doubleEMAData.slice(startIndex, endIndex + 1).reverse();
            drawEMAIndicator(indicator, ctx, DEMA, mode, state);
        }
        if (indicator.label === indicatorConfig["TripleEMA"].label) {
            const tripleEMAData = calculateTripleEMA(
                data.peek()[0],
                indicator.period
            );
            const TEMA = tripleEMAData.slice(startIndex, endIndex + 1).reverse();
            drawEMAIndicator(indicator, ctx, TEMA, mode, state);
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
        case 0: drawTrendLineUsingPoints(canvas, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, ctx1); break;
        case 1: drawRayLineUsingPoints(canvas, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, ctx1); break;
        case 2: drawInfoLineUsingPoints(state, canvas, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, ctx1); break;
        case 3: drawExtendedLineUsingPoints(canvas, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, ctx1); break;
    }
}

export const drawTrendLineUsingPoints = (canvas, startCoords, endCoords, lineSelected = false, ctx1 = null) => {
    const ctx = canvas.getContext("2d");
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
export const drawRayLineUsingPoints = (canvas, startCoords, endCoords, lineSelected = false, ctx1 = null) => {
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
    drawTrendLineUsingPoints(canvas, startCoords, { x: newEndXCoord, y: newEndYCoord }, false, ctx1);
}

export const drawExtendedLineUsingPoints = (canvas, startCoords, endCoords, lineSelected = false, ctx1 = null) => {
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
    drawTrendLineUsingPoints(canvas, { x: newStartXCoord, y: newStartYCoord }, { x: newEndXCoord, y: newEndYCoord }, false, ctx1);
}

export const drawInfoLineUsingPoints = (state, canvas, startCoords, endCoords, lineSelected = false, ctx1 = null) => {
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
    drawTrendLineUsingPoints(canvas, startCoords, endCoords, lineSelected, ctx1);
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

export const drawFib = (state, i, lineSelected = false, fromDrawChart = false) => {
    const { chartCanvasSize, yAxisRange, fibData, ChartRef } = state;
    const { dateConfig, xAxisConfig, timeRange } = state.ChartWindow;
    const canvas = ChartRef.current[0];
    const canvas1 = ChartRef.current[1];
    const ctx1 = canvas1.getContext("2d");
    const lineData = fibData.peek()[i];
    const startXCoordIndex = dateConfig.peek().dateToIndex[lineData.startPoint.xLabel];
    const endXCoordIndex = dateConfig.peek().dateToIndex[lineData.endPoint.xLabel];
    const firstIndex = dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().startTime)];
    const startXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - startXCoordIndex);
    const endXCoord = getXCoordinate(chartCanvasSize.peek().width, xAxisConfig.peek().widthOfOneCS, timeRange.peek().scrollDirection, timeRange.peek().scrollOffset, firstIndex - endXCoordIndex);
    const startYCoord = getYCoordinate(lineData.startPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    const endYCoord = getYCoordinate(lineData.endPoint.yLabel, yAxisRange.peek().minPrice, yAxisRange.peek().maxPrice, chartCanvasSize.peek().height);
    switch (lineData.toolItemNo) {
        case 0: drawFibUsingPoints(canvas, { x: startXCoord, y: startYCoord }, { x: endXCoord, y: endYCoord }, lineSelected, fromDrawChart, ctx1); break;
    }
}

export const drawFibUsingPoints = (canvas, startCoords, endCoords, lineSelected = false, fromDrawChart = false, ctx1 = null) => {
    if (!fromDrawChart) return;
    if (lineSelected) {
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
        if (startCoords.y < endCoords.y) {
            const temp = startCoords.y;
            startCoords.y = endCoords.y;
            endCoords.y = temp;
        }
        if (startCoords.x > endCoords.x) {
            const temp = startCoords.x;
            startCoords.x = endCoords.x;
            endCoords.x = temp;
        }
        const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
        const fibColors = ["rgba(255, 90, 71,1)", "rgba(126, 255, 71,1)", "rgba(50, 129, 168,1)", "rgba(76, 50, 168,1)", "rgba(168, 50, 146,1)", "rgba(189, 186, 55,1)", "rgba(189, 186, 55,1)"];
        fibValues.forEach((val, i) => {
            const yi = Math.abs(val * (endCoords.y - startCoords.y));
            ctx1.beginPath();
            ctx1.strokeStyle = fibColors[i];
            ctx1.moveTo(startCoords.x, endCoords.y + yi);
            ctx1.lineTo(endCoords.x, endCoords.y + yi);
            ctx1.stroke();
        })
    } else {
        drawTrendLineUsingPoints(canvas, startCoords, endCoords);
        if (startCoords.y < endCoords.y) {
            const temp = startCoords.y;
            startCoords.y = endCoords.y;
            endCoords.y = temp;
        }
        if (startCoords.x > endCoords.x) {
            const temp = startCoords.x;
            startCoords.x = endCoords.x;
            endCoords.x = temp;
        }
        const ctx = canvas.getContext("2d");
        const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
        const fibColors = ["rgba(255, 90, 71,0.3)", "rgba(126, 255, 71,0.3)", "rgba(50, 129, 168,0.3)", "rgba(76, 50, 168,0.3)", "rgba(168, 50, 146,0.3)", "rgba(189, 186, 55,0.3)"];
        let prevY = 0;
        fibValues.forEach((val, i) => {
            const yi = Math.abs(val * (endCoords.y - startCoords.y));
            ctx.beginPath();
            ctx.fillStyle = fibColors[i];
            ctx.rect(startCoords.x, endCoords.y + prevY, Math.abs(endCoords.x - startCoords.x), yi - prevY);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = "Black";
            ctx.fillText(val, startCoords.x - 20, endCoords.y + yi);
            ctx.fill();
            ctx.closePath();
            prevY = yi
        })
    }
}

export const drawFibs = (state, fromDrawChart = false) => {
    const { fibData } = state;
    fibData.peek().forEach((lineData, i) => {
        drawFib(state, i, false, fromDrawChart);
    })
}