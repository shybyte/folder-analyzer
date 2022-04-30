import * as flatbuffers from 'flatbuffers';
import { TreeNodeFb } from './tree-node-fb';
import { TreeNode } from './tree-node';

export class TreeNodeProxy implements TreeNode {
  private _id?: number;
  private _name?: string;
  private _children?: TreeNodeProxy[];

  constructor(private readonly treeNodeFb: TreeNodeFb) {}

  get id(): number {
    if (!this._id) {
      this._id = this.treeNodeFb.id()!;
    }
    return this._id;
  }

  get name(): string {
    if (!this._name) {
      this._name = this.treeNodeFb.name()!;
    }
    return this._name;
  }

  get children() {
    if (!this.treeNodeFb.isFolder()) {
      return undefined as never;
    }
    if (!this._children) {
      const length = this.treeNodeFb.childrenLength();
      const children = new Array<TreeNodeProxy>(length);
      for (let i = 0; i < length; i++) {
        children[i] = new TreeNodeProxy(this.treeNodeFb.children(i)!);
      }
      this._children = children;
    }
    return this._children;
  }
}

export function convertTreeNodeToFb(treeNode: TreeNode): Uint8Array {
  const builder = new flatbuffers.Builder(1024);

  function convertNodeInternal(treeNode: TreeNode): flatbuffers.Offset {
    const childOffsets = treeNode.children ? treeNode.children.map((child) => convertNodeInternal(child)) : undefined;

    const nameOffset = builder.createString(treeNode.name);
    const childVector = childOffsets ? TreeNodeFb.createChildrenVector(builder, childOffsets) : undefined;

    TreeNodeFb.startTreeNodeFb(builder);
    TreeNodeFb.addId(builder, treeNode.id);
    TreeNodeFb.addName(builder, nameOffset);
    TreeNodeFb.addIsFolder(builder, !!childVector);
    if (childVector) {
      TreeNodeFb.addChildren(builder, childVector);
    }
    return TreeNodeFb.endTreeNodeFb(builder);
  }

  const rootNode = convertNodeInternal(treeNode);

  builder.finish(rootNode);
  return builder.asUint8Array();
}

export function readFlat(data: Uint8Array): TreeNodeFb {
  const buf = new flatbuffers.ByteBuffer(data);
  return TreeNodeFb.getRootAsTreeNodeFb(buf);
}
