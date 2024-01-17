import React, { useState, useCallback, useRef, useEffect } from "react";
import { effect } from "@preact/signals-react";
import { xAxisCanvasSize } from "../../signals/stockSignals";
import {
  setCanvasSize,
  handleOnMouseMove,
  removeCursor,
  getStockDataCallback,
  updateConfig,
  drawChart as drawChartOnCanvas
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
  const [stockDataState, setStockDataState] = useState([]);
  const xAxisRef = useRef([]);
  xAxisRef.current = xAxisRef.current.slice(0, 2);
  const [onChartIndicators, setOnChartIndicators] = useState([]);
  const [offChartIndicators, setOffChartIndicators] = useState([]);
  const drawChart = useDrawChart(xAxisRef, mode, false);
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
      setOffChartIndicators([...offChartIndicatorSignal.peek()]);
    }
  });
  const handleResize = useCallback(() => {
    xAxisCanvasSize.value = setCanvasSize(xAxisRef.current[0]);
    setCanvasSize(xAxisRef.current[1]);
  }, []);
  effect(() => {
    if (selectedStock.value && interval.value){
      getStockDataCallback(selectedStock, interval, drawChart.stockData).then(() =>{
        try {
          updateConfig({ ...drawChart });
        } catch (e) {
          console.log(e);
        } finally {
          drawChartOnCanvas(xAxisRef, mode, { ...drawChart })
        }
      })
      // getStockDataCallback(selectedStock, interval, setStockDataState);
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
                  xAxisRef={xAxisRef}
                  drawChart={drawChart}
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
