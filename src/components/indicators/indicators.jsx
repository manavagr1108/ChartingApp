import React, { useState } from "react";
import { FcComboChart } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import { indicatorConfig } from "../../config/indicatorsConfig";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

function Indicators({ mode, ChartWindow }) {
  const { onChartIndicatorSignal, offChartIndicatorSignal } = ChartWindow;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleKeyClick = (key) => {
    if (indicatorConfig[key].chartRequired) {
      offChartIndicatorSignal.value = [
        ...offChartIndicatorSignal.peek(),
        indicatorConfig[key],
      ];
    } else {
      onChartIndicatorSignal.value = [
        ...onChartIndicatorSignal.peek(),
        indicatorConfig[key],
      ];
    }
    setIsModalOpen(!isModalOpen);
  };
  const indicatorModal = () => {
    return (
      <div
        className={`flex justify-start flex-col w-full h-full px-10 py-3 border-r-2 transition-transform ease-in-out duration-700 transform translate-x-0`}
      >
        <p
          className={`w-auto text-left h-auto py-3 ${mode === "Light" ? "text-gray-500" : "text-gray-400"}`}
        >
          Select your Indicator:
        </p>
        {Object.keys(indicatorConfig)
          .sort()
          .map((key) => (
            <button
              className={`flex justify-between items-center w-full h-[100px] border-2 rounded-lg px-5 mt-5 hover:cursor-pointer ${mode === "Light" ? "bg-gray-300 border-gray-300 hover:bg-gray-400" : "bg-gray-700 border-gray-700 hover:bg-gray-800 hover:text-gray-900"}`}
              key={key}
              onClick={() => handleKeyClick(key)}
            >
              <p
                className={`${
                  mode === "Light" ? "text-gray-900" : "text-gray-100"
                }`}
              >
                {indicatorConfig[key].label}
              </p>
              <FaArrowRight
                className={`${
                  mode === "Light" ? "text-gray-900" : "text-gray-100"
                }`}
              />
            </button>
          ))}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        className={`flex items-center
          relative m-1 p-2 ${
            mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-800"
          } rounded-md `}
      >
        <FcComboChart size={22} />
        <div
          className={`ml-2 text-base ${
            mode === "Light" ? "text-gray-600" : "text-gray-200"
          }`}
        >
          Indicators
        </div>
      </button>
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-start justify-center z-10">
          <div
            className={`absolute w-full h-full ${mode === "Light" ? "bg-gray-900" : "bg-gray-100"} opacity-50`}
            onClick={() => setIsModalOpen(!isModalOpen)}
          ></div>
          <div
            className={`relative w-[400px] h-[600px] ${mode === "Light" ? "bg-gray-100" : "bg-gray-900"} rounded-lg shadow-lg flex flex-col items-center justify-center mt-20 pb-10`}
          >
            <div
              className={`flex items-center justify-between w-full px-7 py-5 ${mode === "Light" ? "bg-gray-200" : "bg-gray-800"} rounded-lg`}
            >
              <div
                className={`ml-2 text-2xl text-center ${mode === "Light" ? "text-gray-600" : "text-gray-200"}`}
              >
                Indicators
              </div>
              <RxCross1
                size={20}
                className={`${mode === "Light" ? "text-gray-600" : "text-gray-200"}`}
                onClick={() => setIsModalOpen(!isModalOpen)}
                cursor={"pointer"}
              />
            </div>

            <div className="flex flex-row items-start w-full h-full overflow-y-auto overflow-x-hidden">
              {indicatorModal()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Indicators;
