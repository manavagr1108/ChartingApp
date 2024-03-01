import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Select } from "@mantine/core";
import { effect } from "@preact/signals-react";

function SearchBar({ instrumentKey, stocksList, mode }) {
  const [stocksConfig, setStockConfig] = useState({});
  effect(() => {
    if (stocksList.value !== null && stocksConfig !== stocksList.peek()) {
      setStockConfig(stocksList.peek());
    }
  });
  return (
    <Select
      placeholder="Search For Stocks"
      rightSection={<FaSearch />}
      data={Object.keys(stocksConfig).map((key) => {
        return {
          value: key,
          label: stocksConfig[key],
        };
      })}
      searchable
      value={stocksConfig[instrumentKey.peek()]}
      onChange={(key) => (instrumentKey.value = key)}
      nothingFoundMessage="Nothing found..."
      className={{
        dropdown: "w-full",
      }}
      comboboxProps={{
        transitionProps: { transition: "pop", duration: 200 },
      }}
    />
  );
}

export default SearchBar;
