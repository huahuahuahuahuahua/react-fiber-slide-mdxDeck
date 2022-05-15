class InternalComponent {
  receiveComponent(nextElement) {
    var prevElement = this._currentElement;
    this.updateComponent(prevElement, nextElement);
  }
  updateComponent(prevParentElement, nextParentElement) {
    // 更新当前节点的props和state
    var prevProps = prevParentElement.props;
    var nextProps = nextParentElement.props;
    //将setState的partialState与原state合并
    var nextState = this._processPendingState(
      nextProps,
      nextContext
    );
    this._publicInstance.props = nextProps;
    this._publicInstance.state = nextState;

    // 更新子节点
    var prevComponentInstance = this._renderedComponent;
    // 上次render出来的element
    var prevRenderedElement =
      prevComponentInstance._currentElement;
    // 调用component 的 render，获取新的element
    var nextRenderedElement = this._publicInstance.render();
    // 判断是否是仅仅需要更新子节点
    if (
      shouldUpdateReactComponent(
        prevRenderedElement,
        nextRenderedElement
      )
    ) {
      // 子节点，递归调用receiveComponent
      prevComponentInstance.receiveComponent(
        nextRenderedElement
      );
    } else {
      // 否则，卸载旧的子节点，然后走新建子节点流程
    }
  }
}
