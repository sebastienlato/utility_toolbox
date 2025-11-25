import PrimaryButton from "./PrimaryButton";

type ToolCardProps = {
  name: string;
  description: string;
  status: string;
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
  const statusStyles =
    status === "beta"
      ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
      : "border-emerald-400/50 bg-emerald-400/10 text-emerald-200";

  return (
    <article className="glass-card flex h-full flex-col justify-between p-6 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          {category}
        </p>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">{name}</h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles}`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-slate-300">{description}</p>
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
