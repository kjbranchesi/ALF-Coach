import React from 'react';
import { ArrowDown, ArrowUp, Boxes, CheckCircle2, Flag } from 'lucide-react';

type SectionKey = 'milestones' | 'artifacts' | 'criteria';

type DeliverablesPreviewCardProps = {
  milestones: string[];
  artifacts: string[];
  criteria: string[];
  onAcceptAll(): void;
  onCustomize(section: 'milestones' | 'artifacts'): void;
  onRegenerate(): void;
  onRename(section: SectionKey, index: number, name: string): void;
  onReorder(section: SectionKey, from: number, to: number): void;
  hideFooter?: boolean;
};

const sectionMeta: Record<SectionKey, { title: string; icon: React.ReactNode; tone: string }> = {
  milestones: {
    title: 'Milestones',
    icon: <Flag className="w-4 h-4" />,
    tone: 'from-amber-400 to-amber-500'
  },
  artifacts: {
    title: 'Final Artifacts',
    icon: <Boxes className="w-4 h-4" />,
    tone: 'from-blue-400 to-blue-500'
  },
  criteria: {
    title: 'Assessment Criteria',
    icon: <CheckCircle2 className="w-4 h-4" />,
    tone: 'from-emerald-400 to-emerald-500'
  }
};

export function DeliverablesPreviewCard({
  milestones,
  artifacts,
  criteria,
  onAcceptAll,
  onCustomize,
  onRegenerate,
  onRename,
  onReorder,
  hideFooter = false
}: DeliverablesPreviewCardProps) {
  const sections: Array<{ key: SectionKey; items: string[] }> = [
    { key: 'milestones', items: milestones },
    { key: 'artifacts', items: artifacts },
    { key: 'criteria', items: criteria }
  ];

  const handleRename = (section: SectionKey, index: number, current: string) => {
    const next = window.prompt(`Rename ${sectionMeta[section].title.slice(0, -1)}`, current);
    if (next && next.trim() && next.trim() !== current) {
      onRename(section, index, next.trim());
    }
  };

  const handleReorder = (section: SectionKey, index: number, direction: -1 | 1, length: number) => {
    const target = index + direction;
    if (target < 0 || target >= length) {return;}
    onReorder(section, index, target);
  };

  return (
    <section className="rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/80 shadow-lg px-4 py-4 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary-600 dark:text-primary-300">Deliverables package</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Milestones, artifacts, and rubric ready</h2>
          <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-1">Review each section, tweak if needed, then accept or regenerate.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ key, items }) => (
          <div key={key} className="rounded-2xl border border-gray-200/60 dark:border-gray-800/70 bg-white/90 dark:bg-gray-900/60">
            <div className={`flex items-center justify-between gap-2 px-3 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 bg-gradient-to-r ${sectionMeta[key].tone} text-white rounded-t-2xl`}
            >
              <span className="inline-flex items-center gap-2">
                {sectionMeta[key].icon}
                {sectionMeta[key].title}
              </span>
              <span className="text-xs font-semibold">{items.length}</span>
            </div>
            <ul className="px-3 py-3 space-y-2">
              {items.map((item, index) => (
                <li key={`${key}-${index}`} className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/50 px-3 py-2 text-[12px] text-gray-700 dark:text-gray-200 flex items-start justify-between gap-2">
                  <span className="flex-1 leading-snug">{item}</span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(key, index, -1, items.length)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(key, index, 1, items.length)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                      disabled={index === items.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRename(key, index, item)}
                    className="self-center h-6 px-2 rounded-full border border-gray-200 text-[10px] font-semibold text-gray-600 hover:text-gray-900 hover:border-gray-400"
                  >
                    Rename
                  </button>
                </li>
              ))}
            </ul>
            {key !== 'criteria' ? (
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => onCustomize(key)}
                  className="w-full text-[12px] font-semibold text-primary-600 hover:text-primary-700"
                >
                  Customize {sectionMeta[key].title.toLowerCase()}
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {hideFooter ? null : (
        <footer className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAcceptAll}
            className="inline-flex items-center rounded-full bg-primary-600 text-white px-4 py-1.5 text-[12px] font-semibold hover:bg-primary-700"
          >
            Yes, use all of these
          </button>
          <button
            type="button"
            onClick={() => onCustomize('milestones')}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
          >
            Customize milestones
          </button>
          <button
            type="button"
            onClick={() => onCustomize('artifacts')}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
          >
            Customize artifacts
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
          >
            Regenerate
          </button>
        </footer>
      )}
    </section>
  );
}
