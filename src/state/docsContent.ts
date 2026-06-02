export interface DocArticle {
  content: string;
  subpath: string;
  title: string;
}

export interface DocNavNode {
  children: DocNavNode[];
  depth: number;
  item?: { subpath: string; title: string };
  key: string;
  title: string;
  type: "folder" | "doc";
}

const docs: DocArticle[] = [
  {
    subpath: "start_here",
    title: "Start Here",
    content: `# Start Here

Forge Signal is a runtime for UI state that needs to stay coordinated across signals, resources, forms, routes, optimistic writes, diagnostics, and history.

The landing demos are intentionally small, but each one shows the same idea: instead of wiring another adapter layer between libraries, declare the runtime surface and inspect what happened afterward.

\`\`\`ts
import { createSignals } from "forge-signal-wasm";

const signals = await createSignals({
  deployment: "mainThreadCompatibility",
});
\`\`\`
`,
  },
  {
    subpath: "learn/feature-index",
    title: "Feature Index",
    content: `# Feature Index

Forge starts with retained signals and builds upward into product surfaces.

- Signals propagate source changes into computed/output values.
- Resource lines expose value, status, freshness, diagnostics, and history.
- Forms make dirty state, validation, readiness, and submit posture runtime truth.
- Routes own admission, role-sensitive outcomes, and replayable session history.
- Optimistic resource writes expose lifecycle and rollback facts instead of hiding them in callbacks.

\`\`\`ts
const title = signals.input("New launch plan");
const slug = signals.computed("slug", () =>
  title.read().toLowerCase().replace(/\\s+/g, "-"),
);
\`\`\`
`,
  },
  {
    subpath: "resources/index",
    title: "Resources",
    content: `# Resources

A resource line is a read surface with runtime-owned lifecycle. You can inspect the current value, settlement status, freshness, diagnostics, and history from the line instead of recreating those facts in component state.

\`\`\`ts
const products = api
  .url("/products")
  .response(signals.resource.response.array<Product>()({ id: "id" }))
  .list({ load });

const catalog = products.line({});
catalog.summary();
catalog.diagnostics().lastEffect;
catalog.history().entries();
\`\`\`
`,
  },
  {
    subpath: "resources/branch-native-effects",
    title: "Branch Native Effects",
    content: `# Branch Native Effects

Optimistic writes use resource effect policy instead of feature-local rollback folklore.

\`\`\`ts
const api = signals.api({
  baseUrl: "/api",
  effects: signals.resource.effects.branchNative(),
});

const items = api
  .url("/items")
  .response(signals.resource.response.array<Item>()({ id: "id" }))
  .list({ load });

const line = items.line({});
await line.patch((current) => [...current, optimisticItem]);

line.diagnostics().lastEffect;
await line.history().rollbackLastEffect();
\`\`\`
`,
  },
  {
    subpath: "resources/detail-response-lanes",
    title: "Detail Response Lanes",
    content: `# Detail Response Lanes

For ordinary top-level object fields, prefer the response-owned detail lane. It keeps the field declarations close to the response shape and composes with resource reconciliation.

\`\`\`ts
const task = signals
  .api({})
  .url("/tasks/:taskId")
  .response(signals.resource.response.detail<Task>()({
    status: "status",
    title: "title",
  }))
  .detail({ load });
\`\`\`

Use \`detailFields(...)\` when reads or writes need custom reconstruction, and use \`detailRegions(...)\` or \`detailJsonPaths(...)\` for structured nested updates.
`,
  },
  {
    subpath: "forms/index",
    title: "Forms",
    content: `# Forms

Forge forms keep draft state, validation, dirty state, readiness, and submission posture in one controller.

\`\`\`ts
const rolloutForm = signals.form({
  initialValue,
  validators: useRolloutValidators(),
  submit: saveRollout,
});

rolloutForm.status();
rolloutForm.canSubmit();
rolloutForm.submit();
\`\`\`
`,
  },
  {
    subpath: "forms/route-coupling",
    title: "Route Coupling",
    content: `# Route Coupling

Forms get more useful when they sit inside route and resource context. The important part is not another helper library; it is removing the adapter code that maps route params, loader state, validation, submit status, and post-submit resource updates by hand.

\`\`\`ts
const route = app.route("/products/:productId/pricing", {
  resource: productDetail,
  form: pricingForm,
});
\`\`\`
`,
  },
  {
    subpath: "router/index",
    title: "Router",
    content: `# Router

Forge routes model navigation as runtime state, not just URL matching.

\`\`\`ts
const router = signals.router({
  routes: {
    "/admin": {
      beforeLoad: requireAdmin,
      load: loadAdminDashboard,
    },
  },
});

router.history();
router.replay({ role: "admin" });
\`\`\`
`,
  },
  {
    subpath: "composition/index",
    title: "Composition",
    content: `# Composition

The composition story is about removing adapter glue. React, TanStack Query, Formik, and routers are useful tools; the tax is the status mapping, error mapping, invalidation mapping, rollback bookkeeping, and lifecycle stitching between them.

\`\`\`ts
const checkout = app.route("/checkout", {
  resource: cart,
  form: checkoutForm,
  submit: placeOrder,
});

checkout.status();
checkout.diagnostics();
\`\`\`
`,
  },
];

