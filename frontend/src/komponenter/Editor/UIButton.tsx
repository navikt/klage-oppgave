import React from "react";

interface UiButtonProps {
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: string;
  disabled?: boolean;
}

export const UiButton = ({ className, onClick, children, disabled }: UiButtonProps) => (
  <button
    className={className}
    onMouseDown={(event) => {
      event.preventDefault();
      if (!disabled) {
        onClick(event);
      }
    }}
    disabled={disabled}
  >
    {children}
  </button>
);
