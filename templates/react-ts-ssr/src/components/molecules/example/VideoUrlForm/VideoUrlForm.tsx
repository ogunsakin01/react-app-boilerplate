// EXAMPLE - safe to delete.
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { UrlInput } from '@/components/atoms/example/UrlInput';
import { parseYouTubeUrl } from '@/lib/example/youtube';

const schema = z.object({
  url: z
    .string()
    .min(1, 'Paste a YouTube URL')
    .refine((v) => parseYouTubeUrl(v) !== null, 'That doesn’t look like a YouTube URL'),
});

export type VideoUrlValues = z.infer<typeof schema>;

export type VideoUrlFormProps = {
  onSubmit: (videoId: string) => void;
  initialValue?: string;
};

export function VideoUrlForm({ onSubmit, initialValue = '' }: VideoUrlFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VideoUrlValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: initialValue },
  });

  return (
    <form
      onSubmit={handleSubmit(({ url }) => {
        const id = parseYouTubeUrl(url);
        if (id) onSubmit(id);
      })}
      className="flex flex-col gap-2"
      aria-label="Load YouTube video"
      noValidate
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        YouTube URL
        <UrlInput
          {...register('url')}
          placeholder="https://www.youtube.com/watch?v=…"
          hasError={!!errors.url}
          aria-invalid={errors.url ? true : undefined}
          aria-describedby={errors.url ? 'video-url-error' : undefined}
        />
      </label>
      {errors.url ? (
        <p id="video-url-error" role="alert" className="text-sm text-primary">
          {errors.url.message}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        Load video
      </Button>
    </form>
  );
}
