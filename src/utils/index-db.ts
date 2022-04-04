const STORE_NAME = 'values';

export class SimpleIndexDB {
  static create(name: string): Promise<SimpleIndexDB> {
    return new Promise((resolve) => {
      const request = window.indexedDB.open(name);
      request.onsuccess = (ev) => {
        const db: IDBDatabase = (ev.target as any).result;
        resolve(new SimpleIndexDB(db));
      };
      request.onupgradeneeded = (event) => {
        const db: IDBDatabase = (event.target as any).result;
        db.createObjectStore(STORE_NAME);
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
        resolve(request.result);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const request = transaction.objectStore(STORE_NAME).add(value, key);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve();
      };
    });
  }
}
