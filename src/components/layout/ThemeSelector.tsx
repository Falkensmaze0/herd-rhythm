'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useThemeContext } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'h-5 w-5',
};

const LightIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.42 1.42" />
    <path d="m17.65 17.65 1.42 1.42" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.35 17.65-1.42 1.42" />
    <path d="m19.07 4.93-1.42 1.42" />
  </svg>
);

const DarkIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
  </svg>
);

const ContrastIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3a9 9 0 0 1 0 18" />
    <path d="M12 21a9 9 0 0 1 0-18Z" fill="currentColor" opacity="0.3" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright workspace with subtle shadows',
    Icon: LightIcon,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-light mode with rich contrast',
    Icon: DarkIcon,
  },
  {
    value: 'contrast',
    label: 'High contrast',
    description: 'Accessibility tuned palette',
    Icon: ContrastIcon,
  },
] as const;

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector = ({ className }: ThemeSelectorProps) => {
  const { theme, setTheme } = useThemeContext();
  const activeOption = themeOptions.find((option) => option.value === theme) ?? themeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Select theme"
          className={cn(
            'relative flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card text-card-foreground shadow-md transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'role-hero__control',
            className
          )}
        >
          <span
            key={activeOption.value}
            className="text-primary transition-all duration-200"
          >
            <activeOption.Icon />
          </span>
          <span className="sr-only">Current theme: {activeOption.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          'w-64 rounded-2xl border border-border/60 bg-card/95 p-2 text-sm shadow-xl backdrop-blur',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
        )}
      >
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl p-3 text-left text-sm transition',
              option.value === theme
                ? 'bg-primary/5 text-primary shadow-inner'
                : 'hover:bg-muted/40'
            )}
          >
            <span className="mt-0.5 text-primary">
              <option.Icon />
            </span>
            <span>
              <span className="font-medium">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
