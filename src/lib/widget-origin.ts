import { NextRequest } from 'next/server';

type PetWithDomain = {
  allowedDomain?: string | null;
};

function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}

export function getRequestOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin) return normalizeOrigin(origin);

  const referer = req.headers.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function isAllowedWidgetOrigin(req: NextRequest, pet: PetWithDomain) {
  const allowedOrigin = normalizeOrigin(pet.allowedDomain || '');
  if (!allowedOrigin) {
    return { allowed: true, allowedOrigin: null, requestOrigin: getRequestOrigin(req) };
  }

  const requestOrigin = getRequestOrigin(req);
  return {
    allowed: requestOrigin === allowedOrigin,
    allowedOrigin,
    requestOrigin,
  };
}

export function buildWidgetCorsHeaders(origin: string | null) {
  const headers = new Headers();
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}
