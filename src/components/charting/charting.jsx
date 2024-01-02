import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StockContext from "../../context/stock_context";
import {
  getTime,
  getWeekDates,
  getDataPointsCount,
  getCSWidth,
  getCandleSticksMoved,
  getNewTime,
  getObjtoStringTime,
} from "../../utility/xAxisUtils";
import {
  buildSegmentTree,
  getMinMaxPrices,
  drawCandleStick,
} from "../../utility/yAxisUtils";
import { monthMap } from "../../data/TIME_MAP";

function Charting() {
  const { selectedStock, interval, stockData, setStockData } = useContext(StockContext);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [xAxisConfig, setXAxisConfig] = useState({
    canvasWidth: 0,
    canvasHeight: 0,
    interval: interval,
    margin: 10,
    noOfDataPoints: 0,
    noOfColumns: 12,
    widthOfOneCS: 0,
    startTime: {},
    endTime: {},
    dates: []
  });
  const [yAxisConfig, setYAxisConfig] = useState({
    margin: 55,
    noOfColumns: 12,
    segmentTreeData: {},
  });
  const [priceRange, setPriceRange] = useState({
    minPrice: 0,
    maxPrice: 0,
  });
  const ChartContainerRef = useRef(null);

  useLayoutEffect(() => {
    function updateSize() {
      setWindowSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleScroll = (event) => {
    setScrollOffset(event.deltaX);
    event.preventDefault();
    return false;
  };
  useEffect(() => {
    const canvas = ChartContainerRef.current;
    canvas.addEventListener("wheel", handleScroll, false);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);
  useEffect(() => {
    fetch(
      `http://localhost:8080/getHistory?symbol=${selectedStock}`
    )
      .then((response) => response.text())
      .then((csvData) => {
        const rows = csvData.split("\n");
        const headers = rows[0].split(",");
        const jsonData = rows
          .slice(1)
          .filter((row) => row.trim() !== "")
          .map((row) => {
            const values = row.split(",");
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] =
                index === 0
                  ? values[index].trim()
                  : parseFloat(values[index].trim());
              return obj;
            }, {});
          });

        const fetchedData = jsonData.map((item) => ({
          Date: item.Date,
          Open: item.Open,
          High: item.High,
          Low: item.Low,
          Close: item.Close,
          AdjClose: item["Adj Close"],
          Volume: item.Volume,
        }));
        setStockData([...fetchedData]);
      })
  },[selectedStock, interval]);
  useEffect(() => {
    updatePriceRange();
  },[yAxisConfig])
  useEffect(() => {
    if(!stockData.length || priceRange.maxPrice === priceRange.minPrice) return;
    console.log(xAxisConfig);
    const canvas = ChartContainerRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, xAxisConfig.canvasWidth, xAxisConfig.canvasHeight);
    ctx.font = "12px Arial";
    const pDiff = priceRange.maxPrice - priceRange.minPrice;
    for (let i = yAxisConfig.noOfColumns - 1; i > 0; i--) {
      const text =
        priceRange.maxPrice -
        (pDiff / yAxisConfig.noOfColumns) * (yAxisConfig.noOfColumns - i);
      const xCoord = xAxisConfig.canvasWidth - yAxisConfig.margin;
      const yCoord =
        xAxisConfig.canvasHeight -
        xAxisConfig.margin -
        i *
          ((xAxisConfig.canvasHeight - xAxisConfig.margin) /
            yAxisConfig.noOfColumns);
      ctx.fillStyle = "black";
      ctx.fillText(
        parseInt(text),
        parseInt(xCoord - 5),
        parseInt(yCoord + 5)
      );
    }

    const startIndex =
      yAxisConfig.segmentTreeData.datesToIndex[
        getObjtoStringTime(xAxisConfig.endTime)
      ];
    const endIndex =
      yAxisConfig.segmentTreeData.datesToIndex[
        getObjtoStringTime(xAxisConfig.startTime)
      ];
    if (startIndex === undefined || endIndex === undefined) {
      console.log("Undefined startIndex or endIndex:");
      return;
    }

    console.log(startIndex, endIndex, stockData.length);
    const resultData = stockData.slice(startIndex, endIndex).reverse();
    console.log(resultData);
    resultData.forEach((d, i) => {
      const xCoord =
        xAxisConfig.canvasWidth -
        5 -
        yAxisConfig.margin -
        i * xAxisConfig.widthOfOneCS -
        xAxisConfig.widthOfOneCS / 2;

      if (xCoord < 0) return;
      if (
        i < resultData.length - 1 &&
        parseInt(d.Date.split("-")[1]) !=
          parseInt(resultData[i + 1].Date.split("-")[1])
      ) {
        const yCoord = xAxisConfig.canvasHeight - xAxisConfig.margin;
        const currentMonth = parseInt(d.Date.split("-")[1]);
        const currentYear = parseInt(d.Date.split("-")[0]);
        ctx.fillStyle = "black";
        if (currentMonth === 1) {
          ctx.fillText(currentYear, xCoord, yCoord);
        } else {
          ctx.fillText(monthMap[currentMonth - 1], xCoord, yCoord);
        }
      }
      drawCandleStick(
        d,
        priceRange.minPrice,
        priceRange.maxPrice,
        xAxisConfig.canvasHeight,
        xAxisConfig.margin,
        xCoord,
        ctx,
        xAxisConfig.widthOfOneCS - 4
      );
    });
  }, [xAxisConfig, priceRange]);
  useEffect(() => {
    if(!stockData.length) return;
    const segmentTreeData = buildSegmentTree(stockData);
    setYAxisConfig((prev) => {
      return {
        ...prev,
        segmentTreeData
      }
    })
    const startTime = getTime(stockData[stockData.length-1].Date)
    const endTime = getTime(stockData[stockData.length-250].Date)
    const dates = getWeekDates(stockData[stockData.length-1].Date, stockData[0].Date);
    const noOfDataPoints = getDataPointsCount(
      startTime,
      endTime,
      interval,
      segmentTreeData.datesToIndex
    );
    const widthOfOneCS = getCSWidth(noOfDataPoints, xAxisConfig.canvasWidth) + 4;
    setXAxisConfig(prev => {
      return {
        ...prev,
        startTime,
        endTime,
        dates,
        noOfDataPoints,
        widthOfOneCS
      }
    })
  },[stockData])
  function updatePriceRange(){
    const result = getMinMaxPrices(
      yAxisConfig.segmentTreeData.segmentTree,
      yAxisConfig.segmentTreeData.datesToIndex,
      getObjtoStringTime(xAxisConfig.endTime),
      getObjtoStringTime(xAxisConfig.startTime),
      stockData.length
    );
    if (
      result &&
      (result.maxPrice !== priceRange.maxPrice ||
        result.minPrice !== priceRange.minPrice) &&
      (result.maxPrice !== Number.MIN_SAFE_INTEGER ||
        result.minPrice !== Number.MAX_SAFE_INTEGER)
    ) {
      setPriceRange(() => {
        return { ...result };
      });
    }
  }
  useLayoutEffect(() => {
    if(!scrollOffset)return;
    updatePriceRange();
    let noOfCSMoved = getCandleSticksMoved(
      scrollOffset,
      xAxisConfig.widthOfOneCS
    );
    if (
      noOfCSMoved > 0 &&
      getObjtoStringTime(xAxisConfig.startTime) ===
        xAxisConfig.dates[xAxisConfig.dates.length - 1]
    ) {
      noOfCSMoved = 0;
      return;
    } else if (
      noOfCSMoved < 0 &&
      getObjtoStringTime(xAxisConfig.endTime) === xAxisConfig.dates[0]
    ) {
      noOfCSMoved = 0;
      return;
    }
    const { startTime, endTime } = getNewTime(
      xAxisConfig.startTime,
      xAxisConfig.endTime,
      noOfCSMoved,
      yAxisConfig.segmentTreeData.datesToIndex
    );
    setXAxisConfig((prev) => {
      return {
        ...prev,
        startTime,
        endTime,
      };
    });
  }, [scrollOffset]);
  useEffect(() => {
    const canvas = ChartContainerRef.current;
    let width = ChartContainerRef.current.parentElement.offsetWidth;
    let height = ChartContainerRef.current.parentElement.offsetHeight;
    const dpr = window.devicePixelRatio | 1;
    if (width < windowSize[0]) {
      canvas.width = width * dpr;
    }
    if (height < windowSize[1]) {
      canvas.height = height * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const noOfDataPoints = getDataPointsCount(
      xAxisConfig.startTime,
      xAxisConfig.endTime,
      interval,
      yAxisConfig.segmentTreeData.datesToIndex
    );
    const widthOfOneCS = getCSWidth(noOfDataPoints, width);
    setXAxisConfig((prev) => {
      return {
        ...prev,
        canvasWidth: canvas.width / dpr,
        canvasHeight: canvas.height / dpr,
        noOfDataPoints: noOfDataPoints,
        widthOfOneCS: widthOfOneCS + 4,
      };
    });
  }, [windowSize]);
  return (
    <div className="flex w-[100%] flex-col border-l-2 border-gray-300">
      <div className="w-[100%] h-[95%]">
        <canvas
          ref={ChartContainerRef}
          className="w-[100%] border-b-2 border-gray-300"
        ></canvas>
      </div>

      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
