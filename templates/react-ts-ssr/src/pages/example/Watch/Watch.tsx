// EXAMPLE - safe to delete alongside `pages/watch/+Page.tsx`.
import { Suspense } from 'react';
import { navigate } from 'vike/client/router';
import { ArchitectureNote } from '@/components/molecules/example/ArchitectureNote';
import { VideoUrlForm } from '@/components/molecules/example/VideoUrlForm';
import { VideoPlayer } from '@/components/organisms/example/VideoPlayer';

export type WatchProps = {
  videoId: string | null;
};

export function Watch({ videoId }: WatchProps) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="sr-only">Watch a YouTube video</h1>
      <VideoUrlForm onSubmit={(id) => navigate(`/watch?v=${encodeURIComponent(id)}`)} />
      {videoId ? (
        <Suspense fallback={<p className="text-sm text-muted">Loading player…</p>}>
          <VideoPlayer videoId={videoId} />
        </Suspense>
      ) : (
        <p className="text-sm text-muted">Paste a URL above to load a video.</p>
      )}
      <a href="/example" className="text-sm text-primary hover:underline">
        &larr; Back to the example landing
      </a>

      <ArchitectureNote
        layers={[
          { layer: 'Template', components: ['MainLayout'] },
          {
            layer: 'Organisms',
            components: ['VideoPlayer'],
            purpose: 'Composes VideoFrame + useVideoOEmbed data',
          },
          { layer: 'Molecules', components: ['VideoUrlForm', 'ArchitectureNote'] },
          { layer: 'Atoms', components: ['VideoFrame', 'UrlInput', 'Button'] },
          {
            layer: 'Hook',
            components: ['hooks/example/useVideoOEmbed'],
            purpose: 'TanStack Query hook, enabled only when videoId is present',
          },
          {
            layer: 'Route',
            components: ['pages/watch/+Page.tsx'],
            purpose: 'Vike page; reads ?v= via usePageContext().urlParsed.search',
          },
        ]}
      />
    </section>
  );
}
