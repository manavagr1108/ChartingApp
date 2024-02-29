import React, { useState } from "react";
import { FcComboChart } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import { indicatorConfig } from "../../config/indicatorsConfig";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Select, Popover, Button } from "@mantine/core";

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
  return (
    <div className="relative inline-block">
      <Popover width={300} position="bottom" withArrow shadow="md">
        <Popover.Target>
          <Button variant="subtle" color="gray" className="text-slate-600 px-2">
            Indicators
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Select
            label="Please select your indicator"
            placeholder="Pick value"
            data={Object.keys(indicatorConfig).sort()}
            searchable
            onChange={(val) => handleKeyClick(val)}
            nothingFoundMessage="Nothing found..."
            className={{
              dropdown: "w-full",
            }}
            comboboxProps={{
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}

export default Indicators;
