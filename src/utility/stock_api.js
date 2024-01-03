import axios from "axios";

export const searchSymbol = async (query) => {
    if(query === "")return;
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/search?q=${query}&token=${process.env.REACT_APP_API_KEY}`);
    if (response.status !== 200) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return response.data;
}

export const getStockData = async (symbol, interval) => {
    if(symbol === "")return;
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}getHistory?symbol=${symbol}`);
    if (response.status !== 200) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return response.data;
}