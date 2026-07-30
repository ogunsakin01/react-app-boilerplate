// EXAMPLE - safe to delete alongside `pages/example/+Page.tsx`.
import { navigate } from 'vike/client/router';
import { ArchitectureNote } from '@/components/molecules/example/ArchitectureNote';
import { VideoUrlForm } from '@/components/molecules/example/VideoUrlForm';

export function Example() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Example usage</p>
        <h1 className="text-3xl font-semibold tracking-tight">Paste a YouTube URL</h1>
        <p className="text-sm text-muted">
          Any URL shape works: <code>watch?v=</code>, <code>youtu.be/…</code>, <code>/embed</code>,{' '}
          <code>/shorts</code>, or a bare video ID. Submitting navigates to{' '}
          <code>/watch?v=&lt;id&gt;</code> and loads the video with metadata fetched via TanStack
          Query.
        </p>
      </div>

      <VideoUrlForm onSubmit={(videoId) => navigate(`/watch?v=${encodeURIComponent(videoId)}`)} />

      <ArchitectureNote
        layers={[
          { layer: 'Template', components: ['MainLayout'] },
          {
            layer: 'Molecules',
            components: ['VideoUrlForm', 'ArchitectureNote'],
            purpose: 'VideoUrlForm wraps rhf + zod validation around an atom',
          },
          {
            layer: 'Atoms',
            components: ['UrlInput', 'Button'],
            purpose: 'Reusable primitives. UrlInput is a styled <input type="url">',
          },
          {
            layer: 'Lib',
            components: ['lib/example/youtube.ts'],
            purpose: 'Pure URL parser used by zod refine; covered by 19 unit tests',
          },
        ]}
      />
    </section>
  );
}
