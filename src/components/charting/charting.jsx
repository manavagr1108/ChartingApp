import { effect } from "@preact/signals-react";
import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import {
  getStockDataCallback,
  handleOnMouseMove,
  removeCursor,
} from "../../utility/chartUtils";
import IndicatorsList from "../indicators/indicatorsList";
import DrawChart from "./drawChart";
import DrawIndicator from "./drawIndicator";
import { getWebsocketToken } from "../../utility/stockApi";
import {
  blobToArrayBuffer,
  decodeProfobuf,
  getUrl,
  initProtobuf,
} from "../../socket/MarketDataFeed";

function Charting({ mode, ChartWindow }) {
  const {
    xAxisRef,
    instrumentKey,
    interval,
    stockData,
    chartType,
    drawChartObjects,
    onChartIndicatorSignal,
    offChartIndicatorSignal,
  } = ChartWindow;
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
    if (instrumentKey.value && interval.value && chartType.value) {
      getStockDataCallback(instrumentKey, interval, stockData)
        .then(() => {
          ChartWindow.setChartWindowSignal();
          drawChart.setDrawChartSignal([stockData.peek()]);
          drawChart.drawChartFunction(drawChart, mode);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  });
  // Establish WebSocket connection
  useEffect(() => {
    const connectWebSocket = async (token) => {
      try {
        const wsUrl = await getUrl(token);
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          console.log("Connected");
          const data = {
            guid: "someguid",
            method: "sub",
            data: {
              mode: "full",
              instrumentKeys: [instrumentKey.peek()],
            },
          };
          const newBuffer = new Buffer.from(JSON.stringify(data));
          ws.send(newBuffer);
        };

        ws.onclose = () => {
          console.log("Disconnected");
        };

        ws.onmessage = async (event) => {
          const arrayBuffer = await blobToArrayBuffer(event.data);
          let buffer = Buffer.from(arrayBuffer);
          let response = decodeProfobuf(buffer);
        };

        ws.onerror = (error) => {
          console.log("WebSocket error:", error);
        };
        return () => ws.close();
      } catch (error) {
        console.error("WebSocket connection error:", error);
      }
    };
    try {
      getWebsocketToken().then((acessToken) => {
        initProtobuf();
        effect(() => {
          if (instrumentKey.value !== null) {
            connectWebSocket(acessToken);
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  }, []);
  return (
    <div
      className={`flex w-[100%] flex-col relative border-l-2 ${
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
                  key={index}
                  mode={mode}
                  index={index}
                  offChartIndicators={offChartIndicators}
                  handleOnMouseMove={handleOnMouseMove}
                  removeCursor={removeCursor}
                  ChartWindow={ChartWindow}
                />
              );
            })}
          <IndicatorsList
            mode={mode}
            indicators={onChartIndicators}
            ChartWindow={ChartWindow}
          />
        </div>
        <div className="w-[95%] h-[3%] relative">
          <canvas
            ref={(el) => (xAxisRef.current[0] = el)}
            className={`w-[100%] cursor-crosshair absolute top-0 left-0 z-2`}
          ></canvas>
          <canvas
            ref={(el) => (xAxisRef.current[1] = el)}
            className={`w-[100%] absolute top-0 left-0 z-3 cursor-ew-resize`}
          ></canvas>
        </div>
      </div>
      {/* <EditSelectedItem ChartWindow={ChartWindow} mode={mode} /> */}
      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
