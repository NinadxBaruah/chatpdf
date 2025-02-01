import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex space-x-2 items-center">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
           style={{ animationDelay: '0ms' }} 
      />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
           style={{ animationDelay: '150ms' }} 
      />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
           style={{ animationDelay: '300ms' }} 
      />
    </div>
  );
};

export default TypingIndicator;