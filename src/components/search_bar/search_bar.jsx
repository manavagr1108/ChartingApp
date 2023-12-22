import React, { useContext, useEffect, useState } from "react";
import { NIFTY_50_STOCKS } from "../../data/NIFTY_50_STOCK_LIST.js";
import StockContext from "../../context/stock_context.jsx";

function SearchBar() {
  const {selectedStock, setSelectedStock} = useContext(StockContext);
  const filteredProduct = NIFTY_50_STOCKS.filter((item) => {
    return item.toLocaleLowerCase().includes(selectedStock.toLocaleLowerCase());
  });
  const selectStock = (stock) => {
    setSelectedStock(() => {
      return stock;
    });
  };
  return (
    <div className="flex justify-between items-center pl-2 pr-5">
      <div className="flex items-center w-full h-full">
        <input
          type="search"
          onChange={(e) => setSelectedStock(e.target.value)}
          className="bg-gray-300 w-[200px] h-3/5 rounded-md outline-none"
          value={selectedStock}
        />
        {
          <div
            className={
              selectedStock !== ""
                ? "absolute flex flex-col items-start z-10 bg-gray-100 top-10 w-[200px] h-fit max-h-[200px] overflow-y-auto"
                : "hidden"
            }
          >
            {filteredProduct[0] !== selectedStock &&
              filteredProduct.map((item) => {
                return (
                  <button
                    onFocus={(e) => selectStock(e.target.value)}
                    value={item}
                    key={item}
                  >
                    {item}
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
