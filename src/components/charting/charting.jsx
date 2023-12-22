import React, { useContext, useEffect, useRef } from "react";
import StockContext from "../../context/stock_context";
import { createChart } from "lightweight-charts";
import stockData from "../../csvjson.json";

function Charting() {
  const { selectedStock } = useContext(StockContext);
  const ChartContainerRef = useRef(null);
  useEffect(() => {
    console.log(selectedStock);
    if (!selectedStock) return;

    const chart = createChart(ChartContainerRef.current, {
      width: 1650,
      height: 740,
      layout: {
        backgroundColor: "#000000",
        textColor: "rgba(255, 255, 255, 0.9)",
      },
      grid: {
        vertLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
        horzLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
      },
      crosshair: {
        mode: "normal",
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#2ECC71",
      downColor: "#E74C3C",
      borderDownColor: "#E74C3C",
      borderUpColor: "#2ECC71",
      wickDownColor: "#E74C3C",
      wickUpColor: "#2ECC71",
    });

    const mappedData = stockData.data.map((item) => ({
      time: item.Date,
      open: item.Open,
      high: item.High,
      low: item.Low,
      close: item.Close,
    }));

    candleSeries.setData(mappedData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [selectedStock]);
  return (
    <div className="flex flex-col bg-gray-200">
      <div ref={ChartContainerRef} className="bg-gray-200 w-full h-[95%]"></div>
      <div className="bg-gray-300 w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
