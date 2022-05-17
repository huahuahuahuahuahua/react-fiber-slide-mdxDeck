let timerQueue = [];
// 存放任务的队列
let taskQueue = [];
let shouldYield = false;
// 调度器
function scheduleCallback(task) {
  // 向队列中添加任务
  taskQueue.push(task);
  // 优先级影响到任务在队列中的排序，将优先级最高的任务排在最前面
  taskQueue.sort((a, b) => a.priority - b.priority);
  // 从队列中取出任务
  const currentTask = taskQueue[0];
  nextUnitOfWork = currentTask;
  // 请求空闲时间进行工作循环
  requestIdleCallback(workLoop);
}

//根据优先级处理任务
function workLoop(deadline) {
  console.log("workLoop");
  const currentWork = nextUnitOfWork;
  //每次循环都会调用shouldYield判断当前是否有剩余时间。
  while (currentWork && !shouldYield) {
    // performUnitOfWork 是DFS（Depth-first search）遍历过程
    nextUnitOfWork = performUnitOfWork(currentWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 如果没有下个单元任务和工作树存在
  if (!currentWork && wipRoot) {
    // 提交root任务
    commitRoot();
  }
  //请求主线程空闲时间进行工作循环;
  requestIdleCallback(workLoop);
}

//构建 Fiber 树中每个 Fiber 的方法
function performUnitOfWork(fiber) {
  const isFunctionComponent =
    fiber.type instanceof Function;
  if (isFunctionComponent) {
    //函数组件
    updateFunctionComponent(fiber);
  } else {
    //类组件
    updateHostComponent(fiber);
  }
  //调和子树
  reconcileChildren(fiber, children);
}

// 工作树
let currentRoot = null;
// 虚拟树
let wipRoot = null;
// 调和子树
function reconcileChildren(fiber, children) {
  const sameType =
    oldFiber && element && element.type == oldFiber.type;
  if (sameType) {
    // TODO update the node
  }
  if (element && !sameType) {
    // TODO add this node
  }
  if (oldFiber && !sameType) {
    // TODO delete the oldFiber's node
  }
}

// 更新视图
function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
