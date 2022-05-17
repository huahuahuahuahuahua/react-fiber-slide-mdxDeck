function workLoop(deadline) {
  console.log("workLoop");
  let shouldYield = false;
  //每次循环都会调用shouldYield判断当前是否有剩余时间。
  while (nextUnitOfWork && !shouldYield) {
    //performUnitOfWork 是DFS（Depth-first search）遍历过程
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //安排低优先级或非必要的函数在帧结束时的空闲时间被调用
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
