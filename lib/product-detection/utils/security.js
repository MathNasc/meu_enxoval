// lib/product-detection/utils/security.js
// Proteção SSRF — bloqueia IPs internos, loopback e endpoints de metadata cloud.

const BLOCKED = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^169\.254\.169\.254$/,         // AWS metadata
  /metadata\.google\.internal$/,  // GCP metadata
  /^0\.0\.0\.0$/,
  /^::1$/,
];

export function isAllowedUrl(raw) {
  try {
    const { protocol, hostname } = new URL(raw);
    if (!["http:", "https:"].includes(protocol)) return false;
    const h = hostname.toLowerCase();
    return !BLOCKED.some((pattern) => pattern.test(h));
  } catch {
    return false;
  }
}
