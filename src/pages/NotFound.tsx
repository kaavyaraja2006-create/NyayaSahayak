import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EmptyState } from '../components/ui/EmptyState';
import { DEFAULT_CASE_ID, paths } from '../utils/routes';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto max-w-lg pt-10">
      <EmptyState
        title="Page not found"
        body="The page you are looking for does not exist or has moved."
        action={<Link to={paths.overview(DEFAULT_CASE_ID)} className="btn btn-primary">Go to case overview</Link>}
      />
    </div>
  );
}
