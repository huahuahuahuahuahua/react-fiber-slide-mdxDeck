---
title: react with fiber的演示文档
date: 2022/5/13
author: t_winkjqzhang
description: show the difference of react with fiber or not
---



# react with fiber



## Jsx && element节点

```js
export type ReactElement = {
  $$typeof: any
  type: any
  key: any
  ref: any
  props: any
  _owner: ReactInstance
}
```



![image-20220515002512683](C:\Users\10177\AppData\Roaming\Typora\typora-user-images\image-20220515002512683.png)

### stack reconclier



### Recursion Update

在 Stack Reconciler 策略中，react 采用 **递归**的方式来生成或者更新 InternalComponent tree。

```js
class InternalComponent {
  receiveComponent(nextElement) {
    var prevElement = this._currentElement

    this.updateComponent(prevElement, nextElement)
  }
  updateComponent(prevParentElement, nextParentElement) {
    // 更新当前节点的props和state
    var prevProps = prevParentElement.props
    var nextProps = nextParentElement.props
    //将setState的partialState与原state合并
    var nextState = this._processPendingState(nextProps, nextContext)
    this._publicInstance.props = nextProps
    this._publicInstance.state = nextState

    // 更新子节点
    var prevComponentInstance = this._renderedComponent
    // 上次render出来的element
    var prevRenderedElement = prevComponentInstance._currentElement
    // 调用component 的 render，获取新的element
    var nextRenderedElement = this._publicInstance.render()
    // 判断是否是仅仅需要更新子节点
    if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
      // 子节点，递归调用receiveComponent
      prevComponentInstance.receiveComponent(nextRenderedElement)
    } else {
      // 否则，卸载旧的子节点，然后走新建子节点流程
    }
  }
}
```





## what is Fiber



**Fiber 架构的核心即是"可中断"、"可恢复"、"优先级"**



Fiber 的中文翻译叫纤程，与进程、线程同为程序执行过程，Fiber 就是比线程还要纤细的一个过程。纤程意在对渲染过程实现进行更加精细的控制。

从架构角度来看，Fiber 是对 React 核心算法（即调和过程）的重写。

从编码角度来看，

Fiber 是 React 内部所定义的一种结构，就像双向队列，栈，堆一样,一种数据结构

它是 Fiber 树结构的节点单位，也就是 React 16 新架构下的"虚拟 DOM"。

一个 fiber 就是一个 JavaScript 对象，Fiber 的数据结构如下：

```
type Fiber = {
  // 用于标记fiber的WorkTag类型，主要表示当前fiber代表的组件类型如FunctionComponent、ClassComponent等
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，调用`createElement`的第一个参数
  elementType: any,
  // The resolved function/class/ associated with this fiber.
  // 表示当前代表的节点类型
  type: any,
  // 表示当前FiberNode对应的element组件实例
  stateNode: any,

  // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
  return: Fiber | null,
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构，兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,

  ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

  // 当前处理过程中的组件props对象
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state
  memoizedState: any,

  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,

  mode: TypeOfMode,

  // Effect
  // 用来记录Side Effect
  effectTag: SideEffectTag,

  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,

  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,

  // 代表任务在未来的哪个时间点应该被完成，之后版本改名为 lanes
  expirationTime: ExpirationTime,

  // 快速确定子树中是否有不在等待的变化
  childExpirationTime: ExpirationTime,

  // fiber的版本池，即记录fiber更新过程，便于恢复
  alternate: Fiber | null,
}
```





![image-20220514223222410](C:\Users\10177\AppData\Roaming\Typora\typora-user-images\image-20220514223222410.png)



![image-20220514223248106](C:\Users\10177\AppData\Roaming\Typora\typora-user-images\image-20220514223248106.png)

![image-20220514223128214](C:\Users\10177\AppData\Roaming\Typora\typora-user-images\image-20220514223128214.png)







## why use fiber

如果 JavaScript 线程长时间地占用了主线程，那么渲染层面的更新就不得不长时间地等待,界面长时间不更新，会导致页面响应度变差，

## how fiber work

### Scheduler 调度器 

多了**Scheduler（调度器）**，调度器的作用是调度更新的优先级。



### Reconciler 协调器

在 React 15 中是递归处理虚拟 DOM 的，React 16 则是变成了可以中断的循环过程，每次循环都会调用`shouldYield`判断当前是否有剩余时间。

这个需要上面提到的`requestIdleCallback`

`window.requestIdleCallback()`方法将在浏览器的空闲时段内调用的函数排队。在主事件循环上执行后台和低优先级工作

```jsx
let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false
   // Perform work until Scheduler asks us to yield
  //React 16 则是变成了可以中断的循环过程，每次循环都会调用shouldYield判断当前是否有剩余时间。
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
        //每个unit fiber单元
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
    //在浏览器的空闲时段内调用的函数排队。在主事件循环上执行后台和低优先级工作 16ms
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
```

![]img([w5qst-rby12.gif (464×128) (aconvert.com)](https://s19.aconvert.com/convert/p3r68-cdx67/w5qst-rby12.gif))

### render

```js
let nextUnitOfWork = null
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}
```



### performUnitOfWork

```js
function performUnitOfWork(fiber) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit of work
}
```



### performUnitOfWork

```js
function performUnitOfWork(fiber) {
  // TODO add dom node
    if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // TODO create new fibers
  // TODO return next unit of work
}
```



### performUnitOfWork

```js
function performUnitOfWork(fiber) {
  // TODO add dom node
    if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // TODO create new fibers
   const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
  // TODO return next unit of work
}
```



### performUnitOfWork

```js
function performUnitOfWork(fiber) {
  // TODO add dom node
    if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // TODO create new fibers
   const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
  // TODO return next unit of work
    if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
```



### render

```js
let nextUnitOfWork = null
let wipRoot = null
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }
    nextUnitOfWork = wipRoot
}
```





### workLoop

```js
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}


function commitRoot() {
  // TODO add nodes to dom
}
```



### commitRoot

```js
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
	
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}


function commitRoot() {
  // TODO add nodes to dom
    commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
   //递归提交
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```



### performUnitOfWork

```js
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
*
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
*
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
  wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null
    // TODO compare oldFiber to element
    
}
```



### reconcileChildren

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
  wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null
    // TODO compare oldFiber to element
    *
    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    if (sameType) {
      // TODO update the node
    }
    if (element && !sameType) {
      // TODO add this node
    }
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
    }
    *
}
```



## fiber in our program

总结：

​	从 stack reconciler 切换到 fiber reconciler，React 团队做的事情是，改变了遍历一颗树的方式。stack reconciler 中是使用递归，利用 JS 调用栈的方式，遍历 InternalComponent tree，这个过程是不可中断的，对于高优先级或者用户操作，需要等待执行栈为空才可以得到处理。而在 fiber reconciler 中，使用循环，通过`beginWork`，`completeWork`模拟入栈，出栈操作，达到遍历 fiber tree，这个过程可以根据`shouldYield`来停止，使用 workInProgress 来暂存当前节点，稍后可以继续恢复遍历。

# help

1. 参考文档：
2. 参考网址：