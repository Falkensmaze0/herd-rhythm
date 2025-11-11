// Disable instrumentation during build time
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only import tracing if running in nodejs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../lib/tracing');
  }
}