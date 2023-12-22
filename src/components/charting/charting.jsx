import React, { useContext, useEffect } from 'react'
import StockContext from '../../context/stock_context'

function Charting() {
  const {selectedStock} = useContext(StockContext);
  useEffect(()=>{
    console.log(selectedStock);
  },[selectedStock]);
  return (
    <div className='flex flex-col bg-gray-200'>
      <div className='bg-gray-200 w-full h-[95%]'></div>
      <div className='bg-gray-300 w-full h-[5%]'></div>
    </div>
  )
}

export default Charting