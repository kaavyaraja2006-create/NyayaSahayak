import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ShellLayout from '../layouts/ShellLayout';
import { PageSkeleton } from '../components/ui/Skeleton';

const Landing = lazy(() => import('../pages/Landing'));
const Cases = lazy(() => import('../pages/Cases'));
const Overview = lazy(() => import('../pages/Overview'));
const Documents = lazy(() => import('../pages/Documents'));
const DocumentDetail = lazy(() => import('../pages/DocumentDetail'));
const Hearing = lazy(() => import('../pages/Hearing'));
const Claims = lazy(() => import('../pages/Claims'));
const ClaimDetail = lazy(() => import('../pages/ClaimDetail'));
const Evidence = lazy(() => import('../pages/Evidence'));
const Timeline = lazy(() => import('../pages/Timeline'));
const Graph = lazy(() => import('../pages/Graph'));
const Authorities = lazy(() => import('../pages/Authorities'));
const Conflicts = lazy(() => import('../pages/Conflicts'));
const Citations = lazy(() => import('../pages/Citations'));
const Review = lazy(() => import('../pages/Review'));
const Audit = lazy(() => import('../pages/Audit'));
const Report = lazy(() => import('../pages/Report'));
const Settings = lazy(() => import('../pages/Settings'));
const Help = lazy(() => import('../pages/Help'));
const NotFound = lazy(() => import('../pages/NotFound'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6"><PageSkeleton /></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ShellLayout />}>
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:caseId" element={<Overview />} />
          <Route path="/cases/:caseId/documents" element={<Documents />} />
          <Route path="/cases/:caseId/documents/:documentId" element={<DocumentDetail />} />
          <Route path="/cases/:caseId/hearing" element={<Hearing />} />
          <Route path="/cases/:caseId/claims" element={<Claims />} />
          <Route path="/cases/:caseId/claims/:claimId" element={<ClaimDetail />} />
          <Route path="/cases/:caseId/evidence" element={<Evidence />} />
          <Route path="/cases/:caseId/timeline" element={<Timeline />} />
          <Route path="/cases/:caseId/graph" element={<Graph />} />
          <Route path="/cases/:caseId/authorities" element={<Authorities />} />
          <Route path="/cases/:caseId/conflicts" element={<Conflicts />} />
          <Route path="/cases/:caseId/citations" element={<Citations />} />
          <Route path="/cases/:caseId/review" element={<Review />} />
          <Route path="/cases/:caseId/audit" element={<Audit />} />
          <Route path="/cases/:caseId/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
