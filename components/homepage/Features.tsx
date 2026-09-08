import Image from "next/image";

const JOB_SEARCH_FEATURES = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. SkillsFit browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const MATCHING_FEATURES = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
    highlight: false,
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. SkillsFit scores every role against your actual skills so you focus on the ones that matter.",
    highlight: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
    highlight: false,
  },
];

export function Features() {
  return (
    <>
      <section className="max-w-[1440px] mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary max-w-sm">
            Manage Your Job Search With Ease
          </h2>
          <div className="mt-10 border-l-2 border-accent pl-6 space-y-8">
            {JOB_SEARCH_FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className="text-base font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm">
          <Image
            src="/images/jobs-lists.png"
            alt="SkillsFit matched jobs list"
            width={2364}
            height={1778}
            className="w-full h-auto rounded-xl"
          />
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm order-2 md:order-1">
          <Image
            src="/images/agnet-log.png"
            alt="SkillsFit agent activity log"
            width={2144}
            height={1656}
            className="w-full h-auto rounded-xl"
          />
        </div>

        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold text-text-primary max-w-sm">
            Apply With More Confidence, Every Time
          </h2>
          <div className="mt-10 space-y-8">
            {MATCHING_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={
                  feature.highlight
                    ? "border-l-2 border-accent pl-4"
                    : "pl-4 border-l-2 border-transparent"
                }
              >
                <h3 className="text-base font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
