import React, { useState, useCallback, useRef, useEffect } from "react";
import { effect } from "@preact/signals-react";
import {
  setCanvasSize,
  handleOnMouseMove,
  removeCursor,
  getStockDataCallback,
  drawChart as drawChartOnCanvas
} from "../../utility/chartUtils";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../../utility/xAxisUtils";
import IndicatorsList from "../indicators/indicatorsList";
import DrawChart from "./drawChart";
import DrawIndicator from "./drawIndicator";
import useDrawChart from "../../hooks/useDrawChart";

function Charting({ mode, ChartWindow }) {
  const { xAxisRef, selectedStock, interval, stockData, chartType, drawChartObjects, onChartIndicatorSignal, offChartIndicatorSignal } = ChartWindow;
  const drawChart = drawChartObjects.peek()[0];
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
      setOffChartIndicators([...offChartIndicatorSignal.peek()]);
    }
  });
  effect(() => {
    if (selectedStock.value && interval.value && chartType.value){
      getStockDataCallback(selectedStock, interval, stockData).then(() =>{
        ChartWindow.setChartWindowSignal();
        drawChart.setDrawChartSignal(stockData.peek());
        drawChart.drawChartFunction(drawChart, mode)
        // ChartWindow.drawChartObjects.peek().forEach((drawChart)=>{
        //   console.log(drawChart);
          
        // })
      }).catch(e => {
        console.log(e);
      })
    }
  });
  // effect(() => {
  //   if (offChartIndicatorSignal.value.value && chartType.value){
  //     getStockDataCallback(selectedStock, interval, stockData).then(() =>{
  //       ChartWindow.setChartWindowSignal();
  //       ChartWindow.drawChartObjects.peek().forEach((drawChart)=>{
  //         if(drawChart.isIndicator) drawChart.setIndicator();
  //         drawChart.setDrawChartSignal(drawChart.getChartData(stockData.peek()));
  //         drawChart.drawChartFunction(drawChart, mode)
  //       })
  //     }).catch(e => {
  //       console.log(e);
  //     })
  //   }
  // });
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
            ChartWindow={ChartWindow}
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
                  ChartWindow={ChartWindow}
                />
              );
            })}
          <IndicatorsList mode={mode} indicators={onChartIndicators} ChartWindow={ChartWindow} />
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
