import { assert } from '@ember/debug';
import Scheduler from './-scheduler';

import UnboundedSchedulerPolicy from './-private/scheduler-policies/unbounded-policy'
import EnqueueSchedulerPolicy from './-private/scheduler-policies/enqueued-policy'
import DropSchedulerPolicy from './-private/scheduler-policies/drop-policy'
import KeepLatestSchedulerPolicy from './-private/scheduler-policies/keep-latest-policy'
import RestartableSchedulerPolicy from './-private/scheduler-policies/restartable-policy'

export const propertyModifiers = {
  _bufferPolicy: UnboundedSchedulerPolicy,
  _maxConcurrency: Infinity,
  _taskGroupPath: null,
  _hasUsedModifier: false,
  _hasSetBufferPolicy: false,
  _hasEnabledEvents: false,

  restartable() {
    return setBufferPolicy(this, RestartableSchedulerPolicy);
  },

  enqueue() {
    return setBufferPolicy(this, EnqueueSchedulerPolicy);
  },

  drop() {
    return setBufferPolicy(this, DropSchedulerPolicy);
  },

  keepLatest() {
    return setBufferPolicy(this, KeepLatestSchedulerPolicy);
  },

  maxConcurrency(n) {
    this._hasUsedModifier = true;
    this._maxConcurrency = n;
    assertModifiersNotMixedWithGroup(this);
    return this;
  },

  group(taskGroupPath) {
    this._taskGroupPath = taskGroupPath;
    assertModifiersNotMixedWithGroup(this);
    return this;
  },

  evented() {
    this._hasEnabledEvents = true;
    return this;
  },

  debug() {
    this._debug = true;
    return this;
  }
};

function setBufferPolicy(obj, policy) {
  obj._hasSetBufferPolicy = true;
  obj._hasUsedModifier = true;
  obj._bufferPolicy = policy;
  assertModifiersNotMixedWithGroup(obj);

  if (obj._maxConcurrency === Infinity) {
    obj._maxConcurrency = 1;
  }

  return obj;
}

function assertModifiersNotMixedWithGroup(obj) {
  assert(`ember-concurrency does not currently support using both .group() with other task modifiers (e.g. drop(), enqueue(), restartable())`, !obj._hasUsedModifier || !obj._taskGroupPath);
}

export function resolveScheduler(propertyObj, obj, TaskGroup) {
  if (propertyObj._taskGroupPath) {
    let taskGroup = obj.get(propertyObj._taskGroupPath);
    assert(`Expected path '${propertyObj._taskGroupPath}' to resolve to a TaskGroup object, but instead was ${taskGroup}`, taskGroup instanceof TaskGroup);
    return taskGroup._scheduler;
  } else {
    return Scheduler.create({
      bufferPolicy: new propertyObj._bufferPolicy(propertyObj._maxConcurrency),
    });
  }
}

