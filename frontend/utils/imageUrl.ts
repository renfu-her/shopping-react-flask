/**
 * 圖片 URL 處理工具
 * 將相對路徑轉換為完整 URL
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  // 如果已經是完整 URL（以 http:// 或 https:// 開頭），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果是相對路徑，使用當前域名
  if (typeof window !== 'undefined') {
    // 在瀏覽器環境中，使用當前協議和域名
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  // 在服務器端渲染或構建時，使用預設的生產環境 URL
  return `https://shopping-react.ai-tracks.com${url.startsWith('/') ? url : '/' + url}`;
}

