import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { env } from '@/lib/env';
import { buildWatchUrl } from '@/lib/example/youtube';
import type { OEmbed } from '@/types/example/oembed';

// EXAMPLE - safe to delete.
export function useVideoOEmbed(videoId: string | null) {
  return useQuery({
    queryKey: ['oembed', videoId],
    enabled: !!videoId,
    queryFn: () => {
      const target = buildWatchUrl(videoId as string);
      const url = `${env.VITE_OEMBED_BASE_URL}?url=${encodeURIComponent(target)}`;
      return apiGet<OEmbed>(url);
    },
  });
}
