import React, { useState } from "react";
import { MdClose, MdSettings } from "react-icons/md";
import { useOutsideClick } from "../navbar/navbar";
import { ColorInput, Input, NumberInput, Button, Modal } from "@mantine/core";
import { colorSwatches } from "../../signals/toolbarSignals";
import { useDisclosure } from "@mantine/hooks";

function IndicatorsList({ mode, indicators, ChartWindow }) {
  const {
    onChartIndicatorSignal,
    offChartIndicatorSignal,
    onChartIndicatorData,
  } = ChartWindow;
  const [selectedKey, setSelectedKey] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [opened, { open, close }] = useDisclosure(false);

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
    console.log(property, value);
    setInputValues((prev) => {
      return {
        ...prev,
        [property]: value,
      };
    });
  };
  const updateIndicator = (index) => {
    setSelectedKey(index);
    open();
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
      console.log(indicators[selectedKey]);
      return (
        <Modal.Root centered size="md" opened={opened} onClose={close}>
          <Modal.Overlay />
          <Modal.Content className="">
            <Modal.Header>
              <Modal.Title className="mr-6">
                Set the values for your indicator:
              </Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body className="flex space-y-3 flex-col justify-around">
              {Object.keys(indicators[selectedKey]).map((property) => {
                if (
                  property === "label" ||
                  property === "chartRequired" ||
                  property === "drawChartFunction" ||
                  property === "getChartData" ||
                  property === "name"
                )
                  return null;

                return (
                  <div
                    key={property}
                    className="flex flex-row justify-center items-start w-full h-auto py-1"
                  >
                    <div className="flex flex-row">
                      {property === "color" ? (
                        <Input.Wrapper
                          label={
                            property.charAt(0).toUpperCase() +
                            property.slice(1) +
                            ":"
                          }
                        >
                          <ColorInput
                            withPicker={false}
                            size="xs"
                            value={
                              inputValues?.[property] ||
                              indicators[selectedKey]?.[property]
                            }
                            onChange={(e) =>
                              handlePropertyInputChange(property, e)
                            }
                            format="hex"
                            closeOnColorSwatchClick
                            swatches={colorSwatches}
                          />
                        </Input.Wrapper>
                      ) : (
                        <NumberInput
                          label={
                            property.charAt(0).toUpperCase() +
                            property.slice(1) +
                            ":"
                          }
                          placeholder="Input value"
                          value={
                            inputValues?.[property]
                              ? inputValues?.[property]
                              : null
                          }
                          defaultValue={indicators[selectedKey]?.[property]}
                          onChange={(e) =>
                            handlePropertyInputChange(
                              property,
                              isNaN(parseFloat(e)) || parseFloat(e) === 0.0
                                ? indicators[selectedKey]?.[property]
                                : parseFloat(e)
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center mx-auto h-auto py-6">
                <Button
                  variant="subtle"
                  color="white"
                  className="bg-black px-2 hover:text-black"
                  onClick={updateIndicatorSignal}
                >
                  Update Indicator
                </Button>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      );
    } else {
      return null;
    }
  };
  return (
    <div className="absolute flex flex-col z-6 select-none top-6 left-2 w-250">
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
