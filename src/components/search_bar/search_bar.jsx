import React, { useContext, useState } from "react";
import StockContext from "../../context/stock_context.jsx";
import { searchSymbol } from "../../utility/stock_api.js";


function SearchBar(){
  const {selectedStock, setSelectedStock} = useContext(StockContext);
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
    <div className="flex justify-between items-center pl-2 pr-5">
      <div className="flex items-center w-full h-full">
        <input
          type="search"
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateBestMatches();
            }
          }}
          className="bg-gray-300 w-[200px] h-3/5 rounded-md outline-none"
          value={searchVal}
          placeholder="Search Stocks..."
        />
        {
          <div
            className={
              searchVal !== ""
                ? "absolute flex flex-col items-start z-10 bg-gray-100 top-10 w-[200px] h-fit max-h-[200px] overflow-y-auto"
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
      </div>
      <div className="flex flex-row gap-x-4">
        <div>Nifty</div>
        <div>Bank Nifty</div>
        <div>Sensex</div>
      </div>
    </div>
  );
}

export default SearchBar;
