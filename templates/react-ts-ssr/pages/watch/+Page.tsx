// EXAMPLE - safe to delete alongside `src/pages/example/Watch`.
import { useEffect, useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { Watch } from '@/pages/example/Watch';

export default function Page() {
  const { urlParsed } = usePageContext();
  const v = (urlParsed.search as { v?: string }).v ?? null;

  // The page is prerendered once with no query string. Reading ?v= during
  // render would make the first client render differ from that HTML (a
  // hydration mismatch), so it's applied after mount instead.
  const [videoId, setVideoId] = useState<string | null>(null);
  useEffect(() => setVideoId(v), [v]);

  return <Watch videoId={videoId} />;
}
