import React from 'react';

const Button = ({ children, onClick, disabled = false, size = "md", className = "", color = "#41D185", variant = "primary", icon = null }) => {
  const baseClasses = "font-bold rounded-xl transition-all transform active:scale-95 shadow-md flex items-center justify-center";
  
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };
  
  const variantClasses = {
    primary: `hover:bg-opacity-90 text-white border-b-4 active:border-b-0 active:mt-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-gray-100 text-gray-700 hover:bg-gray-200 border-b-4 border-gray-300 active:border-b-0 active:mt-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  };

  const style = variant === 'primary' 
    ? { backgroundColor: color, borderBottomColor: color } 
    : {};
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;