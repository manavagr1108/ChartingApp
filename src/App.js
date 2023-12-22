import { useMemo, useState } from 'react';
import './App.css';
import Charting from './components/charting/charting';
import SearchBar from './components/search_bar/search_bar';
import StockSelect from './components/stock_select/stock_select';
import ToolBar from './components/tool_bar/tool_bar';
import StockContext, { selectedStock } from './context/stock_context';

function App() {
  const [selectedStock , setSelectedStock] = useState("");
  const value = useMemo(
    () => ({selectedStock, setSelectedStock}),
    [selectedStock]
  )
  return (
    <div className='app'>
      <StockContext.Provider value={ value }>
        <div className='grid grid-cols-[3rem_1fr] grid-rows-[3rem_1fr] h-full'>
          <StockSelect />
          <SearchBar />
          <ToolBar />
          <Charting />
        </div>
      </StockContext.Provider>
    </div>
  );
}

export default App;
