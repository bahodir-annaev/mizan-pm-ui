import type { Task, TreeTask } from '@/types/domain';

export interface FlatTreeNode {
  task: TreeTask;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLastSibling: boolean;
  /** For each ancestor level: is that ancestor the last sibling in its group? */
  ancestorIsLastSibling: boolean[];
  /** ID of the root ancestor task */
  rootId: string;
}

export function flattenVisibleTree(
  nodes: TreeTask[],
  expandedIds: Set<string>,
  depth = 0,
  ancestorFlags: boolean[] = [],
  rootId?: string,
): FlatTreeNode[] {
  const result: FlatTreeNode[] = [];
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    const hasChildren = node.children.length > 0;
    const effectiveRootId = rootId ?? node.id;
    result.push({
      task: node,
      depth,
      hasChildren,
      isExpanded: expandedIds.has(node.id),
      isLastSibling: isLast,
      ancestorIsLastSibling: ancestorFlags,
      rootId: effectiveRootId,
    });
    if (hasChildren && expandedIds.has(node.id)) {
      result.push(
        ...flattenVisibleTree(node.children, expandedIds, depth + 1, [...ancestorFlags, isLast], effectiveRootId),
      );
    }
  });
  return result;
}

/**
 * Converts a flat array of tasks (each carrying parentId) into a nested tree.
 * Tasks whose parentId is null/undefined, or whose parent is not in the array,
 * are treated as roots.
 */
export function buildTree(tasks: Task[]): TreeTask[] {
  const map = new Map<string, TreeTask>();

  for (const task of tasks) {
    map.set(task.id, { ...task, children: [] });
  }

  const roots: TreeTask[] = [];

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by position, fall back to insertion order
  for (const node of map.values()) {
    node.children.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  // Sort roots by position as well
  roots.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return roots;
}
