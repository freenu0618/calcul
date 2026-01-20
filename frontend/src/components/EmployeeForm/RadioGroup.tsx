import React from 'react';

/**
 * 재사용 가능한 라디오 버튼 그룹 컴포넌트
 */
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  legend: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ name, legend, options, value, onChange }) => {
  return (
    <div className="mb-6">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">{legend}</legend>
        <div className="flex gap-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                aria-label={option.label}
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default RadioGroup;
