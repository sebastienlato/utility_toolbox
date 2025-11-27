import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackToTools = () => {
  return (
    <Link
      to="/"
      className="group mb-6 inline-flex items-center gap-2 text-slate-300 transition hover:text-white focus-ring"
    >
      <ArrowLeft className="h-4 w-4 opacity-80 transition group-hover:opacity-100" />
      <span className="text-sm font-medium">Back to Tools</span>
    </Link>
  );
};

export default BackToTools;
