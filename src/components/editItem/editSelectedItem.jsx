import { effect } from "@preact/signals-react";
import React, { useState } from "react";
import { MdDelete, MdMoreHoriz } from "react-icons/md";
import { GoGrabber } from "react-icons/go";

function EditSelectedItem({ ChartWindow, mode }) {
  const { selectedItem, drawChartObjects } = ChartWindow;
  const [selectedItemState, setSelectedItemState] = useState({});
  effect(() => {
    if (
      selectedItem.value !== null &&
      selectedItem.value.startPoint !== selectedItemState.startPoint
    ) {
      setSelectedItemState({ ...selectedItem.peek() });
    }
  });
  const handleDelete = () => {
    drawChartObjects.peek().forEach((obj) => {
      const { trendLinesData } = obj;
      trendLinesData.peek().forEach((trendLine, i) => {
        if (trendLine === selectedItem.peek()) {
          selectedItem.value = null;
          trendLinesData.value = trendLinesData
            .peek()
            .filter((_, j) => i !== j);
          setSelectedItemState({});
          return;
        }
      });
    });
  };
  return (
    <div>
      {selectedItemState?.startPoint?.xLabel !== undefined ? (
        <div className={`absolute flex justify-around top-[5%] left-[50%] p-1 ${mode === "Light" ? "bg-white" : "bg-gray-700"} rounded-md shadow-md`}>
          <button
            className={`p-1 cursor-grab rounded-md`}
          >
            <GoGrabber
              color={`${mode === "Light" ? "black" : "white"}`}
              size={20}
            />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 ${mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-500"} rounded-md`}
          >
            <MdDelete
              color={`${mode === "Light" ? "black" : "white"}`}
              size={20}
            />
          </button>
          <button
            className={`p-1 ${mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-500"} rounded-md`}
          >
            <MdMoreHoriz
              color={`${mode === "Light" ? "black" : "white"}`}
              size={20}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default EditSelectedItem;
