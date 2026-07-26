# Adding state management

React Query already handles all **server** state. If you also need **client** state that outlives a single component (theme is the only such example in the template today), pick one of these:

- **Zustand**. 1 file per store, no boilerplate, tiny. Recommended default.
- **Jotai**. atom-based, good for derived/computed state.
- **Redux Toolkit**. only if you're onboarding people who already know Redux, or need Redux DevTools' time travel.

## Zustand example

```bash
pnpm add zustand
```

Create a store:

```ts
// src/stores/useCart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = { id: string; qty: number };

type CartState = {
  items: CartItem[];
  add: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (id) =>
        set((s) => ({
          items: [...s.items, { id, qty: 1 }],
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' },
  ),
);
```

Use it anywhere:

```tsx
const items = useCart((s) => s.items);
const add = useCart((s) => s.add);
```

## What NOT to do

- Don't put server response data in Zustand. that's React Query's job (staleness, refetch, cache).
- Don't add both Zustand and Redux. Pick one.
- Don't reach for context + reducer as your own "state manager". Zustand is smaller than the wiring you'd write.
