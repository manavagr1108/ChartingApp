import React, { useState } from "react";
import { FcComboChart } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import {
  indicatorConfig,
  indicatorSignal,
} from "../../signals/indicatorsSignal";

function Indicators({ mode }) {
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
    setInputValues((prevValues) => ({
      ...prevValues,
      [selectedKey]: {
        ...prevValues[selectedKey],
        [property]: value,
        'label': indicatorConfig[selectedKey].label,
      },
    }));
  };

  const updateIndicatorSignal = () => {
    const selectedIndicatorConfig = indicatorConfig[selectedKey];
    Object.keys(selectedIndicatorConfig).forEach((key) => {
      if(inputValues[key] === undefined)return;
    })
    indicatorSignal.value = [
      ...indicatorSignal.peek(),
      inputValues[selectedKey],
    ]
    setIsModalOpen(false);
  }

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
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10">
          <div
            className={`absolute w-full h-full bg-gray-900 opacity-50`}
            onClick={handleIndicators}
          ></div>
          <div
            className={`relative w-[900px] h-[700px] bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center`}
          >
            <div className="flex items-center justify-between w-full h-10 bg-gray-200 rounded-t-lg">
              <div className="ml-2 text-base text-gray-600">Indicators</div>
              <RxCross1
                size={20}
                className="mr-2 cursor-pointer"
                onClick={handleIndicators}
              />
            </div>
            <div className="flex flex-row items-center w-full h-full overflow-y-auto">
              <div className="flex justify-start flex-col w-[300px] h-full px-2 py-3 border-r-2">
                <p className="w-auto text-center h-auto px-2 py-3">
                  Script Name
                </p>
                {Object.keys(indicatorConfig).map((key) => (
                  <button
                    key={key}
                    className={`p-2 ${
                      mode === "Light"
                        ? "hover:bg-gray-300"
                        : "hover:bg-gray-800"
                    } rounded-sm`}
                    onClick={() => handleKeyClick(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              {selectedKey && (
                <div className="flex flex-col justify-start items-start w-[600px] h-full px-2 py-3">
                  {Object.keys(indicatorConfig[selectedKey]).map((property) => {
                    if (property === "label") return null;
                    return (
                      <div
                        key={property}
                        className="flex flex-row justify-center items-start w-full h-auto px-2 py-3"
                      >
                        <label className="flex justify-center items-center w-[150px] h-auto px-2 py-3">
                          {property.charAt(0).toUpperCase() + property.slice(1)}
                        </label>
                        <div className="flex flex-row">
                          <input
                            type="text"
                            value={inputValues[selectedKey]?.[property] || ""}
                            onChange={(e) =>
                              handlePropertyInputChange(
                                property,
                                e.target.value
                              )
                            }
                            className="p-2 rounded-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center mx-auto h-auto my-10">
                    <button
                      className="w-[150px] h-auto px-2 py-3 bg-blue-400 rounded-md text-white"
                      onClick={updateIndicatorSignal}
                    >
                      Add Indicator
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Indicators;
