/**
 * Share a link: the phone's share sheet when there is one, otherwise copy it to the clipboard.
 * Returns what happened so the caller can show "Link copied".
 */
export const shareLink = async (url: string, title: string, text?: string): Promise<'shared' | 'copied' | 'cancelled'> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text: text ?? title, url });
      return 'shared';
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'cancelled'; // closed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    window.prompt('Copy this link', url);
    return 'cancelled';
  }
};
