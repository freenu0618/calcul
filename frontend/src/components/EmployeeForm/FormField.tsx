import React from 'react';

/**
 * 재사용 가능한 텍스트/숫자 입력 필드 컴포넌트
 */
interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'number';
  value: string | number;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  placeholder,
  min,
  max,
}) => {
  const hasError = touched && error;

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        min={min}
        max={max}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={!!hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
