type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
}

const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => {
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{eyebrow}</p>
      ) : null}
      <div>
        <h1 className="text-4xl font-semibold text-white">{title}</h1>
        {description ? <p className="mt-2 text-base text-slate-300">{description}</p> : null}
      </div>
    </div>
  )
}

export default PageHeader
