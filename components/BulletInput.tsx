import React, { useState, useEffect, useRef } from 'react';

interface BulletInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string; // For Tailwind styles
  autoFocus?: boolean;
}

export const BulletInput: React.FC<BulletInputProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  className = '',
  autoFocus = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Initialize internalValue directly from prop. If prop is empty, start with a bullet.
  const [internalValue, setInternalValue] = useState(value || '• ');

  // Sync internal state with prop value *only* if the prop value changes externally
  // and is genuinely different from the current internal state, to avoid overwriting user input.
  useEffect(() => {
    // Only update if the external `value` prop is significantly different from the internal `internalValue`.
    // This heuristic tries to prevent overwriting user's in-progress typing while still reflecting external changes.
    // If the internal value is empty and an external value is provided, it should update.
    if (value !== internalValue && (value.trim() !== internalValue.trim() || value.length === 0)) {
      setInternalValue(value || '• '); // If value is empty, re-initialize with a bullet
    }
  }, [value, internalValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default newline behavior

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;

      const insertText = '\n• '; // Always insert this on Enter

      const newValue = currentText.substring(0, start) + insertText + currentText.substring(end);
      
      setInternalValue(newValue);
      onChange(newValue); // Notify parent immediately

      // Set caret position to after the new bullet
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + insertText.length;
          textareaRef.current.selectionEnd = start + insertText.length;
        }
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue); // Pass raw value to parent
  };

  return (
    <textarea
      ref={textareaRef}
      className={`form-input w-full rounded-lg text-sm p-4 resize-none leading-relaxed focus:outline-none ${className}`}
      placeholder={placeholder}
      rows={rows}
      value={internalValue}
      onChange={handleTextareaChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={placeholder}
    ></textarea>
  );
};