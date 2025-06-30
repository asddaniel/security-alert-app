
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export const Button = ({ children, className, isLoading, ...props }: ButtonProps) => {
  return (
    <button
      className={`flex w-full justify-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Chargement...' : children}
    </button>
  );
};
