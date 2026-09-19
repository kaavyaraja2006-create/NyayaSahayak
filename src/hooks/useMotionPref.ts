import { useUiStore } from '../store/uiStore';

/** Smooth scrolling is skipped when the user (or OS) prefers reduced motion. */
export function scrollBehavior(): ScrollBehavior {
  const reduced =
    useUiStore.getState().reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? 'auto' : 'smooth';
}
