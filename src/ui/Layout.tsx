import { useEffect, useState } from "react";
import { docsNavigation, type DocNavNode } from "../state/docsContent";
import type { RouteState } from "./router";

interface LayoutProps {
  currentRoute: RouteState;
  onNavigate: (path: string) => void;
  children: any;
}

const navItems = [
  { href: "#/", label: "Home", match: (route: RouteState) => route.type === "landing" },
  { href: "#/docs", label: "Docs", match: (route: RouteState) => route.type === "docs" },
];

function nodeContains(node: DocNavNode, activeSubpath: string): boolean {
  return node.item?.subpath === activeSubpath || node.children.some((child) => nodeContains(child, activeSubpath));
}

function DocsOverlayNode({
  node,
  onNavigate,
  onSelect,
  openNodes,
  setOpenNodes,
  activeSubpath,
}: {
  node: DocNavNode;
  onNavigate: (path: string) => void;
  onSelect: () => void;
  openNodes: Record<string, boolean>;
  setOpenNodes: (updater: (state: Record<string, boolean>) => Record<string, boolean>) => void;
  activeSubpath: string;
}) {
  const open = openNodes[node.key] ?? nodeContains(node, activeSubpath);

  if (node.type === "doc") {
    return (
      <a
        className={node.item?.subpath === activeSubpath ? "active" : ""}
        href={`#/docs/${node.item?.subpath}`}
        onClick={(event) => {
          event.preventDefault();
          if (!node.item) return;
          onNavigate(`#/docs/${node.item.subpath}`);
          onSelect();
        }}
        style={{ "--depth": node.depth } as any}
      >
        {node.title}
      </a>
    );
  }

  return (
    <section className="mobile-docs-folder">
      <button
        aria-expanded={open}
        className="mobile-docs-folder-toggle"
        onClick={() => setOpenNodes((state) => ({ ...state, [node.key]: !open }))}
        style={{ "--depth": node.depth } as any}
        type="button"
      >
        <span>{node.title}</span>
        <span aria-hidden="true">{open ? "-" : "+"}</span>
      </button>
      {open ? (
        <div className="mobile-docs-items">
          {node.children.map((child) => (
            <DocsOverlayNode
              key={child.key}
              node={child}
              onNavigate={onNavigate}
              onSelect={onSelect}
              openNodes={openNodes}
              setOpenNodes={setOpenNodes}
              activeSubpath={activeSubpath}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function Layout({
  currentRoute,
  onNavigate,
  children,
}: LayoutProps) {
  const [docsMenuOpen, setDocsMenuOpen] = useState(false);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const activeDocsSubpath = currentRoute.type === "docs" ? currentRoute.subpath : "";

  useEffect(() => {
    const openActive = (nodes: DocNavNode[], state: Record<string, boolean>) => {
      for (const node of nodes) {
        if (activeDocsSubpath && nodeContains(node, activeDocsSubpath)) state[node.key] = true;
        openActive(node.children, state);
      }
    };

    setOpenNodes((state) => {
      const next = { ...state };
      openActive(docsNavigation, next);
      return next;
    });
  }, [activeDocsSubpath]);

  useEffect(() => {
    if (!docsMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [docsMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const closeOnDesktop = () => {
      if (!media.matches) setDocsMenuOpen(false);
    };
    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="site-shell">
      <header className="nav-bar">
        <button className="brand brand-button" onClick={() => onNavigate("#/")} type="button">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-wordmark">Forge</span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link ${item.match(currentRoute) ? "active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                if (item.label === "Docs" && window.matchMedia("(max-width: 720px)").matches) {
                  setDocsMenuOpen(true);
                  return;
                }
                setDocsMenuOpen(false);
                onNavigate(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {docsMenuOpen ? (
        <div className="mobile-docs-overlay" role="dialog" aria-modal="true" aria-label="Documentation menu">
          <div className="mobile-docs-overlay-head">
            <span>Docs</span>
            <button onClick={() => setDocsMenuOpen(false)} type="button">Close</button>
          </div>
          <nav className="mobile-docs-overlay-nav" aria-label="Documentation">
            {docsNavigation.map((node) => (
              <DocsOverlayNode
                key={node.key}
                node={node}
                onNavigate={onNavigate}
                onSelect={() => setDocsMenuOpen(false)}
                openNodes={openNodes}
                setOpenNodes={setOpenNodes}
                activeSubpath={activeDocsSubpath}
              />
            ))}
          </nav>
        </div>
      ) : null}

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="container site-footer-grid">
          <span className="site-footer-copy">© 2026 Forge Signal</span>
          <div className="site-footer-links">
            <a href="#/" onClick={(event) => { event.preventDefault(); onNavigate("#/"); }}>
              Home
            </a>
            <a href="#/docs" onClick={(event) => { event.preventDefault(); onNavigate("#/docs"); }}>
              Docs
            </a>
            <a href="https://github.com/recnepspencer/forge-signal-demo" rel="noreferrer" target="_blank">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/forge-signal-wasm" rel="noreferrer" target="_blank">
              npm
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
