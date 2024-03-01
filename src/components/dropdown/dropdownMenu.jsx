import React from "react";
import { useCombobox, Input, Combobox, Button } from "@mantine/core";

function DropdownMenu({ menuList, stateToBeUpdated, mode }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const options = Object.keys(menuList).map((item) => (
    <Combobox.Option value={item} key={item}>
      {menuList[item]}
    </Combobox.Option>
  ));
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        stateToBeUpdated.value = val;
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Button
          variant="subtle"
          color="gray"
          className="text-slate-600 px-2"
          onClick={() => combobox.toggleDropdown()}
        >
          {menuList[stateToBeUpdated.peek()] || (
            <Input.Placeholder>Pick value</Input.Placeholder>
          )}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown className="!w-fit text-center w-max-[6rem]">
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default DropdownMenu;
