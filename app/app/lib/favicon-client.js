/**
 * Client-side favicon fetching using Google's favicon service
 */

export function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function getFaviconUrl(url) {
  const domain = getDomainFromUrl(url);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export function getFaviconFallbackUrl(url) {
  const domain = getDomainFromUrl(url);
  if (!domain) return null;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

// Preload favicon image to check if it exists
export function preloadFavicon(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export async function fetchBestFavicon(url) {
  const sources = [
    getFaviconUrl(url),
    getFaviconFallbackUrl(url),
  ].filter(Boolean);
  
  for (const source of sources) {
    const loaded = await preloadFavicon(source);
    if (loaded) {
      return source;
    }
  }
  
  return null;
}
