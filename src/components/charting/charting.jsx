import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StockContext from "../../context/stock_context";
import { createChart } from "lightweight-charts";
import stockData from "../../csvjson.json";
import { monthMap } from "../../data/TIME_MAP";
import Xaxis from "../../modules/chartModules/xAxis";

function Charting() {
  const { selectedStock, interval } = useContext(StockContext);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const ChartContainerRef = useRef(null);
  const ChartContainerRef1 = useRef(null);
  useEffect(() => {
    if (!selectedStock) return;

    const chart = createChart(ChartContainerRef.current, {
      width: 1250,
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
  }, [selectedStock, interval]);

  useLayoutEffect(() => {
    function updateSize() {
      setWindowSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [windowSize]);

  const handleScroll = () => {
    setScrollOffset(window.scrollX);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getYCoordinate = (price, minPrice, maxPrice, height, margin) => {
    return (
      height -
      margin -
      ((height - margin) / 12) *
        ((price - minPrice) / ((maxPrice - minPrice) / 12))
    );
  };
  const drawCandleStick = (
    data,
    minPrice,
    maxPrice,
    height,
    margin,
    x,
    context,
  ) => {
    let fillColor,
      borderColor = "black";
    if (data["Close"] > data["Open"]) {
      fillColor = "green";
    } else {
      fillColor = "red";
    }
    const open = getYCoordinate(
      data["Open"],
      minPrice,
      maxPrice,
      height,
      margin
    );
    const close = getYCoordinate(
      data["Close"],
      minPrice,
      maxPrice,
      height,
      margin
    );
    const high = getYCoordinate(
      data["High"],
      minPrice,
      maxPrice,
      height,
      margin
    );
    const low = getYCoordinate(data["Low"], minPrice, maxPrice, height, margin);
    const bodyHeight = Math.abs(open - close);
    const bodyY = Math.min(open, close);

    // Draw candlestick body
    context.fillStyle = fillColor;
    context.fillRect(x - 1, bodyY, 2, bodyHeight);

    // Draw candlestick wicks
    context.strokeStyle = borderColor;
    context.beginPath();
    context.moveTo(x, high);
    context.lineTo(x, Math.min(open, close));
    context.moveTo(x, low);
    context.lineTo(x, Math.max(open, close));
    context.stroke();
  };
  useEffect(() => {
    const data = stockData.data;
    const canvas = ChartContainerRef1.current;
    canvas.width = ChartContainerRef1.current.parentElement.offsetWidth;
    canvas.height = ChartContainerRef1.current.parentElement.offsetHeight;
    const ctx = ChartContainerRef1.current.getContext("2d");
    let marginX = 30;
    let marginY = 55;
    let width = canvas.width;
    let height = canvas.height;
    let offsetHeight = 15;
    let offsetWidth = 15;

    const xAxis = new Xaxis();
    xAxis.draw(
      width,
      height,
      interval,
      data[data.length - 1].Date,
      data[0].Date,
      ctx,
      marginX,
      scrollOffset
    );
  }, [windowSize, scrollOffset]);
  return (
    <div className="flex w-[100%] flex-col border-l-2 border-gray-300">
      {/* <div ref={ChartContainerRef} className="w-full h-[95%]"></div> */}
      <div className="w-[100%] h-[95%]">
        <canvas
          ref={ChartContainerRef1}
          className="w-[100%] border-b-2 border-gray-300"
        ></canvas>
      </div>

      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
