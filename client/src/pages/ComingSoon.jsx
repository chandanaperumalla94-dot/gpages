import React from 'react';

export default function ComingSoon({ title = 'This page' }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">{title} is on its way</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink/55">
        This part of Google Pages is being built in the next development phase.
      </p>
    </div>
  );
}