const folderTitles: Record<string, string> = {
  composition: "Composition",
  forms: "Forms",
  learn: "Learn",
  resources: "Resources",
  router: "Router",
};

type InternalNavNode = DocNavNode & { childrenMap: Map<string, InternalNavNode> };

function titleFromSlug(slug: string) {
  return (folderTitles[slug] ?? slug)
    .replace(/^index$/i, "Overview")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortTree(nodes: DocNavNode[]): DocNavNode[] {
  return nodes
    .map((node) => ({ ...node, children: sortTree(node.children) }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

function buildNavigation() {
  const roots = new Map<string, InternalNavNode>();
  const folders = new Map<string, InternalNavNode>();
  const ensureFolder = (segments: string[]): InternalNavNode => {
    const key = segments.join("/");
    const existing = folders.get(key);
    if (existing) return existing;
    const node: InternalNavNode = {
      children: [],
      childrenMap: new Map<string, InternalNavNode>(),
      depth: segments.length - 1,
      key,
      title: titleFromSlug(segments[segments.length - 1] ?? key),
      type: "folder",
    };
    folders.set(key, node);
    if (segments.length === 1) {
      roots.set(key, node);
    } else {
      ensureFolder(segments.slice(0, -1)).childrenMap.set(key, node);
    }
    return node;
  };

  for (const article of docs) {
    const segments = article.subpath.split("/");
    const docNode: InternalNavNode = {
      children: [],
      childrenMap: new Map<string, InternalNavNode>(),
      depth: segments.length - 1,
      item: { subpath: article.subpath, title: article.title },
      key: article.subpath,
      title: article.title,
      type: "doc",
    };
    if (segments.length === 1) {
      roots.set(article.subpath, docNode);
    } else {
      ensureFolder(segments.slice(0, -1)).childrenMap.set(article.subpath, docNode);
    }
  }

  const materialize = (node: InternalNavNode): DocNavNode => ({
    children: sortTree(Array.from(node.childrenMap.values()).map(materialize)),
    depth: node.depth,
    item: node.item,
    key: node.key,
    title: node.title,
    type: node.type,
  });

  const order = ["start_here", "learn", "resources", "forms", "router", "composition"];
  return sortTree(Array.from(roots.values()).map(materialize)).sort(
    (left, right) => order.indexOf(left.key) - order.indexOf(right.key),
  );
}

export function getDocArticle(subpath: string): DocArticle | null {
  const normalized = subpath.replace(/\.md$/, "");
  return docs.find((article) => article.subpath === normalized) ?? null;
}

export function getAllSubpaths(): string[] {
  return docs.map((article) => article.subpath);
}

export const docsNavigation: DocNavNode[] = buildNavigation();
