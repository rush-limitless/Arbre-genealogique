import React from 'react';
// @ts-nocheck

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
  showPercentage?: boolean;
}

const colors = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600'
};

export function ProgressBar({ value, max, label, color = 'blue', showPercentage = true }: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium dark:text-gray-400">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
