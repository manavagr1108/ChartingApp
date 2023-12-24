import { createContext } from "react";

export const selectedStock = {
    stock: "",
    setStock: () => {},
    timeRange: "",
    setTimeRange: () => {}
}

const StockContext = createContext(selectedStock);

export default StockContext;
