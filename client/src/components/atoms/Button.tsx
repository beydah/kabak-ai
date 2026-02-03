import React from 'react';

// Example of an ATOM: A basic building block.
// No business logic, purely presentational.

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
