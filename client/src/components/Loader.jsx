import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-blue-500 animate-spin`} />
        <div className="absolute inset-0 rounded-full blur-md bg-blue-500/20 animate-pulse" />
      </div>
      {message && <p className="text-sm font-medium text-slate-300">{message}</p>}
    </div>
  );
};

export default Loader;
