import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';

/** Ensures Focus Mode never outlives the page that offered it. */
export function useFocusReset(): void {
  const setFocusMode = useUiStore((s) => s.setFocusMode);
  useEffect(() => () => setFocusMode(false), [setFocusMode]);
}
