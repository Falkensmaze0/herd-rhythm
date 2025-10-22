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
        'bottom-3 left-2 right-2', // Tighter margins
        'z-40',
        'bg-background bg-opacity-90',
        'p-2 flex gap-2 items-center',
        'backdrop-blur-xl',
        // Removed 'border-primary' and explicit yellow-like shadows!
        'border-2',
        'shadow-[0_0_16px_2px_rgba(16,185,129,0.7),0_0_3px_2px_rgba(56,189,248,0.4)]',
      )}
      style={{
        borderRadius: '50px', // Full curve, pill looking
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
          // Remove any hint of yellow from shadows.
          'shadow-[0_0_12px_0px_rgba(16,185,129,0.8)]',
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
            'shadow-[0_0_10px_2px_rgba(16,185,129,0.7)]',
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