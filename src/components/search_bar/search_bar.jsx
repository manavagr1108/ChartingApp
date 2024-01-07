import React, { useState } from "react";
import { searchSymbol } from "../../utility/stock_api.js";
import { FaSearch } from "react-icons/fa";
import { useOutsideClick } from "../nav_bar/nav_bar.jsx";

function SearchBar({ selectedStock, mode }) {
  const [searchVal, setSearchVal] = useState("");
  const [filteredProduct, setFilteredProduct] = useState([]);
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
  return (
    <div
      ref={dropRefSelectStock}
      className={`flex relative flex-row justify-evenly items-center border ${
        mode === "Light" ? "border-gray-800" : "border-gray-300"
      } p-2 rounded-full`}
    >
      <FaSearch
        color={`${mode === "Light" ? "gray" : "white"}`}
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
        } ${mode === "Light" ? "bg-gray-100" : "bg-gray-900"}`}
        value={searchVal}
        placeholder="Search Stocks..."
      />
      {
        <div
          className={
            searchVal !== ""
              ? `absolute shadow-md rounded-lg cursor-pointer flex flex-col items-start z-10 ${
                  mode === "Light" ? "bg-gray-100" : "bg-gray-900"
                } top-10 left-[-2px] w-[400px] h-fit max-h-[300px] overflow-y-auto no-scrollbar`
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
                  className={`flex rounded-lg px-2 py-1 items-center justify-between w-full ${
                    mode === "Light" ? "hover:bg-white" : "hover:bg-gray-800"
                  }`}
                >
                  <span
                    className={
                      mode === "Light" ? "text-gray-800" : "text-white"
                    }
                  >
                    {item.symbol}
                  </span>
                  <span
                    className={
                      mode === "Light" ? "text-gray-800" : "text-white"
                    }
                  >
                    {item.description}
                  </span>
                </button>
              );
            })}
        </div>
      }
    </div>
  );
}

export default SearchBar;
