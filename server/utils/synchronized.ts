import * as _ from "lodash";
import { config } from "../config";

// cached promise by key for in-flight request handling
export function synchronizedBy<T>(target: () => Promise<T>): (cacheKey: string) => Promise<T>;
export function synchronizedBy<A1, T>(target: (arg1: A1) => Promise<T>): (cacheKey: string, arg1: A1) => Promise<T>;
export function synchronizedBy<A1, A2, T>(target: (arg1: A1, arg2: A2) => Promise<T>): (cacheKey: string, arg1: A1, arg2: A2) => Promise<T>;
export function synchronizedBy<A, T>(target: (...args: A[]) => Promise<T>): (cacheKey: string, ...args: A[]) => Promise<T> {
  const mutexMap = new Map<string, Promise<T>>();

  return async function (cacheKey: string, ...params: A[]) {
    let mutexPromise = mutexMap.get(cacheKey);

    if (_.isNil(mutexPromise)) {
      let resolveMutexPromise!: (value: T | PromiseLike<T>) => void;
      let rejectMutexPromise!: (reason: unknown) => void;

      mutexPromise = new Promise<T>(function (resolve, reject) {
        resolveMutexPromise = resolve;
        rejectMutexPromise = reject;
      });

      mutexMap.set(cacheKey, mutexPromise);

      try {
        const ret = await target(...params);

        resolveMutexPromise(ret);
      } catch (err) {
        rejectMutexPromise(err);
      }
    } else {
      if (config.ENV === "test") {
        console.log("synchronizedBy cache hit:", cacheKey);
      }
    }

    try {
      const value = await mutexPromise;
      // rm from cache again
      mutexMap.delete(cacheKey);
      return value;
    } catch (error) {
      // rm from cache again
      mutexMap.delete(cacheKey);
      throw error;
    }
  };
}
