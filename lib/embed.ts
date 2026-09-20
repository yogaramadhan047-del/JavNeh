/**
 * Normalizes video embed URLs and extracts src from raw iframe tags.
 * Ensures consistent, functional playback across desktop and mobile.
 */

export function extractIframeSrc(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed.includes("<iframe")) return null;

  // Match src="..." or src='...'
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function normalizeEmbedUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();

  // If raw input is an iframe tag (e.g. <iframe src="https://..."></iframe>)
  const extracted = extractIframeSrc(url);
  if (extracted) {
    url = extracted;
  }

  // If protocol-relative URL (e.g. //domain.com/embed/xyz)
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  // Handle YouTube links
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // youtu.be/VIDEO_ID
      const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (youtuBeMatch && youtuBeMatch[1]) {
        return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
      }

      // youtube.com/watch?v=VIDEO_ID
      if (url.includes("/watch")) {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        const v = parsed.searchParams.get("v");
        if (v) {
          const t = parsed.searchParams.get("t");
          return t ? `https://www.youtube.com/embed/${v}?start=${parseInt(t, 10)}` : `https://www.youtube.com/embed/${v}`;
        }
      }

      // youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch && shortsMatch[1]) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
    }

    // Google Drive: /view -> /preview for embedding
    if (url.includes("drive.google.com/file/d/")) {
      const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
    }

    // Vimeo: vimeo.com/ID -> player.vimeo.com/video/ID
    if (url.includes("vimeo.com") && !url.includes("player.vimeo.com")) {
      const vimeoMatch = url.match(/vimeo\.com\/([0-9]+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    // Dailymotion: dailymotion.com/video/ID -> dailymotion.com/embed/video/ID
    if (url.includes("dailymotion.com/video/")) {
      const dmMatch = url.match(/\/video\/([a-zA-Z0-9]+)/);
      if (dmMatch && dmMatch[1]) {
        return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
      }
    }
  } catch {
    // If URL parsing fails, fallback to basic trimmed string
  }

  return url;
}

export function isDirectVideoUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".m3u8") || clean.endsWith(".ogg");
}
