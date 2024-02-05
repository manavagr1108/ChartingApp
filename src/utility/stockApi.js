import axios from "axios";

function parseData(data) {
  console.log(data);
  const fetchedData = [];
  data.data.candles.forEach((item) => {
    fetchedData.push({
      Date: item[0].slice(0, 10),
      Open: item[1],
      High: item[2],
      Low: item[3],
      Close: item[4],
      Volume: item[5],
    });
  });
  return fetchedData.reverse();
}

// export const searchSymbol = async (query) => {
//   if (query === "") return;
//   const response = await axios.get(
//     `${import.meta.env.VITE_BASE_URL}/search?q=${query}&token=${import.meta.env.VITE_API_KEY}`
//   );
//   if (response.status !== 200) {
//     const message = `An error has occured: ${response.status}`;
//     throw new Error(message);
//   }
//   return response.data;
// };

export const getStockData = async (instrumentKey, interval) => {
  if (instrumentKey === "") return;
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}getHistory?instrument_key=${instrumentKey}&interval=${interval}`
  );
  if (response.status !== 200) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return parseData(response.data);
};
