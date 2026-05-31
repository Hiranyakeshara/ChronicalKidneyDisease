import RiskPredictor from "@/components/RiskPredictor";

const modelFacts = [
  "Predicts non-potable / risky water probability",
  "Maps probability into Low, Moderate, or High risk",
  "Adds anomaly detection for unusual water profiles",
  "Assigns a water-quality profile cluster for comparison"
];

const userGroups = [
  {
    title: "For patients and families",
    text: "Enter water-quality lab results and get a clear screening output with simple next-step guidance."
  },
  {
    title: "For community workers",
    text: "Use the tool as a quick decision-support aid before requesting formal laboratory confirmation."
  },
  {
    title: "For researchers",
    text: "The interface is connected to the trained CKDu water-risk model package for demo and extension work."
  }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-river text-lg font-black text-white shadow-soft">
            W
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-river">CKDu Support</p>
            <h1 className="text-lg font-bold text-ink">Water Risk Screening</h1>
          </div>
        </div>
        <a
          href="#screening"
          className="hidden rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-river sm:inline-flex"
        >
          Try the model
        </a>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-river shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-river" />
            Model-integrated community screening website
          </div>
          <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Early water-quality risk guidance for CKDu-affected communities.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            This website connects a trained machine-learning model with a public-facing interface. Users can enter water-quality test values and receive a non-clinical risk screening result, warning level, anomaly status, and practical recommendation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#screening"
              className="rounded-full bg-river px-6 py-4 text-center text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-teal-700"
            >
              Start water screening
            </a>
            <a
              href="#about"
              className="rounded-full border border-slate-200 bg-white/90 px-6 py-4 text-center text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-river"
            >
              Learn how it works
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-200 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-river to-aqua p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">System output</p>
              <h3 className="mt-4 text-3xl font-black">Risk Level + Recommendation</h3>
              <p className="mt-3 text-sm leading-6 text-cyan-50">
                The model estimates water profile risk from nine water-quality indicators, then explains the result using clear community-friendly labels.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-2xl font-black">9</p>
                  <p className="text-xs text-cyan-50">Input features</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-2xl font-black">3</p>
                  <p className="text-xs text-cyan-50">Risk levels</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-2xl font-black">ML</p>
                  <p className="text-xs text-cyan-50">Integrated</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {modelFacts.map((fact) => (
                <div key={fact} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-black text-river">✓</span>
                  <span className="text-sm font-semibold text-slate-700">{fact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-river">About the site</p>
              <h2 className="mt-3 text-3xl font-black text-ink">Built for simple, responsible water-risk awareness.</h2>
              <p className="mt-4 leading-7 text-slate-600">
                This system is an environmental screening tool. It does not diagnose CKDu or replace laboratory, medical, or public-health decisions. It helps users understand whether a water-quality profile looks safer, moderately risky, or high-risk according to the trained model.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {userGroups.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-black text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="screening" className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <RiskPredictor />
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 pb-10 pt-2 text-sm text-slate-500 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <strong className="text-ink">Important:</strong> Use this result only as early environmental decision support. Confirm risky water profiles through certified laboratory testing and follow official public-health guidance.
        </div>
      </footer>
    </main>
  );
}
