import React, { useState } from "react";
import IkonSok from "./icons/IkonSok";
import "./Sok.less";

export interface SokProps {
  onSok: (value: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const Sok = ({ onSok }: SokProps) => {
  const [value, setValue] = useState("");

  const sok = () => {
    if (value.length > 0) {
      onSok(value).then(() => setValue(""));
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && value.length > 0) {
      sok();
    }
  };

  const onChange = (event: React.ChangeEvent) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <div className={"sok__container"}>
      <input
        className={"sok__sokefelt"}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
      />
      <button className={"sok__sokeknapp"} onClick={sok}>
        <IkonSok />
      </button>
    </div>
  );
};
