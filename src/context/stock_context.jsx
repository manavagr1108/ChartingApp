import { createContext } from "react";

export const selectedStock = {
    stock: "",
    setStock: () => {},
}

const StockContext = createContext(selectedStock);

export default StockContext;
