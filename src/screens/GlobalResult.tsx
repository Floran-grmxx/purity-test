import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuiz } from "../state/QuizContext";
import { categories } from "../data/categories";
import { scoreAll } from "../lib/scoring";
import { encodeResult, type ScoreMap } from "../lib/share";
import { Page } from "../components/Page";
import { Button } from "../components/Button";
import { ScoreRing } from "../components/ScoreRing";
import { CategoryBar } from "../components/CategoryBar";
import { SharePanel } from "../components/SharePanel";
import { buildPortrait } from "../lib/portrait";

export function GlobalResult() {
  const { answers, resetAll } = useQuiz();
  const result = scoreAll(answers);
  const [sharing, setSharing] = useState(false);

  if (!result.allCompleted) return <Navigate to="/hub" replace />;

  const scoreById = Object.fromEntries(
    result.perCategory.map((r) => [r.id, r.score]),
  );

  const shareUrl = `${window.location.origin}${window.location.pathname}#/partage?d=${encodeResult(
    scoreById as ScoreMap,
  )}`;
  const portrait = buildPortrait(scoreById as ScoreMap, answers);
  const shareText = `Mon Purity Test : ${result.total}/${result.maxTotal} — ${result.profile?.title}. Et toi ?`;

  return (
    <Page>
      <header className="mb-2">
        <Link to="/hub" className="text-sm text-[var(--color-muted)]">
          ‹ Tests
        </Link>
      </header>

      <div className="flex flex-col items-center text-center animate-pop-in">
        <div className="my-6">
          <ScoreRing
            value={result.total}
            max={result.maxTotal}
            color="#ef4444"
            caption="score global"
          />
        </div>

        {result.profile && (
          <>
            <h1 className="text-3xl font-black tracking-tight">
              {result.profile.title}
            </h1>
            <p className="mt-2 max-w-xs text-[var(--color-muted)]">
              {result.profile.blurb}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        {categories.map((c) => (
          <CategoryBar
            key={c.id}
            label={c.label}
            emoji={c.emoji}
            color={c.color}
            score={scoreById[c.id] ?? 0}
          />
        ))}
      </div>

      <section className="mt-6 space-y-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[0.95rem] leading-relaxed">
        <h2 className="text-lg font-bold">Ton portrait</h2>
        {portrait.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <div className="mt-8 space-y-3">
        <Button onClick={() => setSharing(true)} full>
          Partager mon résultat
        </Button>
        <Button
          variant="outline"
          full
          onClick={() => {
            if (confirm("Effacer toutes tes réponses et recommencer ?"))
              resetAll();
          }}
        >
          Recommencer
        </Button>
      </div>

      {sharing && (
        <SharePanel url={shareUrl} text={shareText} onClose={() => setSharing(false)} />
      )}
    </Page>
  );
}
