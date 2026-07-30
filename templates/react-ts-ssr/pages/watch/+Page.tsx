// EXAMPLE - safe to delete alongside `src/pages/example/Watch`.
import { usePageContext } from 'vike-react/usePageContext';
import { Watch } from '@/pages/example/Watch';

export default function Page() {
  const pageContext = usePageContext();
  const v = (pageContext.urlParsed.search as { v?: string }).v ?? null;
  return <Watch videoId={v} />;
}
