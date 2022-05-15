function workLoop(deadline) {
  console.log("workLoop");
  let shouldYield = false;
  //每次循环都会调用shouldYield判断当前是否有剩余时间。
  while (nextUnitOfWork && !shouldYield) {
    //触发对 beginWork 的调用，进而实现对新 Fiber 节点的创建
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //安排低优先级或非必要的函数在帧结束时的空闲时间被调用
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
