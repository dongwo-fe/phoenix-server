const Cache = new Map();

export function getWebsiteCacheByKey(key: string) {
    return Cache.get(key);
}

export function setWebsiteCache(key: string, content: any) {
    Cache.set(key, content);
}

export function clearWebsiteCache() {
    Cache.clear();
}

export function clearWebsiteCacheByKey(key: string) {
    Cache.delete(key);
}
