import { effect } from "@preact/signals-react";
import React, { useState } from "react";
import { MdDelete, MdMoreHoriz } from "react-icons/md";
import { GoGrabber } from "react-icons/go";
import { getCoordsArray } from "../../utility/toolsUtils";
import { isEqual } from "lodash";

function EditSelectedItem({ ChartWindow, mode }) {
  const { selectedItem, drawChartObjects } = ChartWindow;
  const [selectedItemState, setSelectedItemState] = useState({});
  effect(() => {
    if (selectedItem.value !== null && selectedItemState.points === undefined) {
      setSelectedItemState({ ...selectedItem.peek() });
    } else if (
      selectedItem.value !== null &&
      selectedItemState.points !== undefined &&
      selectedItemState.points.length !== selectedItem.peek().points.length
    ) {
      setSelectedItemState({ ...selectedItem.peek() });
    }
  });
  const handleDelete = () => {
    drawChartObjects.peek().forEach((obj) => {
      const { trendLinesData, fibData } = obj;
      trendLinesData.peek().forEach((trendLine, i) => {
        if (isEqual(trendLine, selectedItem.peek())) {
          selectedItem.value = null;
          trendLinesData.value = trendLinesData
            .peek()
            .filter((_, j) => i !== j);
          setSelectedItemState({});
          return;
        }
      });
      fibData.peek().forEach((fib, i) => {
        if (isEqual(fib, selectedItem.peek())) {
          selectedItem.value = null;
          fibData.value = fibData.peek().filter((_, j) => i !== j);
          setSelectedItemState({});
          return;
        }
      });
    });
  };
  return (
    <div>
      {selectedItemState.points !== undefined &&
      selectedItemState.points.length ? (
        <div
          className={`absolute flex justify-around top-[5%] left-[50%] p-1 ${mode === "Light" ? "bg-white" : "bg-gray-700"} rounded-md shadow-md`}
        >
          <button className={`p-1 cursor-grab rounded-md`}>
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
