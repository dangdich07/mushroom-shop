import type { ButtonHTMLAttributes } from 'react';

export default function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                  bg-black text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed
                  transition ${className}`}
    />
  );
}
