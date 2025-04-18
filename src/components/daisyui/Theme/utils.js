export const getThemeFromClosestAncestor = (ref) => {
  if (!ref.current) return;
  const matches = ref.current.closest("[data-theme]");
  if (matches) return matches.getAttribute("data-theme");
};
