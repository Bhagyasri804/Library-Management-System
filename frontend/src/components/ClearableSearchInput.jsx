import React from 'react';
import { Search, X } from 'lucide-react';

export default function ClearableSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  inputClassName = 'search-input',
  inputStyle,
  wrapperStyle,
}) {
  return (
    <div className="search-input-wrapper" style={wrapperStyle}>
      <Search size={18} aria-hidden="true" />
      <input
        type="text"
        className={inputClassName}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ paddingRight: '40px', ...inputStyle }}
      />
      {value && (
        <button
          type="button"
          className="search-clear-button"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
