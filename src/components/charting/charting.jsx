import React, {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { effect } from "@preact/signals-react";
import {
  chartCanvasSize,
  xAxisCanvasSize,
  yAxisCanvasSize,
  timeRange,
  dateCursor,
  priceRange,
} from "../../signals/stockSignals";
import {
  updateConfig,
  drawChart,
  setStockData,
  setCanvasSize,
  handleOnMouseMove,
  handleScroll,
  updateCursorValue,
  removeCursor,
  chartMouseDown,
  chartMouseMove,
  chartMouseUp,
} from "../../utility/chartUtils";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../../utility/xAxisUtils";
import {
  onChartIndicatorSignal,
  offChartIndicatorSignal,
  indicatorChartCanvasSize,
  indicatorYAxisCanvasSize,
} from "../../signals/indicatorsSignal";
import IndicatorsList from "../indicators/indicatorsList";
import {
  yAxisMouseDown,
  yAxisMouseMove,
  yAxisMouseUp,
} from "../../utility/yAxisUtils";
import DrawChart from "./drawChart";
import DrawIndicator from "./drawIndicator";

function Charting({ selectedStock, interval, stockData, chartType, mode }) {
  const ChartRef = useRef([]);
  ChartRef.current = ChartRef.current.slice(0, 2);
  const xAxisRef = useRef([]);
  xAxisRef.current = xAxisRef.current.slice(0, 2);
  const yAxisRef = useRef([]);
  yAxisRef.current = yAxisRef.current.slice(0, 2);
  const indicatorsChartRef = useRef([]);
  const indicatorsYAxisRef = useRef([]);
  const [onChartIndicators, setOnChartIndicators] = useState([]);
  const [offChartIndicators, setOffChartIndicators] = useState([]);
  effect(() => {
    if (
      onChartIndicatorSignal.value &&
      onChartIndicatorSignal.value.length !== onChartIndicators.length
    ) {
      setOnChartIndicators([...onChartIndicatorSignal.peek()]);
    } else if (
      offChartIndicatorSignal.value &&
      offChartIndicatorSignal.value.length !== offChartIndicators.length
    ) {
      console.log(
        offChartIndicators,
        offChartIndicatorSignal.peek()
      );
      indicatorsChartRef.current = indicatorsChartRef.current.slice(
        0,
        2 * offChartIndicatorSignal.peek().length
      );
      indicatorsYAxisRef.current = indicatorsYAxisRef.current.slice(
        0,
        2 * offChartIndicatorSignal.peek().length
      );
      setOffChartIndicators([...offChartIndicatorSignal.peek()]);
    }
  });
  const handleResize = useCallback(() => {
    chartCanvasSize.value = setCanvasSize(ChartRef.current[0]);
    setCanvasSize(ChartRef.current[1]);
    xAxisCanvasSize.value = setCanvasSize(xAxisRef.current[0]);
    setCanvasSize(xAxisRef.current[1]);
    yAxisCanvasSize.value = setCanvasSize(yAxisRef.current[0]);
    setCanvasSize(yAxisRef.current[1]);
    updateConfig();
    if(indicatorsChartRef.current.length !== 0){
      offChartIndicatorSignal.peek().forEach((_, i) => {
        indicatorChartCanvasSize.value.push(setCanvasSize(indicatorsChartRef.current[2*i]));
        setCanvasSize(indicatorsChartRef.current[2*i+1])
        indicatorYAxisCanvasSize.value.push(setCanvasSize(indicatorsYAxisRef.current[2*i]));
        setCanvasSize(indicatorsYAxisRef.current[2*i])
      })
    }
  }, []);
  effect(() => {
    if (
      dateCursor.value &&
      dateCursor.value.x !== null &&
      dateCursor.value.y !== null &&
      ChartRef.current[1] !== null &&
      xAxisRef.current[1] !== null &&
      yAxisRef.current[1] !== null
    )
      updateCursorValue(
        ChartRef.current[1],
        xAxisRef.current[1],
        yAxisRef.current[1],
        mode
      );
  });
  effect(() => {
    if (selectedStock.value && interval.value)
      setStockData(selectedStock, interval, stockData);
  });
  useEffect(() => {
    handleResize();
    ChartRef.current[1].addEventListener("mousedown", chartMouseDown);
    window.addEventListener("mousemove", chartMouseMove);
    window.addEventListener("mouseup", chartMouseUp);
    xAxisRef.current[1].addEventListener("mousedown", xAxisMouseDown);
    window.addEventListener("mousemove", xAxisMouseMove);
    window.addEventListener("mouseup", xAxisMouseUp);
    yAxisRef.current[1].addEventListener("mousedown", yAxisMouseDown);
    window.addEventListener("mousemove", yAxisMouseMove);
    window.addEventListener("mouseup", yAxisMouseUp);
    ChartRef.current[0].addEventListener(
      "wheel",
      (e) => handleScroll(e, ChartRef.current[0]),
      false
    );
    ChartRef.current[1].addEventListener(
      "wheel",
      (e) => handleScroll(e, ChartRef.current[1]),
      false
    );
    window.addEventListener("resize", handleResize);
    return () => {
      ChartRef.current[0].removeEventListener(
        "wheel",
        (e) => handleScroll(e, ChartRef.current[0]),
        false
      );
      ChartRef.current[1].removeEventListener(
        "wheel",
        (e) => handleScroll(e, ChartRef.current[1]),
        false
      );
      ChartRef.current[1].removeEventListener("mousedown", chartMouseDown);
      window.removeEventListener("mousemove", chartMouseMove);
      window.removeEventListener("mouseup", chartMouseUp);
      window.removeEventListener("resize", handleResize);
      xAxisRef.current[1].removeEventListener("mousedown", xAxisMouseDown);
      window.removeEventListener("mousemove", xAxisMouseMove);
      window.removeEventListener("mouseup", xAxisMouseUp);
      yAxisRef.current[1].removeEventListener("mousedown", yAxisMouseDown);
      window.removeEventListener("mousemove", yAxisMouseMove);
      window.removeEventListener("mouseup", yAxisMouseUp);
    };
  });
  effect(() => {
    if (
      timeRange.value.endTime.Date !== 0 &&
      timeRange.value.startTime.Date !== 0 &&
      chartType.value &&
      onChartIndicatorSignal.value
    ) {
      if (
        ChartRef.current[0] !== null &&
        xAxisRef.current[0] !== null &&
        yAxisRef.current[0] !== null &&
        priceRange.value.minPrice > 0
      ) {
        drawChart(
          ChartRef.current[0],
          xAxisRef.current[0],
          yAxisRef.current[0],
          mode
        );
      }
    }
  });
  return (
    <div
      className={`flex w-[100%] flex-col border-l-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800  bg-gray-900"
      }`}
    >
      <div
        className={`flex direction-row flex-wrap w-[100%] h-[95%] border-b-2 ${
          mode === "Light" ? "border-gray-300" : "border-gray-800"
        }`}
      >
        <div className="flex direction-row flex-wrap w-[100%] h-[97%] relative">
          <DrawChart
            handleOnMouseMove={handleOnMouseMove}
            removeCursor={removeCursor}
            ChartRef={ChartRef}
            xAxisRef={xAxisRef}
            yAxisRef={yAxisRef}
          />
          {offChartIndicators.length !== 0 &&
            offChartIndicators.map((_, index) => {
              return (
                <DrawIndicator
                  mode={mode}
                  index={index}
                  offChartIndicators={offChartIndicators}
                  handleOnMouseMove={handleOnMouseMove}
                  removeCursor={removeCursor}
                  indicatorsChartRef={indicatorsChartRef}
                  xAxisRef={xAxisRef}
                  indicatorsYAxisRef={indicatorsYAxisRef}
                />
              );
            })}
          <IndicatorsList mode={mode} indicators={onChartIndicators} />
        </div>
        <div className="w-[95%] h-[3%] relative">
          <canvas
            ref={(el) => (xAxisRef.current[0] = el)}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={(el) => (xAxisRef.current[1] = el)}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-3 cursor-ew-resize`}
          ></canvas>
        </div>
      </div>
      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
