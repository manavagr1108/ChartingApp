import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StockContext from "../../context/stock_context";
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
} from "../../utility/xAxisUtils";
import {
  buildSegmentTree,
  getMinMaxPrices,
  getYCoordinate,
  drawCandleStick,
} from "../../utility/yAxisUtils";
import { monthMap } from "../../data/TIME_MAP";

function Charting() {
  const { selectedStock, interval } = useContext(StockContext);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
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
    endTime: getTime(data[data.length - 251].Date),
    dates: getWeekDates(
      getTime(data[data.length - 1].Date),
      getTime(data[0].Date)
    ),
  });
  const [yAxisConfig, setYAxisConfig] = useState({
    margin: 55,
    noOfColumns: 12,
    segmentTreeData: buildSegmentTree(data),
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
  }, [windowSize]);

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
      `http://localhost:8080/getHistory?symbol=JPM&start_date=${getObjtoStringTime(
        xAxisConfig.endTime
      )}&end_date=${getObjtoStringTime(xAxisConfig.startTime)}`
    )
      .then((response) => response.text())
      .then((csvData) => {
        const rows = csvData.split("\n");
        const headers = rows[0].split(",");
        console.log("headers:", headers);
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

        console.log("fetchedData:", fetchedData);

        const result = getMinMaxPrices(
          buildSegmentTree(fetchedData),
          fetchedData.reduce((acc, curr, index) => {
            acc[getObjtoStringTime(curr.Date)] = index;
            return acc;
          }, {}),
          getObjtoStringTime(xAxisConfig.endTime),
          getObjtoStringTime(xAxisConfig.startTime),
          fetchedData.length
        );

        if (
          result &&
          (result.maxPrice !== priceRange.maxPrice ||
            result.minPrice !== priceRange.minPrice) &&
          (result.maxPrice !== Number.MIN_SAFE_INTEGER ||
            result.minPrice !== Number.MAX_SAFE_INTEGER)
        ) {
          setPriceRange({ ...result });
        }
        const canvas = ChartContainerRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, xAxisConfig.canvasWidth, xAxisConfig.canvasHeight);
        ctx.font = "12px Arial";
        const pDiff = priceRange.maxPrice - priceRange.minPrice;
        for (let i = yAxisConfig.noOfColumns; i > 0; i--) {
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

        console.log("startIndex:", startIndex);
        console.log("endIndex:", endIndex);

        if (startIndex === undefined || endIndex === undefined) {
          console.log("Undefined startIndex or endIndex:");
          return;
        }

        const resultData = fetchedData.reverse();
        console.log("resultData:", resultData);

        resultData.forEach((d, i) => {
          const xCoord =
            xAxisConfig.canvasWidth -
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
            console.log(d.Date, currentMonth, currentYear);
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
      })
      .catch((error) => {
        console.error("Error fetching data from API:", error);
      });
  }, [xAxisConfig, priceRange]);

  useLayoutEffect(() => {
    const result = getMinMaxPrices(
      yAxisConfig.segmentTreeData.segmentTree,
      yAxisConfig.segmentTreeData.datesToIndex,
      getObjtoStringTime(xAxisConfig.endTime),
      getObjtoStringTime(xAxisConfig.startTime),
      data.length
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
      xAxisConfig.dates
    );
    setXAxisConfig((prev) => {
      return {
        ...prev,
        startTime: startTime,
        endTime: endTime,
      };
    });
  }, [scrollOffset]);
  useEffect(() => {
    const canvas = ChartContainerRef.current;
    let width = ChartContainerRef.current.parentElement.offsetWidth;
    let height = ChartContainerRef.current.parentElement.offsetHeight;
    const dpr = window.devicePixelRatio | 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const noOfDataPoints = getDataPointsCount(
      xAxisConfig.startTime,
      xAxisConfig.endTime,
      interval,
      xAxisConfig.dates
    );
    const widthOfOneCS = getCSWidth(noOfDataPoints, width);
    setXAxisConfig((prev) => {
      return {
        ...prev,
        canvasWidth: width,
        canvasHeight: height,
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
