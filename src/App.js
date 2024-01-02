import { useMemo, useState, useLayoutEffect } from 'react';
import './App.css';
import Charting from './components/charting/charting';
import SearchBar from './components/search_bar/search_bar';
import StockSelect from './components/stock_select/stock_select';
import ToolBar from './components/tool_bar/tool_bar';
import StockContext from './context/stock_context';
import xAxisContext from './context/xAxis_context';

function App() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [interval, setInterval] = useState("1d");
  const [stockData, setStockData] = useState([]);
  const stockContextValue = useMemo(
    () => ({ selectedStock, setSelectedStock, interval, setInterval, stockData, setStockData }),
    [selectedStock, interval, stockData]
  )
  // const xAxisValue = useMemo(
  //   () => ({ startTime, setStartTime, endTime, setEndTime }),
  //   [startTime, endTime]
  // )

  return (
    <div className='app'>
      <StockContext.Provider value={stockContextValue}>
        {/* <xAxisContext.Provider value={xAxisValue} > */}
        <div className='grid grid-cols-[3rem_1fr] grid-rows-[3rem_1fr] h-screen'>
          <StockSelect />
          <SearchBar />
          <ToolBar />
          <Charting />
        </div>
        {/* </xAxisContext.Provider> */}
      </StockContext.Provider>
    </div>
  );
}

export default App;
