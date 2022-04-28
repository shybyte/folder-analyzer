export type ConcurrentQueueTask = () => Promise<void>;

interface QueuedTask {
  deferred: Deferred;
  task: ConcurrentQueueTask;
}

export class ConcurrentQueue {
  private runningTasks: Promise<void>[] = [];
  private queuedTasks: QueuedTask[] = [];

  constructor(private maxConcurrency = 10) {}

  addTask(task: () => Promise<void>) {
    const deferred = new Deferred();
    this.queuedTasks.push({ deferred, task });
    this.startNextTaskIfPossible();
    return deferred.promise;
  }

  private startNextTaskIfPossible() {
    if (this.runningTasks.length < this.maxConcurrency) {
      const nextTask = this.queuedTasks.shift();
      if (!nextTask) {
        return;
      }
      const promise = nextTask.task();
      promise.then(
        () => {
          nextTask.deferred.resolve();
        },
        () => {
          nextTask.deferred.reject();
        },
      );
      promise.finally(() => {
        this.runningTasks = this.runningTasks.filter((it) => it !== promise);
        this.startNextTaskIfPossible();
      });
      this.runningTasks.push(promise);
    }
  }
}

class Deferred {
  public promise: Promise<void>;
  public resolve!: (value: PromiseLike<void> | void) => void;
  public reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
