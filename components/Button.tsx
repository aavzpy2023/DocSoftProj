
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
      break;
    case 'secondary':
      variantStyle = "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyle = "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500";
      break;
  }

  const disabledStyle = props.disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
