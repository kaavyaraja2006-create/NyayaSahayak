import { useSearchParams } from 'react-router-dom';
import { EvidenceGraph } from '../components/domain/EvidenceGraph';
import { PageHeader } from '../components/ui/PageHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Graph() {
  useDocumentTitle('Evidence graph');
  const [sp] = useSearchParams();
  const focus = sp.get('focus') ?? undefined;
  return (
    <div className="mx-auto flex min-h-[760px] max-w-[1700px] flex-col lg:h-[calc(100vh-8.5rem)] lg:min-h-[560px]">
      <PageHeader
        className="mb-3"
        eyebrow="Analysis"
        title="Evidence graph"
        description="Claims, the evidence linked to them, their source documents and candidate authorities. Select any node or line to inspect it and see what it connects to."
      />
      <div className="min-h-0 flex-1">
        <EvidenceGraph focus={focus} />
      </div>
    </div>
  );
}
