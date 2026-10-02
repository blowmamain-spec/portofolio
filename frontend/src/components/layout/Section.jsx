export default function Section({ id, title, children }) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-20 px-6 py-16">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}
