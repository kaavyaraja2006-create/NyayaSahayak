import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/Toaster';
import { useApplyPreferences } from './hooks/useApplyPreferences';
import { useUiStore } from './store/uiStore';

export default function App() {
  useApplyPreferences();
  const reduceMotion = useUiStore((s) => s.reduceMotion);
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </MotionConfig>
  );
}
