/**
 * IDs are sorted Preorder.
 * Root: 0
 *  Child1: 1
 *    Child11: 2
 *    Child12: 3
 *  Child2: 4
 */
export interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}
