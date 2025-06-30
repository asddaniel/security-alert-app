import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="mt-1">
          <input
            id={name}
            name={name}
            ref={ref}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 px-2"
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
