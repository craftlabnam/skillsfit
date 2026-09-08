import Image from "next/image";

export function Testimonial() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">
          Success Stories
        </p>
        <p className="mt-4 text-2xl font-medium text-text-primary leading-snug">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open
          my dashboard to see interviews waiting. It feels like cheating. Had
          3 offers on the table simultaneously.&rdquo;
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Tom Wilson"
            width={192}
            height={192}
            className="size-10 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">
              Tom Wilson
            </p>
            <p className="text-xs text-text-muted">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
