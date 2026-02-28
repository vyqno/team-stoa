import { Suspense, lazy } from 'react';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center" role="status">
          <span className="loader" aria-label="Loading 3D scene" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
