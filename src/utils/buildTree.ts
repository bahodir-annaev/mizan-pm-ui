import type { Task, TreeTask } from '@/types/domain';

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
