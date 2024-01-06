import React, { useState } from "react";
import { searchSymbol } from "../../utility/stock_api.js";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCandlestickChart } from "react-icons/md";

function SearchBar({ selectedStock, interval, mode, toggleMode }) {
  const [searchVal, setSearchVal] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
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

  return (
    <div
      className={`flex justify-between items-center pl-2 pr-5 border-l-2 border-b-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <div
        className={`flex items-center w-full h-full ${
          mode === "Light" ? "text-black" : "text-white"
        }`}
      >
        <div
          className={`flex flex-row justify-evenly items-center border ${
            mode === "Light" ? "border-gray-300" : "border-gray-600"
          } p-2 rounded-full h-5/5 ${
            mode === "Light" ? "bg-white" : "bg-gray-800"
          }`}
        >
          <FaSearch
            color={mode === "Light" ? "#000" : "#fff"}
            className="mr-2"
          />
          <input
            type="search"
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateBestMatches();
              }
            }}
            className={`w-[300px] border-l-2 ${
              mode === "Light" ? "border-gray-300" : "border-gray-600"
            } h-3/5 outline-none pl-2 ${
              mode === "Light" ? "text-gray-800" : "text-white"
            } ${mode === "Light" ? "bg-white" : "bg-gray-800"}`}
            value={searchVal}
            placeholder="Search Stocks..."
          />
        </div>
        {searchVal !== "" && (
          <div
            className={`absolute flex flex-col items-start z-10 ${
              mode === "Light" ? "bg-gray-100" : "bg-gray-900"
            } top-10 w-[300px] h-fit max-h-[300px] overflow-y-auto`}
          >
            {filteredProduct[0] !== searchVal &&
              filteredProduct.map((item) => (
                <button
                  onFocus={(e) => selectStock(e.target.value)}
                  value={item.symbol}
                  key={item.symbol}
                  className="flex items-center justify-between w-full"
                >
                  <span>{item.symbol}</span>
                  <span>{item.description}</span>
                </button>
              ))}
          </div>
        )}
        <div className="border-l-2 ml-2 h-2/3"></div>
        <button
          className={`m-1 p-2 rounded-md ${
            mode === "Light"
              ? "text-gray-600 hover:bg-gray-800"
              : "text-white hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          {interval}
        </button>
        <div className="border-l-2 h-2/3"></div>
        <button
          className={`m-1 p-2 hover:bg-gray-200 rounded-md ${
            mode === "Light"
              ? "text-gray-600 hover:bg-gray-800"
              : "text-white hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          <MdOutlineCandlestickChart size={22} />
        </button>
      </div>
      <div className="flex items-center ml-2">
        <label
          className={`flex items-center ${
            mode === "Light" ? "text-gray-600" : "text-white"
          } transition-all duration-300`}
        >
          <span className="mr-2 transition-all duration-300">{mode}</span>
          <div
            className={`relative flex-shrink-0 w-14 h-6 ${
              mode === "Light" ? "bg-gray-300" : "bg-gray-800"
            } rounded-full cursor-pointer transition-all duration-300`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={mode === "Dark"}
              onChange={toggleMode}
            />
            <div
              className={`absolute w-6 h-6 ${
                mode === "Light" ? "left-0" : "right-0"
              } bg-white rounded-full shadow-md border border-gray-400 transform transition-transform duration-300`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
}

export default SearchBar;
