// EXAMPLE - safe to delete.
import { forwardRef, type InputHTMLAttributes } from 'react';

export type UrlInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(function UrlInput(
  { hasError, className = '', type = 'url', ...rest },
  ref,
) {
  const classes = [
    'w-full rounded-md border bg-transparent px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40',
    hasError ? 'border-primary' : 'border-border',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <input ref={ref} type={type} className={classes} {...rest} />;
});
