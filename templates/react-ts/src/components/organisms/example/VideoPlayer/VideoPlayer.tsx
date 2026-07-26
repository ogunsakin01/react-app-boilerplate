// EXAMPLE - safe to delete.
import { VideoFrame } from '@/components/atoms/example/VideoFrame';
import { useVideoOEmbed } from '@/hooks/example/useVideoOEmbed';

export type VideoPlayerProps = {
  videoId: string;
};

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const { data, isLoading, isError } = useVideoOEmbed(videoId);

  return (
    <div className="flex flex-col gap-3">
      <VideoFrame videoId={videoId} title={data?.title} />
      {isLoading ? (
        <p role="status" className="text-sm text-muted">
          Loading title…
        </p>
      ) : null}
      {isError ? (
        <p role="alert" className="text-sm text-primary">
          Couldn&rsquo;t load metadata (the video still plays above).
        </p>
      ) : null}
      {data ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">{data.title}</h2>
          <p className="text-sm text-muted">
            <a href={data.author_url} target="_blank" rel="noreferrer" className="hover:underline">
              {data.author_name}
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
