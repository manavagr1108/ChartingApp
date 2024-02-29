import React, { useEffect, useRef } from "react";
import { MdOutlineCandlestickChart, MdOutlineShowChart } from "react-icons/md";
import { intervalMap } from "../../utility/xAxisUtils.js";
import DropdownMenu from "../dropdown/dropdownMenu.jsx";
import Indicators from "../indicators/indicators.jsx";
import SearchBar from "../searchbar/searchbar.jsx";

const chartTypes = {
  Candles: <MdOutlineCandlestickChart size={22} />,
  Line: <MdOutlineShowChart size={22} />,
};

export const useOutsideClick = (callBackFunc) => {
  const dropRef = useRef();
  useEffect(() => {
    let handler = (event) => {
      if (!dropRef.current?.contains(event.target)) {
        callBackFunc();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });
  return dropRef;
};

function NavBar({ ChartWindow, mode, toggleMode }) {
  const { instrumentKey, interval, chartType, stocksList } = ChartWindow;
  return (
    <div
      className={`flex justify-between items-center pl-2 pr-5 border-l-2 border-b-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <div className="flex items-center w-full h-full">
        <SearchBar instrumentKey={instrumentKey} stocksList={stocksList} mode={mode} />
        <div className="border-l-2 ml-2 h-2/3"></div>
        <DropdownMenu
          menuList={intervalMap}
          stateToBeUpdated={interval}
          mode={mode}
        />
        <div className="border-l-2 h-2/3"></div>
        <DropdownMenu
          menuList={chartTypes}
          stateToBeUpdated={chartType}
          mode={mode}
        />
        <div className="border-l-2 h-2/3"></div>
        <Indicators ChartWindow={ChartWindow} mode={mode} />
      </div>
      <div className="flex items-center ml-2">
        <label
          className={`flex items-center ${
            mode === "Light" ? "text-gray-600" : "text-white"
          } transition-all duration-300`}
        >
          <span className="mr-2 transition-all duration-300">{mode}</span>
          <div
            className={`relative flex-shrink-0 w-14 h-6 ${
              mode === "Light" ? "bg-gray-300" : "bg-gray-800"
            } rounded-full cursor-pointer transition-all duration-300`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={mode === "Dark"}
              onChange={toggleMode}
            />
            <div
              className={`absolute w-6 h-6 ${
                mode === "Light" ? "left-0" : "right-0"
              } bg-white rounded-full shadow-md border border-gray-400 transform transition-transform duration-300`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
}

export default NavBar;
