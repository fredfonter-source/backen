export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function assertHttpsUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new HttpError(400, 'Only HTTPS URLs are allowed', { url });
    }
  } catch {
    throw new HttpError(400, 'Invalid URL', { url });
  }
}

