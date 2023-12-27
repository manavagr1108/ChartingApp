import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StockContext from "../../context/stock_context";
import { createChart } from "lightweight-charts";
import stockData from "../../data/csvjson.json";
import {
  getTime,
  getWeekDates,
  getDataPointsCount,
  getCSWidth,
  getCandleSticksMoved,
  getNewTime,
  getFirstMonthStart,
  getColumnWidth,
  getObjtoStringTime,
} from "../../utility/utils";
import { monthMap } from "../../data/TIME_MAP";

function Charting() {
  const { selectedStock, interval } = useContext(StockContext);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  let marginY = 55;
  const data = stockData.data;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [xAxisConfig, setXAxisConfig] = useState({
    canvasWidth: 0,
    canvasHeight: 0,
    interval: interval,
    margin: 30,
    noOfDataPoints: 0,
    noOfColumns: 12,
    widthOfOneCS: 0,
    startTime: getTime(data[data.length - 1].Date),
    endTime: getTime(data[0].Date),
    dates: getWeekDates(
      getTime(data[data.length - 1].Date),
      getTime(data[0].Date)
    ),
  });
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

  const handleScroll = (event) => {
    setScrollOffset(event.deltaX);
    event.preventDefault();
    return false;
  };
  useEffect(() => {
    const canvas = ChartContainerRef1.current;
    canvas.addEventListener("wheel", handleScroll, false);
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
    context
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
    const canvas = ChartContainerRef1.current;
    const ctx = canvas.getContext("2d");
    let currentMonth = xAxisConfig.startTime.Month;
    let currentYear = xAxisConfig.startTime.Year;
    let firstMonthStart = getFirstMonthStart(
      xAxisConfig.startTime,
      xAxisConfig.dates
    );
    const firstMonthCSCount = getDataPointsCount(
      firstMonthStart,
      xAxisConfig.startTime,
      interval,
      xAxisConfig.dates
    );
    const CSWidth = getCSWidth(
      xAxisConfig.noOfDataPoints,
      xAxisConfig.noOfColumns,
      xAxisConfig.canvasWidth
    );
    const columnWidth = getColumnWidth(
      xAxisConfig.canvasWidth,
      xAxisConfig.noOfColumns
    );
    console.log(firstMonthCSCount);
    ctx.clearRect(0,0,xAxisConfig.canvasWidth, xAxisConfig.canvasHeight);
    ctx.font = "12px Arial";
    for (let i = 0; i < xAxisConfig.noOfColumns; i++) {
      const xCoord =
        xAxisConfig.canvasWidth -
        xAxisConfig.margin -
        (CSWidth * firstMonthCSCount - CSWidth / 2) -
        i * columnWidth;
      const yCoord = xAxisConfig.canvasHeight - xAxisConfig.margin;
      if (currentMonth === 1) {
        ctx.fillText(currentYear, xCoord, yCoord);
        currentYear -= 1;
      } else if(currentMonth === 0){
        ctx.fillText(monthMap[currentMonth + 12 - 1], xCoord, yCoord);
      } else {
        ctx.fillText(monthMap[currentMonth - 1], xCoord, yCoord);
      }
      currentMonth = (currentMonth - 1 + 12) % 12;
    }
  }, [xAxisConfig]);
  useEffect(() => {
    const noOfCSMoved = getCandleSticksMoved(
      scrollOffset,
      xAxisConfig.widthOfOneCS
    );
    const startTime = getNewTime(
      xAxisConfig.startTime,
      noOfCSMoved,
      xAxisConfig.dates
    );
    const endTime = getNewTime(
      xAxisConfig.endTime,
      noOfCSMoved,
      xAxisConfig.dates
    );
    console.log(noOfCSMoved, getObjtoStringTime(startTime), getObjtoStringTime(endTime));
    setXAxisConfig((prev) => {
      return {
        ...prev,
        startTime: startTime,
        endTime: endTime,
      };
    });
  }, [scrollOffset]);
  useEffect(() => {
    const canvas = ChartContainerRef1.current;
    let width = ChartContainerRef1.current.parentElement.offsetWidth;
    let height = ChartContainerRef1.current.parentElement.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    const noOfDataPoints = getDataPointsCount(
      xAxisConfig.startTime,
      xAxisConfig.endTime,
      interval,
      xAxisConfig.dates
    );
    setXAxisConfig((prev) => {
      return {
        ...prev,
        canvasWidth: width,
        canvasHeight: height,
        noOfDataPoints: noOfDataPoints,
        widthOfOneCS: getCSWidth(
          noOfDataPoints,
          xAxisConfig.noOfColumns,
          width
        ),
      };
    });
  }, [windowSize]);
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
