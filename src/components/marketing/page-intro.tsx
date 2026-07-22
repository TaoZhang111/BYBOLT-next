import { Container } from "@/components/ui/container";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <main className="flex-1">
      <section className="border-b border-line bg-surface py-20 sm:py-28">
        <Container>
          <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.035em] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{description}</p>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <div className="grid gap-px border border-line bg-line md:grid-cols-3">
            {["CMS content", "Technical data", "Lead generation"].map((label, index) => (
              <div className="min-h-44 bg-background p-7" key={label}>
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
                <h2 className="mt-12 text-lg font-semibold">{label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Structure reserved for the next content and design phase.
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
