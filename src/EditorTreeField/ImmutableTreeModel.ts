import { TreeSchema } from "./TreeSchema";

export interface TreeNode {
  nodeId: string;
  nodeType: string;
  label: string;
  children: TreeNode[];
  parentId: string | undefined;

  nodePointer: string;
  dataPointer: string;
  childrenPointer: string;
}

function pointerValue(value: any, pointer: string): any {
  const components = pointer.split("/");
  let result: any = value;

  for (const component of components) {
    result = result[component];
    if (!result) {
      return result;
    }
  }

  return result;
}

export class ImmutableTreeModel {
  public children: TreeNode[];
  public allNodes: { [nodeId: string]: TreeNode };
  public rawValues: { [nodeId: string]: any };

  constructor(
    public value: any[] = [],
    private fieldPointer: string,
    private treeSchema: TreeSchema,
    private typeProperty: string = "type",
    private dataProperty: string = "data",
    private childrenProperty: string = "children"
  ) {
    this.rawValues = {};
    this.allNodes = {};

    const convertNodes = (
      parentId: string | undefined,
      stack: string[],
      nodes: any[] = [],
      pointer: string
    ): TreeNode[] => {
      const result: TreeNode[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const node: any = nodes[i];
        const nodeIdStack = stack.concat(`${i}`);
        const nodeId = nodeIdStack.join("/");

        const nodeTypeName = node[typeProperty];
        const nodeType = treeSchema.nodeTypes[nodeTypeName];

        const nodePointer = `${pointer}/${i}`;
        const childrenPointer = nodePointer + `/${childrenProperty}`;
        const dataPointer = nodePointer + `/${dataProperty}`;

        const treeNode: TreeNode = {
          nodeId,
          nodeType: nodeTypeName,
          label: node[typeProperty],
          children: convertNodes(
            nodeId,
            nodeIdStack,
            node[childrenProperty],
            childrenPointer
          ),
          parentId,

          nodePointer,
          childrenPointer,
          dataPointer
        };

        if (nodeType) {
          treeNode.label = nodeType.label;

          if (nodeType.labelField) {
            const labelValue = pointerValue(node.data, nodeType.labelField);
            treeNode.label = labelValue ? `${labelValue}` : nodeType.label; // (${nodeType.label})
          }
        }

        this.rawValues[nodeId] = node;
        this.allNodes[nodeId] = treeNode;
        result.push(treeNode);
      }
      return result;
    };

    this.children = convertNodes(undefined, [], value, fieldPointer);
  }

  public canInsertNode(parentId: string | undefined, nodeId: string): boolean {
    const node = this.allNodes[nodeId];
    const nodeType = node.nodeType;

    if (!parentId) {
      return this.treeSchema.rootNodeTypes.indexOf(nodeType) !== -1;
    } else {
      const parentNode = this.allNodes[parentId];
      return (
        this.treeSchema.nodeTypes[parentNode.nodeType].childNodeTypes.indexOf(
          nodeType
        ) !== -1
      );
    }
  }

  public insertNodeBefore(
    sourceId: string,
    targetId: string
  ): ImmutableTreeModel {
    // If trying to insert a node before itself... no change
    if (sourceId === targetId) {
      return this;
    }

    const sourceNode = this.allNodes[sourceId];
    const targetNode = this.allNodes[targetId];

    if (!sourceNode || !targetNode) {
      return this;
    }

    if (!this.canInsertNode(targetNode.parentId, sourceId)) {
      return this;
    }

    const treeRoot = this.cloneValue();

    const sourceValue = this.getNodeValue(treeRoot, sourceId);
    const targetValue = this.getNodeValue(treeRoot, targetId);

    const sourceParentList = sourceNode.parentId
      ? this.getNodeValue(treeRoot, sourceNode.parentId).children
      : treeRoot;
    const targetParentList = targetNode.parentId
      ? this.getNodeValue(treeRoot, targetNode.parentId).children
      : treeRoot;

    const sourceIndex = sourceParentList.indexOf(sourceValue);
    if (sourceIndex !== -1) {
      // remove from existing parent
      sourceParentList.splice(sourceIndex, 1);
    } else {
      // unknown error
      return this;
    }

    const targetIndex = targetParentList.indexOf(targetValue);

    if (targetIndex !== -1) {
      targetParentList.splice(targetIndex, 0, sourceValue);
    } else {
      return this;
    }

    return new ImmutableTreeModel(treeRoot, this.fieldPointer, this.treeSchema);
  }

  public setNodeData(nodeId: string, data: any): ImmutableTreeModel {
    const newValue = this.cloneValue();
    const node = this.getNodeValue(newValue, nodeId);
    node.data = data;
    return new ImmutableTreeModel(newValue, this.fieldPointer, this.treeSchema);
  }

  public insertNode(
    parent: string | undefined,
    nodeType: string
  ): ImmutableTreeModel {
    const newValue = this.cloneValue();
    const newNode = this.createNode(nodeType);

    if (!parent) {
      newValue.push(newNode);
    } else {
      const parentNode = this.getNodeValue(newValue, parent);
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(newNode);
    }
    return new ImmutableTreeModel(newValue, this.fieldPointer, this.treeSchema);
  }

  public deleteNode(nodeId: string | undefined): ImmutableTreeModel {
    if (!nodeId) {
      return this;
    }

    const newValue = this.cloneValue();

    this.walkNodeValues(
      newValue,
      (id: string, node: any, parent: any, index: number) => {
        if (id === nodeId) {
          const nodeList: any[] = parent ? parent.children : newValue;
          nodeList.splice(index, 1);
        }
      }
    );

    return new ImmutableTreeModel(newValue, this.fieldPointer, this.treeSchema);
  }

  private createNode(nodeType: string): any {
    return {
      [this.typeProperty]: nodeType,
      [this.dataProperty]: {},
      [this.childrenProperty]: []
    };
  }

  private cloneValue(): any[] {
    return JSON.parse(JSON.stringify(this.value));
  }

  private getNodeValue(tree: any[], nodeId: string): any {
    let result = null;
    this.walkNodeValues(tree, (id: string, node: any) => {
      if (id === nodeId) {
        result = node;
      }
    });
    return result;
  }

  private walkNodeValues(
    tree: any[],
    walker: (nodeId: string, node: any, parent: any, index: number) => void,
    stack: string[] = [],
    parent: any = null
  ): void {
    for (let i = 0; i < tree.length; i++) {
      const node: any = tree[i];
      const nodeIdStack = stack.concat(`${i}`);
      const nodeId = nodeIdStack.join("/");

      walker(nodeId, node, parent, i);

      if (node.children) {
        this.walkNodeValues(node.children, walker, nodeIdStack, node);
      }
    }
  }
}
