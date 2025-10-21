# Project Overview

This project uses TypeScript and exports types in a way that ensures full compatibility with strict module settings (e.g., `isolatedModules`).

## Using Project Types

Common types (such as `ManagerAnalytics`) are re-exported from `src/types/index.ts` using a type-only export pattern:

```ts
export type { ManagerAnalytics } from './manager';
```

To use the `ManagerAnalytics` type throughout your codebase, import it as follows:

```ts
import type { ManagerAnalytics } from '@/types';
```

This pattern avoids issues with "isolatedModules" and supports safe type imports across all modules.



