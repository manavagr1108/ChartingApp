import React from "react";
import { BiCross } from "react-icons/bi";
import { MdOutlineHorizontalSplit } from "react-icons/md";
import { FaArrowPointer } from "react-icons/fa6";
import { cursorConfig } from "../../signals/toolbarSignals";
import { PiLineSegmentFill } from "react-icons/pi";
import { Menu, Button } from "@mantine/core";

function ToolbarItems({ mode, ChartWindow }) {
  const { drawChartObjects, selectedTool, selectedToolItem, selectedCursor } =
    ChartWindow;
  function cursorOnClickHandler(index) {
    drawChartObjects.peek().forEach((drawChartObject) => {
      const canvas = drawChartObject.ChartRef.current[1];
      canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
      canvas.classList.add(`cursor-${cursorConfig[index]}`);
    });
    selectedTool.value = items[0].toolName;
    selectedToolItem.value = index;
    selectedCursor.value = index;
  }
  function linesOnClickHandler(index) {
    selectedTool.value = items[1].toolName;
    selectedToolItem.value = index;
  }
  function fibOnClickHandler(index) {
    selectedTool.value = items[2].toolName;
    selectedToolItem.value = index;
  }
  const items = [
    {
      toolName: "Cursor",
      toolItemsEle: [
        <BiCross color={`${mode === "Light" ? "black" : "white"}`} size={20} />,
        <FaArrowPointer
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: ["Cross", "Arrow"],
      onClickFunction: cursorOnClickHandler,
    },
    {
      toolName: "Line",
      toolItemsEle: [
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: [
        "Trend Line",
        "Ray",
        "Info Line",
        "Extended Line",
        "Trend Angle",
        "Horizontal Line",
        "Horizontal Ray",
        "Vertical Line",
        "Cross Line",
        "Parallel Channel",
        "Flat Top/Bottom",
        "Disjoint Channel",
      ],
      onClickFunction: linesOnClickHandler,
    },
    {
      toolName: "Fib",
      toolItemsEle: [
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: [
        "Fibonacci Retracement",
        "Trend Based Fibonacci Retracement",
        "Fib Channel",
        "Fib Time Zone",
        "Trend-Based Fib Time",
      ],
      onClickFunction: fibOnClickHandler,
    },
  ];
  return (
    <div>
      {items.map((item, index) => {
        return (
          <Menu
            trigger="click-hover"
            key={index}
            width={200}
            shadow="md"
            offset={0}
            position="right-start"
          >
            <Menu.Target>
              <Button variant="subtle" color="gray" className="text-slate-600">
                {selectedTool.peek() === item.toolName
                  ? items[index].toolItemsEle[selectedToolItem.peek()]
                  : items[index].toolItemsEle[0]}
              </Button>
            </Menu.Target>

            <Menu.Dropdown color="gray" className="!w-fit">
              {item.toolItemsEle.map((ele, i) => {
                return (
                  <Button
                    onClick={() => item.onClickFunction(i)}
                    variant="subtle"
                    color="gray"
                    className="bg-white text-black hover:text-black px-0 w-full text-left flex justify-start"
                  >
                    <Menu.Item
                      leftSection={ele}
                      key={i}
                      color="black"
                      pl={1}
                      py={0}
                    >
                      {item.toolLabels[i]}
                    </Menu.Item>
                  </Button>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        );
      })}
    </div>
  );
}

export default ToolbarItems;
