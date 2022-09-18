import Redis from 'ioredis';

export const redisClient = new Redis({
  username: process.env.REDISUSER ?? undefined,
  password: process.env.REDISPASSWORD ?? undefined,
  host: process.env.REDISHOST ?? undefined,
  port: (process.env.REDISPORT) ? parseInt(process.env.REDISPORT) : undefined
});

export type GetFunc<T> = (key: string) => Promise<CacheItem<T>>;
export type SetFunc<T> = (key: string, data: T) => Promise<CacheItem<T>>;

export interface CacheItem<T> {
  isValid: boolean
  data: T | null
  set: (data: T) => Promise<CacheItem<T>>
}

export interface Cache<T> {
  set: SetFunc<T>
  get:  GetFunc<T>
}

export interface CacheStoreConfig {
  redisClient: Redis
  defaultExpire: number
}

export const defaultCacheConfig : CacheStoreConfig = {
  redisClient,
  defaultExpire: 1 * 60 * 60 // Expire in one hour
};

export default function createCacheStore <T>(config = defaultCacheConfig) : Cache<T> {
  const redis = config.redisClient;

  async function setItem(key: string, data: T, expire: number | null = null) : Promise<CacheItem<T>> {
    await redis.set(key, JSON.stringify(data), 'EX', expire ?? config.defaultExpire);

    return {
      isValid: true,
      data: data,
      set: async (newData: T) => setItem(key, newData)
    };
  }

  async function getItem(key: string) : Promise<CacheItem<T>> {
    const data = await redis.get(key);

    if(data) {
      return {
        isValid: true,
        data: JSON.parse(data) as T,
        set: async (newData: T) => setItem(key, newData)
      };
    }

    return {
      isValid: false,
      data: null,
      set: async (newData: T) => setItem(key, newData)
    };
  }

  return {
    get: getItem,
    set: setItem
  };
}
