type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => {
  return (
    <div className="space-y-3">
      {eyebrow ? <p className="label text-[0.65rem]">{eyebrow}</p> : null}
      <div>
        <h1 className="text-4xl font-semibold text-zinc-100">{title}</h1>
        {description ? (
          <p className="mt-2 text-base text-zinc-400">{description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default PageHeader;
