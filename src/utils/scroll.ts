export function resetScrollToTop() {
  if (typeof window !== 'undefined') {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  if (typeof document !== 'undefined') {
    const scrollableElements = document.querySelectorAll(
      '#applet-content-viewport, #customer-shop-container, #categories-content-panel, #categories-sidebar, #admin-main-content, #vendor-main-content, .overflow-y-auto, .overflow-auto, .overflow-y-scroll'
    );
    scrollableElements.forEach((el) => {
      el.scrollTop = 0;
    });
  }
}
