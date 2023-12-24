import React, { useContext, useState } from "react";
import StockContext from "../../context/stock_context.jsx";
import { searchSymbol } from "../../utility/stock_api.js";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCandlestickChart } from "react-icons/md";


function SearchBar(){
  const {setSelectedStock, interval} = useContext(StockContext);
  const [searchVal, setSearchVal] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const updateBestMatches = async() => {
    const data = await searchSymbol(searchVal);
    if(data && data.result) setFilteredProduct(data.result);
  }
  const selectStock = (stock) => {
    setSearchVal(() => {
      return stock;
    });
    setSelectedStock(() => {
      return stock;
    });
    setFilteredProduct([]);
  };
  return (
    <div className="flex justify-between items-center pl-2 pr-5 border-l-2 border-b-2 border-gray-300">
      <div className="flex items-center w-full h-full">
        <div className="flex flex-row justify-evenly items-center border border-gray-300 p-2 rounded-full">
          <FaSearch color="gray" className="mr-2"/>
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
        </div>
        {
          <div
            className={
              searchVal !== ""
                ? "absolute flex flex-col items-start z-10 bg-gray-100 top-10 w-[300px] h-fit max-h-[300px] overflow-y-auto"
                : "hidden"
            }
          >
            {filteredProduct[0] !== searchVal &&
              filteredProduct.map((item) => {
                return (
                  <button
                    onFocus={(e) => selectStock(e.target.value)}
                    value={item.symbol}
                    key={item.symbol}
                    className="flex items-center justify-between w-full"
                  >
                     <span>{item.symbol}</span>
                     <span>{item.description}</span>
                  </button>
                );
              })}
          </div>
        }
        <div className="border-l-2 ml-2 h-2/3"></div>
        <button className="m-1 p-2 hover:bg-gray-200 rounded-md text-gray-600">
          {interval}
        </button>
        <div className="border-l-2 h-2/3"></div>
        <button className="m-1 p-2 hover:bg-gray-200 rounded-md ">
          <MdOutlineCandlestickChart size={22}/>
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
