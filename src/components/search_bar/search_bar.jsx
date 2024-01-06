import React, { useEffect, useState, useRef } from "react";
import { searchSymbol } from "../../utility/stock_api.js";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCandlestickChart, MdOutlineShowChart } from "react-icons/md";
import { intervalMap } from "../../utility/xAxisUtils.js";
import { effect } from "@preact/signals-react";

const chartTypes = {
  'Candles': <MdOutlineCandlestickChart size={22} />,
  'Line': <MdOutlineShowChart size={22} />,
};

const useOutsideClick = (callBackFunc) => {
  const dropRef = useRef();
  useEffect(() => {
    let handler = (event) => {
      if (!dropRef.current?.contains(event.target)) {
        console.log("func called");
        callBackFunc();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });
  return dropRef;
};

function SearchBar({ selectedStock, interval, chartType }) {
  const [searchVal, setSearchVal] = useState("");
  const [toggleInterval, setToggleInterval] = useState(true);
  const [toogleChartType, setToogleChartType] = useState(true);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const dropRefInterval = useOutsideClick(() => setToggleInterval(true));
  const dropRefChartType = useOutsideClick(() => setToogleChartType(true));
  const dropRefSelectStock = useOutsideClick(() => setSearchVal(""));
  const updateBestMatches = async () => {
    const data = await searchSymbol(searchVal);
    if (data && data.result) setFilteredProduct(data.result);
  };
  const selectStock = (stock) => {
    setSearchVal(() => {
      return stock;
    });
    selectedStock.value = stock;
    setFilteredProduct([]);
  };
  effect(() => {
    console.log(selectedStock.value);
  });
  return (
    <div className="flex justify-between items-center pl-2 pr-5 border-l-2 border-b-2 border-gray-300">
      <div className="flex items-center w-full h-full">
        <div
          ref={dropRefSelectStock}
          className="flex relative flex-row justify-evenly items-center border border-gray-300 p-2 rounded-full"
        >
          <FaSearch color="gray" className="mr-2" />
          <input
            type="search"
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateBestMatches();
              }
            }}
            className="w-[300px] border-l-2 border-gray-300 h-3/5 outline-none pl-2"
            value={searchVal}
            placeholder="Search Stocks..."
          />
          {
            <div
              className={
                searchVal !== ""
                  ? "absolute shadow-md rounded-lg cursor-pointer flex flex-col items-start z-10 bg-gray-100 top-10 left-[-2px] w-fit h-fit max-h-[300px] overflow-y-auto"
                  : "hidden"
              }
            >
              {filteredProduct[0] !== searchVal &&
                filteredProduct.map((item) => {
                  return (
                    <button
                      onClick={(e) => selectStock(item.symbol)}
                      value={item.symbol}
                      key={item.symbol}
                      className="flex rounded-lg px-2 py-1 items-center justify-between w-full hover:bg-white"
                    >
                      <span>{item.symbol}</span>
                      <span>{item.description}</span>
                    </button>
                  );
                })}
            </div>
          }
        </div>
        <div className="border-l-2 ml-2 h-2/3"></div>
        <button
          ref={dropRefInterval}
          onClick={() => setToggleInterval(!toggleInterval)}
          className="relative m-1 p-2 hover:bg-gray-200 rounded-md text-gray-600"
        >
          {interval}
          {
            <div
              className={
                toggleInterval
                  ? "hidden"
                  : "absolute shadow-md rounded-lg cursor-pointer flex flex-col items-start z-10 bg-gray-100 top-10 left-[-2px] w-fit h-fit max-h-[300px] overflow-y-auto"
              }
            >
              {Object.keys(intervalMap).map((ele) => {
                return (
                  <div
                    className="w-full hover:bg-white px-2 py-1"
                    value={ele}
                    onClick={() => (interval.value = ele)}
                  >
                    {ele}
                  </div>
                );
              })}
            </div>
          }
        </button>
        <div className="border-l-2 h-2/3"></div>
        <button
          ref={dropRefChartType}
          onClick={() => setToogleChartType(!toogleChartType)}
          className="relative m-1 p-2 hover:bg-gray-200 rounded-md text-gray-600"
        >
          {chartTypes[chartType]}
          {
            <div
              className={
                toogleChartType
                  ? "hidden"
                  : "absolute shadow-md rounded-lg cursor-pointer flex flex-col items-start z-10 bg-gray-100 top-10 left-[-2px] w-fit h-fit max-h-[300px] overflow-y-auto"
              }
            >
              {Object.keys(chartTypes).map((ele) => {
                return (
                  <div
                    className="flex w-full hover:bg-white px-2 py-1"
                    value={ele}
                    onClick={() => (chartType.value = ele)}
                  >
                    {chartTypes[ele]}
                    {ele}
                  </div>
                );
              })}
            </div>
          }
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
