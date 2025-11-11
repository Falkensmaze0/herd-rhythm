import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Button } from './button';

interface NeonPromptInputProps {
  userRole: string;
  tabId: string;
  onSubmit?: (payload: { prompt: string; userRole: string; tabId: string }) => void;
}

export const NeonPromptInput: React.FC<NeonPromptInputProps> = ({
  userRole,
  tabId,
  onSubmit
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    // Fire API request; allow external onSubmit handler for mocks/tests
    try {
      if (onSubmit) {
        onSubmit({ prompt, userRole, tabId });
      } else {
        await fetch('/api/ai-agent-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, userRole, tabId })
        });
      }
      setPrompt('');
    } catch (err) {
      // Handle error as needed (toast/snackbar, etc)
    }
    setLoading(false);
  };

  return (
    <form
      className={cn(
        'fixed',
        'bottom-4 z-40',
        // center horizontally and keep responsive margins
        'left-1/2 -translate-x-1/2',
        'bg-background bg-opacity-90',
        'p-2 flex gap-2 items-center',
        'backdrop-blur-xl',
        'border-2',
        // gentle cyan/teal neon glow (no yellow)
        'shadow-[0_0_16px_2px_rgba(16,185,129,0.6),0_0_6px_3px_rgba(56,189,248,0.18)]',
      )}
      style={{
        borderRadius: '50px', // Full curve, pill looking
        width: 'min(450px, calc(100% - 48px))',
        maxWidth: '450px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your prompt..."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'flex-1',
          'rounded-full',
          'border-none',
          // subtle neon glow on focus
          'shadow-[0_0_10px_0px_rgba(56,189,248,0.06)]',
          'bg-background',
          'text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        disabled={loading}
        style={{
          height: '44px', // Ensures pill-shaped with borderRadius 50px
        }}
      />
      {isFocused && (
        <Button
        type="submit"
        size="sm"
        disabled={loading || !prompt.trim()}
          aria-label="Send"
        className={cn(
            'rounded-full',
            'p-2',
          'bg-primary text-primary-foreground',
            'shadow-[0_0_10px_2px_rgba(16,185,129,0.6)]',
            'hover:bg-primary/80 transition',
            'flex items-center justify-center'
        )}
          style={{ minWidth: '44px', minHeight: '44px', width: '44px', height: '44px' }}
      >
          {/* SVG: Paper plane, teal or cyan, No yellow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="text-cyan-400"
          >
            <path d="M3 21l18-9-18-9v7l13 2-13 2v7z" />
          </svg>
      </Button>
      )}
    </form>
  );
};

export default NeonPromptInput;