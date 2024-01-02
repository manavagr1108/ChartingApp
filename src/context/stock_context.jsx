import { createContext } from "react";

export const selectedStock = {
    stock: "",
    setStock: () => {},
    interval: "",
    setInterval: () => {},
    stockData: [],
    setStockData: () => {},
}

const StockContext = createContext(selectedStock);

export default StockContext;
