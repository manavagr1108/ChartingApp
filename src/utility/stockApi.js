import axios from "axios";

function parseData(data) {
  const rows = data.split("\n");
  const headers = rows[0].split(",");
  const jsonData = rows
    .slice(1)
    .filter((row) => row.trim() !== "")
    .map((row) => {
      const values = row.split(",");
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] =
          index === 0
            ? values[index].trim()
            : parseFloat(values[index].trim());
        return obj;
      }, {});
    });

  const fetchedData = [];
  jsonData.forEach((item) => {
    fetchedData.push({
      Date: item.Date,
      Open: item.Open,
      High: item.High,
      Low: item.Low,
      Close: item.Close,
      AdjClose: item["Adj Close"],
      Volume: item.Volume,
    });
  });
  return fetchedData;
}

export const searchSymbol = async (query) => {
  if (query === "") return;
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/search?q=${query}&token=${import.meta.env.VITE_API_KEY}`);
  if (response.status !== 200) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.data;
}

export const getStockData = async (symbol, interval) => {
  if (symbol === "") return;
  const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}getHistory?symbol=${symbol}&interval=${interval}`);
  if (response.status !== 200) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return parseData(response.data);
}