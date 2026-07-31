/**
 * SkipToContent — visually hidden link that becomes visible on keyboard focus,
 * letting keyboard/screen-reader users jump past the navbar straight to the
 * #main-content landmark. Must be the first focusable element on the page.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to main content
    </a>
  );
}
