import { INITIAL_STATE } from "./initial-state";

export class BaseTaskInstance {
  constructor(task, executor) {
    this.task = task;
    this.executor = executor;
    this.executor.taskInstance = this;
  }

  setState() {}
  onStarted() {}
  onSuccess() {}
  onError() {}
  onCancel() {}
  formatCancelReason() {}
  selfCancelLoopWarning() {}

  onFinalize(callback) {
    this.executor.onFinalize(callback);
  }
}
Object.assign(BaseTaskInstance.prototype, INITIAL_STATE);
Object.assign(BaseTaskInstance.prototype, {
  state: 'waiting',
  isDropped: false,
  isRunning: true,
});