export const LIMITS = {
  title: 200,
  content: 20_000,
  category: 64,
  question: 1_000,
  name: 200,
  description: 2_000,
  role: 64,
  email: 254,
  note: 1_000,
  sourceUrl: 2_048,
} as const;

export function requireText(
  value: string,
  field: string,
  max: number
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${field} is required`);
  }

  if (trimmed.length > max) {
    throw new Error(`${field} must be ${max} characters or fewer`);
  }

  return trimmed;
}

export function optionalText(
  value: string | undefined,
  field: string,
  max: number
): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > max) {
    throw new Error(`${field} must be ${max} characters or fewer`);
  }

  return trimmed;
}

// Stored source URLs are rendered as links, so anything but https (notably
// javascript: and data:) is an XSS vector once a viewer clicks it.
export function normalizeSourceUrl(
  value: string | undefined
): string | undefined {
  const trimmed = optionalText(value, "Source URL", LIMITS.sourceUrl);

  if (!trimmed) {
    return undefined;
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Source URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Source URL must use https");
  }

  return trimmed;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  const email = requireText(value, "Email", LIMITS.email).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Email is not a valid address");
  }

  return email;
}
