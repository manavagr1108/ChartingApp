import React, { useState } from "react";
import { MdClose, MdSettings } from "react-icons/md";

function IndicatorsList({ mode, indicators, ChartWindow }) {
  const {
    onChartIndicatorSignal,
    offChartIndicatorSignal,
    onChartIndicatorData,
  } = ChartWindow;
  const [selectedKey, setSelectedKey] = useState(null);
  const [inputValues, setInputValues] = useState({});

  const removeIndicator = (index) => {
    if (onChartIndicatorSignal.peek().includes(indicators[index])) {
      onChartIndicatorSignal.value = onChartIndicatorSignal
        .peek()
        .filter((val, i) => i !== index);
      onChartIndicatorData.value = onChartIndicatorData
        .peek()
        .filter((val, i) => i !== index);
    } else {
      ChartWindow.drawChartObjects.value = ChartWindow.drawChartObjects
        .peek()
        .filter((val, i) => i + 1 !== index);
      offChartIndicatorSignal.value = offChartIndicatorSignal
        .peek()
        .filter((val, i) => i !== index);
    }
  };

  const handlePropertyInputChange = (property, value) => {
    setInputValues((prev) => {
      return {
        ...prev,
        [property]: value,
      };
    });
  };
  const updateIndicator = (index) => {
    setSelectedKey(index);
    setInputValues(indicators[index]);
  };
  const updateIndicatorSignal = () => {
    removeIndicator(selectedKey);
    if (inputValues.chartRequired) {
      offChartIndicatorSignal.value.push(inputValues);
    } else {
      onChartIndicatorSignal.value.push(inputValues);
    }
    setSelectedKey(null);
  };

  const indicatorModal = () => {
    if (selectedKey !== null) {
      return (
        <div className="fixed top-0 left-0 w-full h-full flex items-start justify-center z-10">
          <div
            className={`relative w-[400px] h-[600px] ${mode === "Light" ? "bg-gray-100" : "bg-gray-900"} rounded-lg shadow-lg flex flex-col items-center justify-center mt-20 pb-10`}
          >
            <div className="flex flex-row items-start w-full h-full overflow-y-auto overflow-x-hidden">
              <div
                className={`flex flex-col justify-start items-start w-full h-full py-3 transition-transform ease-in-out duration-700 transform translate-x-0`}
              >
                <p
                  className={`w-full text-center h-auto py-3 mb-5 ${mode === "Light" ? "text-gray-500" : "text-gray-200"}`}
                >
                  Set the values for your indicator:
                </p>
                {Object.keys(indicators[selectedKey]).map((property) => {
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
                          {property.charAt(0).toUpperCase() + property.slice(1)}
                          :
                        </label>
                        <div className="flex flex-row">
                          <input
                            type="color"
                            value={
                              inputValues?.[property] ||
                              indicators[selectedKey]?.[property]
                            }
                            onChange={(e) =>
                              handlePropertyInputChange(
                                property,
                                e.target.value
                              )
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
                          value={
                            inputValues?.[property] ||
                            indicators[selectedKey]?.[property]
                          }
                          onChange={(e) =>
                            handlePropertyInputChange(property, parseInt(e.target.value))
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
                    Update Indicator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  return (
    <div className="absolute flex flex-col z-6 select-none top-7 left-2 w-250">
      {indicators.length !== 0 &&
        indicators.map((indicator, index) => {
          return (
            <div
              key={index}
              className={`flex group text-xs w-full bg-transparent border rounded-md ${
                mode === "Light"
                  ? "border-blue-500 bg-gray-100"
                  : "border-blue-800 text-white  bg-gray-900"
              }`}
            >
              <div className="p-1">
                {indicator.label} {indicator.period}
              </div>{" "}
              <button
                className={`p-1 cursor-pointer rounded-md hidden group-hover:block  ${
                  mode === "Light" ? "hover:bg-gray-200" : "hover:bg-gray-700"
                }`}
                onClick={() => updateIndicator(index)}
              >
                <MdSettings
                  color={`${mode === "Light" ? "black" : "white"}`}
                  size={15}
                />
              </button>
              <button
                className={`p-1 cursor-pointer hidden rounded-md group-hover:block  ${
                  mode === "Light" ? "hover:bg-gray-200" : "hover:bg-gray-700"
                }`}
                onClick={() => removeIndicator(index)}
              >
                <MdClose
                  color={`${mode === "Light" ? "black" : "white"}`}
                  size={15}
                />
              </button>
            </div>
          );
        })}
      {indicatorModal()}
    </div>
  );
}

export default IndicatorsList;
