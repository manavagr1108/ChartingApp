import { effect } from "@preact/signals-react";
import React, { useState, useEffect, useRef } from "react";
import { indicatorSignal } from "../../signals/indicatorsSignal";
import { MdClose, MdSettings } from "react-icons/md";

function IndicatorsList({ mode }) {
  const [indicators, setIndicators] = useState([]);
  effect(() => {
    if (
      indicatorSignal.value &&
      indicatorSignal.value.length !== indicators.length
    ) {
      setIndicators([...indicatorSignal.peek()]);
    }
  });
  const removeIndicator = (index) => {
    indicatorSignal.value = indicatorSignal.peek().filter((val, i) => i !== index)
  };
  const updateIndicator = (index) => {
    console.log(index);
  }
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
                    mode === "Light"
                      ? "hover:bg-gray-200"
                      : "hover:bg-gray-700"
                  }`}
                onClick={() => updateIndicator(index)}
              >
                <MdSettings color={`${mode === 'Light' ? 'black' : 'white'}`} size={15} />
              </button>
              <button
                className={`p-1 cursor-pointer hidden rounded-md group-hover:block  ${
                    mode === "Light"
                      ? "hover:bg-gray-200"
                      : "hover:bg-gray-700"
                  }`}
                onClick={() => removeIndicator(index)}
              >
                <MdClose color={`${mode === 'Light' ? 'black' : 'white'}`} size={15} />
              </button>
            </div>
          );
        })}
    </div>
  );
}

export default IndicatorsList;
