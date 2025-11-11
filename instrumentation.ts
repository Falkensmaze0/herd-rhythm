// Disable instrumentation during build time
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import tracing so it only runs in the Node.js runtime
    void import('@/lib/tracing').catch((error) => {
      console.error('Failed to register tracing instrumentation:', error);
    });
  }
}
