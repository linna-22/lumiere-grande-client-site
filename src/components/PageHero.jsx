export default function PageHero({ eyebrow, title, description, image, children }) {
  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-slate-900 pb-16 pt-40">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          {eyebrow}
        </p>
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
