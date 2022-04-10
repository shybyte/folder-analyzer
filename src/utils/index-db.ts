const STORE_NAME = 'values';

export class SimpleIndexDB {
  static create(name: string): Promise<SimpleIndexDB> {
    return new Promise((resolve) => {
      const request = window.indexedDB.open(name);
      request.onsuccess = () => {
        resolve(new SimpleIndexDB(request.result));
      };
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
    });
  }

  static delete(name: string): Promise<void> {
    return new Promise((resolve) => {
      const request = window.indexedDB.deleteDatabase(name);
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  private constructor(private readonly db: IDBDatabase) {}

  close() {
    this.db.close();
  }

  async get<T>(key: string): Promise<T | undefined> {
    const transaction = this.db.transaction([STORE_NAME]);
    const request = transaction.objectStore(STORE_NAME).get(key);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const request = transaction.objectStore(STORE_NAME).put(value, key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (error) => {
        reject(error);
      };
    });
  }
}
