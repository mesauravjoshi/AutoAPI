/**
 * Returns true if the URL points to a local/development environment.
 */
export function isLocalApiUrl(apiUrl: string): boolean {
  try {
    const url = new URL(apiUrl);
    const host = url.hostname.toLowerCase();

    // localhost
    if (host === "localhost") {
      return true;
    }

    // 127.0.0.0/8 (loopback)
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return true;
    }

    // 0.0.0.0
    if (host === "0.0.0.0") {
      return true;
    }

    // IPv6 localhost
    if (host === "::1" || host === "[::1]") {
      return true;
    }

    // Private IPv4 ranges
    if (
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) || // 10.0.0.0/8
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) || // 192.168.0.0/16
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host) // 172.16.0.0 - 172.31.255.255
    ) {
      return true;
    }

    // Common local development domains
    const localDomains = [
      ".local",
      ".test",
      ".localhost",
      ".invalid",
      ".home",
      ".internal",
    ];

    if (localDomains.some(domain => host.endsWith(domain))) {
      return true;
    }

    return false;
  } catch {
    // Invalid URL
    return false;
  }
}