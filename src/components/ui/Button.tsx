import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variants = {
    primary: 'bg-nvm-green-primary text-white hover:bg-nvm-green-dark focus:ring-nvm-green-primary shadow-lg hover:shadow-xl',
    secondary: 'bg-nvm-gold-primary text-white hover:bg-nvm-gold-dark focus:ring-nvm-gold-primary shadow-md',
    outline: 'border-2 border-nvm-green-primary text-nvm-green-primary hover:bg-nvm-green-primary hover:text-white focus:ring-nvm-green-primary',
    ghost: 'text-nvm-green-primary hover:bg-nvm-green-bg/50 hover:text-nvm-green-dark'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}