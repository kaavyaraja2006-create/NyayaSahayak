import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../components/shell/AppShell';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ErrorState } from '../components/ui/ErrorState';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useCaseStore } from '../store/caseStore';
import { DEFAULT_CASE_ID } from '../utils/routes';

/** Wraps every in-app route: loads the case for /cases/:caseId/* and renders loading / error states. */
export default function ShellLayout() {
  const { pathname } = useLocation();
  const match = /^\/cases\/([^/]+)/.exec(pathname);
  const routeCaseId = match ? decodeURIComponent(match[1]) : null;
  const targetId = routeCaseId ?? DEFAULT_CASE_ID;
  const load = useCaseStore((s) => s.load);
  const status = useCaseStore((s) => s.status);
  const loadedId = useCaseStore((s) => s.caseId);

  useEffect(() => {
    void load(targetId);
  }, [targetId, load]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const needsCase = routeCaseId !== null;
  const ready = status === 'ready' && loadedId === targetId;
  const failed = status === 'error' && loadedId === targetId;

  let content;
  if (needsCase && failed) {
    content = (
      <ErrorState
        onRetry={() => void load(targetId, true)}
        action={
          <Link to="/cases" className="btn btn-secondary">
            Back to cases
          </Link>
        }
      />
    );
  } else if (needsCase && !ready) {
    content = <PageSkeleton />;
  } else {
    content = (
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={<PageSkeleton />}>
          <motion.div key={pathname} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <Outlet />
          </motion.div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return <AppShell caseId={targetId}>{content}</AppShell>;
}
