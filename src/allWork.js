// 调度器
function scheduleCallback(task) {}
//请求空闲时间进行工作循环
requestIdleCallback(workLoop);
//根据优先级处理任务
function workLoop(deadline) {}
//构建 Fiber 树中每个 Fiber 的方法
function performUnitOfWork(fiber) {}
//更新视图
function commitRoot() {}
