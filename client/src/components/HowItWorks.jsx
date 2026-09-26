import React from 'react';

const STEPS = [
  {
    n: '1',
    label: 'START HERE',
    title: 'Choose your location',
    icon: <><circle cx="12" cy="10" r="3" /><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /></>,
    text: 'Pick your state, district and city — or let us detect it — to see what\u2019s actually near you.',
  },
  {
    n: '2',
    label: 'NARROW IT DOWN',
    title: 'Pick a category',
    icon: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    text: 'Schools, hospitals, restaurants, salons — browse by what you need, filtered to your area.',
  },
  {
    n: '3',
    label: 'MAKE A MOVE',
    title: 'Connect with confidence',
    icon: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    text: 'Every listing is verified before it goes live. Read real reviews, call, or get directions in one tap.',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-line bg-[#071d33] py-16 text-paper sm:py-20">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Simple by design</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How Google Pages works
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-paper/60 sm:text-base">
              From a question to the right local place in three clear steps.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-100 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
            Your local guide
          </div>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((step) => (
            <div key={step.n} className="group relative rounded-2xl border border-white/10 bg-white/[0.07] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.11] sm:p-6">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-[#071d33] shadow-lg shadow-cyan-950/30 transition group-hover:rotate-6 group-hover:bg-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">{step.icon}</svg>
                </div>
                <span className="font-display text-4xl font-bold text-white/15">{step.n}</span>
              </div>
              <p className="mt-7 text-[10px] font-bold tracking-[0.16em] text-cyan-200">{step.label}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
