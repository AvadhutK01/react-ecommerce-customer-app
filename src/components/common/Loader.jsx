import React from 'react';

const Loader = ({ size = 'md', fullPage = false, className = '' }) => {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-14 w-14 border-4',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-gray-200 border-t-primary-600 ${sizeMap[size]} ${className}`}
    />
  );

  if (fullPage) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        {spinner}
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Please wait...</p>
      </div>
    );
  }

  return spinner;
};

export default Loader;
