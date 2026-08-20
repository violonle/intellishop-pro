export type SiteName = 'business' | 'platform-admin';

export const SITE: SiteName = import.meta.env.VITE_SITE === 'platform-admin'
    ? 'platform-admin'
    : 'business';

export const IS_PLATFORM_ADMIN_SITE = SITE === 'platform-admin';
export const LOGIN_PATH = IS_PLATFORM_ADMIN_SITE ? '/admin-login' : '/login';

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '');

export const BUSINESS_SITE_URL = normalizeBaseUrl(
    import.meta.env.VITE_BUSINESS_SITE_URL || 'http://localhost:5174',
);

export const PLATFORM_ADMIN_SITE_URL = normalizeBaseUrl(
    import.meta.env.VITE_PLATFORM_ADMIN_SITE_URL || 'http://localhost:5175',
);
