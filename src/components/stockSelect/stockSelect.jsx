import React from "react";

function StockSelect({ mode }) {
  return (
    <div
      className={`flex justify-center items-center border-b-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800  bg-gray-900"
      }`}
    ></div>
  );
}

export default StockSelect;
