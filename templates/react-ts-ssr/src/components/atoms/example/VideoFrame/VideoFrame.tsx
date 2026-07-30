// EXAMPLE - safe to delete.
export type VideoFrameProps = {
  videoId: string;
  title?: string;
};

export function VideoFrame({ videoId, title = 'YouTube video' }: VideoFrameProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}
