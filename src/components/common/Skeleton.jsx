// src/components/common/Skeleton.jsx
// Reusable skeleton loading components

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
    <div className="animate-pulse space-y-4">
      <SkeletonBox className="h-6 w-1/3" />
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonBox key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonHiveCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-6 w-1/2" />
          <SkeletonBox className="h-4 w-1/3" />
        </div>
        <SkeletonBox className="h-10 w-10 rounded-full" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-6 w-2/3" />
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2 pt-4">
        <SkeletonBox className="h-10 flex-1" />
        <SkeletonBox className="h-10 flex-1" />
      </div>
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <SkeletonBox className="h-8 w-48" />
      <SkeletonBox className="h-10 w-32" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonList items={4} />
      <SkeletonCard className="h-96" />
    </div>
  </div>
);

export default {
  Box: SkeletonBox,
  Text: SkeletonText,
  Card: SkeletonCard,
  List: SkeletonList,
  Table: SkeletonTable,
  HiveCard: SkeletonHiveCard,
  Dashboard: SkeletonDashboard,
};