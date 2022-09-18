import Redis from 'ioredis';

export type GetFunc<T> = (key: string) => Promise<CacheItem<T>>;
export type SetFunc<T> = (key: string, data: T, expire: number) => Promise<CacheItem<T>>;
export type GetSetFunc<T> = (key: string, callback: (key: string) => Promise<T | null>) => Promise<CacheItem<T>>;

export interface CacheItem<T> {
  isValid: boolean
  data: T | null
  set: (data: T, expire?: number) => Promise<CacheItem<T>>
}

export interface Cache<T> {
  set: SetFunc<T>
  get:  GetFunc<T>
  getSet: GetSetFunc<T>
}

export interface CacheStoreConfig {
  redisClient: Redis
  defaultExpire: number
}

export const defaultCacheConfig : CacheStoreConfig = {
  redisClient: new Redis({
    username: process.env.REDISUSER ?? undefined,
    password: process.env.REDISPASSWORD ?? undefined,
    host: process.env.REDISHOST ?? undefined,
    port: (process.env.REDISPORT) ? parseInt(process.env.REDISPORT) : undefined,
    lazyConnect: true
  }),
  defaultExpire: 1 * 60 * 60 // Expire in one hour
};

export default function createCacheStore <T>(config = defaultCacheConfig) : Cache<T> {
  const redis = config.redisClient;

  async function setItem(key: string, data: T, expire: number) : Promise<CacheItem<T>> {
    const setWithoutKey = async (newData: T) => setItem(key, newData, expire);

    try {
      if(redis) {
        await redis.set(key, JSON.stringify(data), 'EX', expire ?? config.defaultExpire);
      }

      return {
        isValid: true,
        data: data,
        set: setWithoutKey
      };
    } catch(e) {
      return {
        isValid: false,
        data: data,
        set: setWithoutKey
      };
    }
  }

  async function getItem(key: string) : Promise<CacheItem<T>> {
    const setWithoutKey =  async (newData: T, expire = config.defaultExpire) => setItem(key, newData, expire);

    try {
      const data = (redis) ? await redis.get(key) : null;

      if(data) {
        return {
          isValid: true,
          data: JSON.parse(data) as T,
          set: setWithoutKey
        };
      }

      return {
        isValid: false,
        data: null,
        set: setWithoutKey
      };
    } catch(e) {
      return {
        isValid: false,
        data: null,
        set: setWithoutKey
      };
    }
  }

  return {
    get: getItem,
    set: setItem,
    getSet: async (key, callback) => {
      const cacheData = await getItem(key);
      if(!cacheData.isValid) {
        const data = await callback(key);

        if(data) {
          await cacheData.set(data);
        }
      }

      return cacheData;
    }
  };
}
