import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '../store/uiStore';
import { useEffectiveTheme } from './useEffectiveTheme';

const REDUCE_MQ = '(prefers-reduced-motion: reduce)';

/** Writes theme, density and motion preferences onto <html>. Mount once at the app root. */
export function useApplyPreferences(): void {
  const { effective } = useEffectiveTheme();
  const density = useUiStore((s) => s.density);
  const reduceMotion = useUiStore((s) => s.reduceMotion);
  const [osReduce, setOsReduce] = useState<boolean>(() => window.matchMedia(REDUCE_MQ).matches);
  const first = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_MQ);
    const onChange = (e: MediaQueryListEvent): void => setOsReduce(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const animate = !first.current && !reduceMotion && !osReduce;
    if (animate) root.classList.add('theme-fade');
    root.setAttribute('data-theme', effective);
    first.current = false;
    if (!animate) return undefined;
    const id = window.setTimeout(() => root.classList.remove('theme-fade'), 320);
    return () => window.clearTimeout(id);
  }, [effective, reduceMotion, osReduce]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion || osReduce) root.setAttribute('data-motion', 'reduced');
    else root.removeAttribute('data-motion');
  }, [reduceMotion, osReduce]);
}
