import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSkeletonProps {
  title?: string;
  description?: string;
  cardCount?: number;
  gridClassName?: string;
  cardClassName?: string;
  className?: string;
  headerRight?: React.ReactNode;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  title = 'Dashboard',
  description = 'Loading the latest data…',
  cardCount = 6,
  gridClassName = 'grid-cols-1 lg:grid-cols-3',
  cardClassName,
  className,
  headerRight,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        {headerRight ?? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            Syncing data…
          </div>
        )}
      </div>
      <div className={cn('grid gap-6', gridClassName)}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <div
            key={`dashboard-skeleton-${index}`}
            className={cn(
              'h-64 rounded-2xl border border-border/60 bg-muted/40 animate-pulse',
              cardClassName
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
