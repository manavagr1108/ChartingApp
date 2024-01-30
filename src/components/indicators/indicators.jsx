import React, { useState } from "react";
import { FcComboChart } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import { indicatorConfig } from "../../config/indicatorsConfig";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

function Indicators({ mode, ChartWindow }) {
  const { onChartIndicatorSignal, offChartIndicatorSignal } = ChartWindow;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [inputValues, setInputValues] = useState({});

  const handleIndicators = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedKey(null);
    setInputValues({});
  };

  const handleKeyClick = (key) => {
    setSelectedKey(key);
  };

  const handlePropertyInputChange = (property, value) => {
    const selectedIndicatorConfig = indicatorConfig[selectedKey];
    if (!inputValues[selectedKey]) {
      setInputValues((prevValues) => ({
        ...prevValues,
        [selectedKey]: {
          ...selectedIndicatorConfig,
          [property]: value,
        },
      }));
    } else {
      setInputValues((prevValues) => ({
        ...prevValues,
        [selectedKey]: {
          ...prevValues[selectedKey],
          [property]: value,
        },
      }));
    }
  };

  const updateIndicatorSignal = () => {
    const selectedIndicatorConfig = indicatorConfig[selectedKey];
    if (selectedIndicatorConfig.chartRequired) {
      Object.keys(selectedIndicatorConfig).forEach((key) => {
        if (inputValues[key] === undefined) return;
      });
      offChartIndicatorSignal.value = [
        ...offChartIndicatorSignal.peek(),
        inputValues[selectedKey],
      ];
    } else {
      Object.keys(selectedIndicatorConfig).forEach((key) => {
        if (inputValues[key] === undefined) return;
      });
      onChartIndicatorSignal.value = [
        ...onChartIndicatorSignal.peek(),
        inputValues[selectedKey],
      ];
    }
    setIsModalOpen(false);
  };

  const indicatorModal = () => {
    if (selectedKey) {
      return (
        <div
          className={`flex flex-col justify-start items-start w-full h-full py-3 transition-transform ease-in-out duration-700 transform translate-x-0`}
        >
          <p
            className={`w-full text-center h-auto py-3 mb-5 ${mode === "Light" ? "text-gray-500" : "text-gray-200"}`}
          >
            Set the values for your indicator:
          </p>
          {Object.keys(indicatorConfig[selectedKey]).map((property) => {
            if (
              property === "label" ||
              property === "chartRequired" ||
              property === "drawChartFunction" ||
              property === "getChartData" ||
              property === "name"
            )
              return null;

            if (property === "color") {
              return (
                <div
                  key={property}
                  className="flex flex-row justify-start items-center w-full h-auto py-3 ml-16"
                >
                  <label
                    className={`flex justify-center items-center ${mode === "Light" ? "text-gray-900" : "text-gray-100"} w-auto h-auto pr-10 py-3`}
                  >
                    {property.charAt(0).toUpperCase() + property.slice(1)}:
                  </label>
                  <div className="flex flex-row">
                    <input
                      type="color"
                      value={inputValues[selectedKey]?.[property] || ""}
                      onChange={(e) =>
                        handlePropertyInputChange(property, e.target.value)
                      }
                      className={`w-[40px] h-[40px] p-[1px] border-2 ${mode === "Light" ? "border-gray-200" : "border-gray-900"} rounded-md`}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={property}
                className="flex flex-row justify-center items-start w-full h-auto py-3"
              >
                <label
                  className={`flex justify-center items-center ${mode === "Light" ? "text-gray-900" : "text-gray-100"} w-auto h-auto pr-10 py-3`}
                >
                  {property.charAt(0).toUpperCase() + property.slice(1)}:
                </label>
                <div className="flex flex-row">
                  <input
                    type="number"
                    value={inputValues[selectedKey]?.[property] || ""}
                    onChange={(e) =>
                      handlePropertyInputChange(property, e.target.value)
                    }
                    className={`w-[180px] h-auto px-2 py-3 ${mode === "Light" ? "bg-gray-200 text-gray-900" : "bg-gray-800 text-gray-100"} rounded-md mr-5`}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex items-center mx-auto h-auto my-10">
            <button
              className={`w-[150px] h-full px-2 mt-10 ${mode === "Light" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"} rounded-md`}
              onClick={updateIndicatorSignal}
            >
              Add Indicator
            </button>
          </div>
        </div>
      );
    } else {
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
                  }
              `}
                />
              </button>
            ))}
        </div>
      );
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleIndicators}
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
            onClick={handleIndicators}
          ></div>
          <div
            className={`relative w-[400px] h-[600px] ${mode === "Light" ? "bg-gray-100" : "bg-gray-900"} rounded-lg shadow-lg flex flex-col items-center justify-center mt-20 pb-10`}
          >
            {selectedKey && (
              <div
                className={`flex items-center justify-start w-full px-7 py-5 ${mode === "Light" ? "bg-gray-200" : "bg-gray-800"} rounded-lg`}
              >
                <FaArrowLeft
                  size={20}
                  fill={mode === "Light" ? "black" : "white"}
                  onClick={() => setSelectedKey(null)}
                  cursor={"pointer"}
                />
                <div
                  className={`w-full text-center text-2xl ${mode === "Light" ? "text-gray-600" : "text-gray-100"}`}
                >
                  Indicators
                </div>
              </div>
            )}
            {!selectedKey && (
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
                  onClick={handleIndicators}
                  cursor={"pointer"}
                />
              </div>
            )}

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
