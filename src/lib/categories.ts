import { prisma } from './prisma';

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
  children: CategoryNode[];
};

/**
 * Fetch ALL categories in one query and assemble them into a nested tree.
 * More efficient than recursive DB calls.
 */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const flat = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  }).catch(() => []);

  const byId = new Map<string, CategoryNode>();
  for (const c of flat) {
    byId.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      isVisible: c.isVisible,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Full tree including hidden categories — for admin UI */
export async function getAdminCategoryTree() {
  const flat = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  type AdminNode = Omit<CategoryNode, 'children'> & { productCount: number; children: AdminNode[] };

  const byId = new Map<string, AdminNode>();
  for (const c of flat) {
    byId.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      isVisible: c.isVisible,
      children: [],
      productCount: c._count.products,
    });
  }

  const roots: AdminNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Collect all descendant category IDs (inclusive) — used by category page to fetch products under an entire subtree */
export function collectDescendantIds(node: CategoryNode): string[] {
  const ids = [node.id];
  for (const child of node.children) ids.push(...collectDescendantIds(child));
  return ids;
}

/** Find a node in a tree by slug */
export function findBySlug(roots: CategoryNode[], slug: string): CategoryNode | null {
  for (const root of roots) {
    if (root.slug === slug) return root;
    const inChild = findBySlug(root.children, slug);
    if (inChild) return inChild;
  }
  return null;
}

/** Breadcrumb trail: find path from a root to the matching slug */
export function getBreadcrumb(roots: CategoryNode[], slug: string): CategoryNode[] {
  function walk(node: CategoryNode, trail: CategoryNode[]): CategoryNode[] | null {
    const next = [...trail, node];
    if (node.slug === slug) return next;
    for (const child of node.children) {
      const found = walk(child, next);
      if (found) return found;
    }
    return null;
  }
  for (const root of roots) {
    const found = walk(root, []);
    if (found) return found;
  }
  return [];
}

/** Depth of a node in the tree (0 for roots) */
export function getDepth(roots: CategoryNode[], id: string, currentDepth = 0): number {
  for (const root of roots) {
    if (root.id === id) return currentDepth;
    const d = getDepth(root.children, id, currentDepth + 1);
    if (d >= 0) return d;
  }
  return -1;
}

/**
 * Flatten the tree into a list with full-path display labels,
 * for use in admin dropdowns. E.g. "Servers → Rack Servers → 1U Rack Servers"
 */
export async function getCategoryOptions(): Promise<{ id: string; label: string; depth: number }[]> {
  const flat = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  const byId = new Map(flat.map((c) => [c.id, c]));

  function labelFor(id: string): string {
    const node = byId.get(id);
    if (!node) return '';
    if (!node.parentId) return node.name;
    return `${labelFor(node.parentId)} → ${node.name}`;
  }

  function depthFor(id: string): number {
    const node = byId.get(id);
    if (!node?.parentId) return 0;
    return 1 + depthFor(node.parentId);
  }

  return flat.map((c) => ({ id: c.id, label: labelFor(c.id), depth: depthFor(c.id) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
