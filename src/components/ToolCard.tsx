import PrimaryButton from "./PrimaryButton";

type ToolCardProps = {
  name: string;
  description: string;
  status: "stable" | "beta" | "experimental" | string;
  category: string;
  href: string;
};

const ToolCard = ({
  name,
  description,
  status,
  category,
  href,
}: ToolCardProps) => {
  const statusStyles = {
    stable: "border-neutral-500 bg-neutral-950 text-neutral-100",
    beta: "border-neutral-600 bg-neutral-900 text-neutral-300",
    experimental: "border-amber-500/60 bg-amber-500/10 text-amber-200",
  } as const;

  const badgeClasses =
    statusStyles[
      status as keyof typeof statusStyles
    ] ?? statusStyles.stable;

  return (
    <article className="card flex h-full flex-col justify-between p-6 transition hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-950">
      <div className="space-y-3">
        <p className="label text-[0.65rem] text-neutral-500">
          {category}
        </p>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-100">{name}</h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses}`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <div className="pt-6">
        <PrimaryButton as="link" to={href} className="w-full justify-center">
          Open Tool
        </PrimaryButton>
      </div>
    </article>
  );
};

export default ToolCard;
