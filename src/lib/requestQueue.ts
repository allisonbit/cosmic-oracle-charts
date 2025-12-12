// Request queue for batching API calls and reducing total requests
type QueuedRequest = {
  key: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

class RequestQueue {
  private queue: Map<string, QueuedRequest[]> = new Map();
  private processing: Set<string> = new Set();
  private batchDelay = 100; // ms to wait before processing batch
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  async add<T>(key: string, execute: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // If same request is already queued, return that promise instead
      const existing = this.queue.get(key);
      if (existing && existing.length > 0) {
        // Attach to existing request
        existing.push({ key, execute, resolve, reject });
        return;
      }

      // Create new queue for this key
      this.queue.set(key, [{ key, execute, resolve, reject }]);

      // Clear existing timeout
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Schedule batch processing
      const timeout = setTimeout(() => this.processBatch(key), this.batchDelay);
      this.timeouts.set(key, timeout);
    });
  }

  private async processBatch(key: string) {
    if (this.processing.has(key)) return;
    
    const requests = this.queue.get(key);
    if (!requests || requests.length === 0) return;

    this.processing.add(key);
    this.queue.delete(key);
    this.timeouts.delete(key);

    try {
      // Execute only once for all queued requests
      const result = await requests[0].execute();
      
      // Resolve all waiting promises with the same result
      requests.forEach(req => req.resolve(result));
    } catch (error) {
      // Reject all waiting promises
      requests.forEach(req => req.reject(error));
    } finally {
      this.processing.delete(key);
    }
  }

  // Batch multiple different requests together
  async batchExecute<T>(requests: { key: string; execute: () => Promise<T> }[]): Promise<T[]> {
    const uniqueRequests = new Map<string, () => Promise<T>>();
    
    requests.forEach(req => {
      if (!uniqueRequests.has(req.key)) {
        uniqueRequests.set(req.key, req.execute);
      }
    });

    const results = await Promise.all(
      Array.from(uniqueRequests.entries()).map(async ([key, execute]) => {
        return this.add(key, execute);
      })
    );

    // Map results back to original request order
    return requests.map(req => {
      const index = Array.from(uniqueRequests.keys()).indexOf(req.key);
      return results[index];
    });
  }
}

export const requestQueue = new RequestQueue();

// Debounced fetch utility
const pendingRequests = new Map<string, Promise<any>>();

export async function debouncedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dedupeWindow = 500
): Promise<T> {
  // Return existing promise if request is in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetchFn().finally(() => {
    // Remove from pending after dedupe window
    setTimeout(() => pendingRequests.delete(key), dedupeWindow);
  });

  pendingRequests.set(key, promise);
  return promise;
}
