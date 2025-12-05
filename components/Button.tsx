import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-all transform active:scale-95 focus:outline-none flex items-center justify-center gap-2 shadow-md";
  
  const variants = {
    primary: "bg-brandBlue text-white hover:bg-teal-400 border-b-4 border-teal-600",
    secondary: "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50",
    danger: "bg-brandRed text-white hover:bg-rose-500 border-b-4 border-rose-700",
    success: "bg-green-500 text-white hover:bg-green-400 border-b-4 border-green-700",
    outline: "bg-transparent border-2 border-slate-300 text-slate-500 hover:bg-slate-100"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl",
    xl: "px-10 py-6 text-2xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;