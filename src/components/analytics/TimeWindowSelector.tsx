import React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TimeWindowOption {
  value: string;
  label: string;
  description?: string;
}

interface TimeWindowSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeWindowOption[];
  label?: string;
  description?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  hideLabel?: boolean;
}

const TimeWindowSelector: React.FC<TimeWindowSelectorProps> = ({
  value,
  onChange,
  options,
  label = 'Time Window',
  description,
  className,
  triggerClassName,
  disabled = false,
  icon,
  hideLabel = false,
}) => {
  const showLabel = !hideLabel && label;

  return (
    <div className={cn('flex flex-col space-y-1.5', className)}>
      {showLabel ? (
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div className="flex items-center space-x-2">
        <div className="relative inline-flex items-center">
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger
              className={cn(
                'w-48 justify-start rounded-md border bg-white text-left text-sm font-medium shadow-sm data-[placeholder]:text-muted-foreground',
                triggerClassName,
              )}
            >
              <div className="flex items-center space-x-2">
                {icon ?? <Clock className="h-4 w-4 text-muted-foreground" />}
                <SelectValue placeholder="Select window" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="w-56">
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex cursor-pointer flex-col space-y-0.5 py-2"
                  >
                    <span className="text-sm font-medium leading-none">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default TimeWindowSelector;