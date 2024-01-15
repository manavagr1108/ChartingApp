import React, { useState, useCallback, useRef, useEffect } from "react";
import { effect } from "@preact/signals-react";
import { xAxisCanvasSize } from "../../signals/stockSignals";
import {
  setCanvasSize,
  handleOnMouseMove,
  removeCursor,
} from "../../utility/chartUtils";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../../utility/xAxisUtils";
import {
  onChartIndicatorSignal,
  offChartIndicatorSignal,
} from "../../signals/indicatorsSignal";
import IndicatorsList from "../indicators/indicatorsList";
import DrawChart from "./drawChart";
import DrawIndicator from "./drawIndicator";
import useDrawChart from "../../hooks/useDrawChart";

function Charting({ selectedStock, interval, stockData, chartType, mode }) {
  const ChartRef = useRef([]);
  const [stockDataState, setStockDataState] = useState([]);
  ChartRef.current = ChartRef.current.slice(0, 2);
  const xAxisRef = useRef([]);
  xAxisRef.current = xAxisRef.current.slice(0, 2);
  const yAxisRef = useRef([]);
  yAxisRef.current = yAxisRef.current.slice(0, 2);
  const indicatorsChartRef = useRef([]);
  const indicatorsYAxisRef = useRef([]);
  const [onChartIndicators, setOnChartIndicators] = useState([]);
  const [offChartIndicators, setOffChartIndicators] = useState([]);
  const drawChart = useDrawChart(xAxisRef, mode, stockDataState);
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
    xAxisCanvasSize.value = setCanvasSize(xAxisRef.current[0]);
    setCanvasSize(xAxisRef.current[1]);
  }, []);
  effect(() => {
    if (stockData.value.length !== stockDataState.length) {
      setStockDataState([...stockData.peek()]);
    }
  });
  useEffect(() => {
    handleResize();
    xAxisRef.current[1].addEventListener("mousedown", (e) =>
      xAxisMouseDown({ e, ...drawChart })
    );
    window.addEventListener("mousemove", (e) =>
      xAxisMouseMove({ e, ...drawChart })
    );
    window.addEventListener("mouseup", (e) =>
      xAxisMouseUp({ e, ...drawChart })
    );
    window.addEventListener("resize", handleResize);
    return () => {
      xAxisRef.current[1].removeEventListener("mousedown", (e) =>
        xAxisMouseDown({ e, ...drawChart })
      );
      window.removeEventListener("mousemove", (e) =>
        xAxisMouseMove({ e, ...drawChart })
      );
      window.removeEventListener("mouseup", (e) =>
        xAxisMouseUp({ e, ...drawChart })
      );
    };
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
            xAxisRef={xAxisRef}
            drawChart={drawChart}
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
                  stockDataState={stockDataState}
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
