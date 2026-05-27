'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const StudioContent = dynamic(() => import('@/components/editor/StudioContent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0b1120] items-center justify-center">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.1s]" />
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
      </div>
    </div>
  ),
});

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] bg-[#0b1120] items-center justify-center">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
          </div>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
