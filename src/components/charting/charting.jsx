import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import StockContext from "../../context/stock_context";
import { createChart } from "lightweight-charts";
import stockData from "../../csvjson.json";
import { monthMap } from "../../data/TIME_MAP";


function Charting() {
  const { selectedStock, interval } = useContext(StockContext);
  const [windowSize, setWindowSize] = useState([window.innerWidth,window.innerHeight]);
  const ChartContainerRef = useRef(null);
  const ChartContainerRef1 = useRef(null);
  useEffect(() => {
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
  }, [selectedStock, interval]);

  useLayoutEffect(() => {
    function updateSize() {
      setWindowSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [windowSize]);

  useEffect(()=>{
    const data = stockData.data;
    const canvas = ChartContainerRef1.current;
    canvas.width = ChartContainerRef1.current.parentElement.offsetWidth
    canvas.height = ChartContainerRef1.current.parentElement.offsetHeight
    const ctx = ChartContainerRef1.current.getContext("2d");
    let marginX = 30;
    let marginY = 55;
    let width = canvas.width;
    let height = canvas.height;
    let offsetHeight = 15;
    let offsetWidth = 15;
    console.log(width, height);
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(0,height-marginX);
    ctx.lineTo(width,height-marginX);
    ctx.moveTo(width-marginY, 0);
    ctx.lineTo(width-marginY, height);
    ctx.stroke();

    // console.table(data);


    // set x-axis
    const startDate = data[data.length-1].Date;
    const endDate = data.length > 252 ? data[data.length - 251].Date : data[0].Date; 
    const startMonthIndex = new Date(startDate).getMonth();
    // console.log(startDate, endDate, startMonthIndex);
    ctx.font = '15px Arial';
    ctx.fillStyle = 'black';
    for(let i = 0; i < 12 ;i++){
      const currentMonth = monthMap[(i+startMonthIndex+1)%12];
      ctx.fillText(currentMonth, parseInt(i*(width-marginY)/12), parseInt(height - marginX + offsetHeight) );
    }

    // set y-axis
    const adjClosedPrice = data.map(d => d["Adj Close"]);
    const maxPrice = Math.ceil(Math.max(...adjClosedPrice));
    const minPrice = Math.floor(Math.min(...adjClosedPrice));
    // console.log(adjClosedPrice, maxPrice, minPrice);
    for(let i = 1; i <= 12 ;i++){
      ctx.fillText(parseInt(maxPrice-(maxPrice - minPrice)/12 * i), parseInt(width - marginY + offsetWidth), parseInt((height - marginX)*i/12));
    }

    // plot data points
    ctx.beginPath();
    data.forEach(d => {
      const date = d.Date.split("-");
      if(date[0] !== "2022"){
        const xValue = ((parseInt(date[1])-1)*(width-marginY)/12) + (width-marginY)*parseInt(date[2])/(31*12);
        const k = (height-marginX)/12;
        const yValue = height - marginX - k*((d["Adj Close"] - minPrice)/((maxPrice - minPrice)/12));
        // console.log(xValue, yValue);
        // ctx.beginPath();
        // ctx.arc(xValue, yValue, 1, 0, 2 * Math.PI);
        // ctx.fill();
        ctx.lineTo(xValue, yValue);
      }
    })
    ctx.stroke();
  },[windowSize]);
  return (
    <div className="flex w-[100%] flex-col border-l-2 border-gray-300">
      {/* <div ref={ChartContainerRef} className="w-full h-[95%]"></div> */}
      <div className="w-[100%] h-[95%]">
        <canvas ref={ChartContainerRef1} className="w-[100%] border-b-2 border-gray-300" >
        </canvas>
      </div>

      <div className="w-full h-[5%]"></div>
    </div>
  );
}

export default Charting;
