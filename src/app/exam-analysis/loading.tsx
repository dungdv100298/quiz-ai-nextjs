import React from 'react';

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Phân tích bài thi</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="w-24 h-10 bg-blue-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-8 bg-gray-200 rounded-full w-56 mb-8 animate-pulse"></div>
        
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded-full w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded-full w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded-full w-40 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded-full w-28 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded-full w-48 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="space-y-8">
          {[...Array(4)].map((_, index) => (
            <div key={index}>
              <div className="h-6 bg-gray-200 rounded-full w-48 mb-4 animate-pulse"></div>
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 