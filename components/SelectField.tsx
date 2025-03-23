import React from "react";
import Select from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  options: Option[];
  value: Option;
  onChange: (option: Option) => void;
  label: string;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  onChange,
  label,
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
      <Select
        options={options}
        value={value}
        onChange={(option) => onChange(option as Option)}
        className="basic-single"
        classNamePrefix="select"
      />
    </div>
  );
};

export default SelectField;
