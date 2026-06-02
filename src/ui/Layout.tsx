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

export function Layout({
  currentRoute,
  onNavigate,
  children,
}: LayoutProps) {
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
                onNavigate(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

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
