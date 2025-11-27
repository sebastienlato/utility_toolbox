import { useCallback, useMemo, useRef, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  normalizeWhitespace,
  toCamelCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCase,
  type CaseMode,
} from "./textCaseUtils";

const caseModes: Array<{ id: CaseMode; label: string; description: string }> = [
  { id: "upper", label: "UPPERCASE", description: "ALL CAPS" },
  { id: "lower", label: "lowercase", description: "all lowercase" },
  { id: "title", label: "Title Case", description: "Capitalized Words" },
  {
    id: "sentence",
    label: "Sentence case",
    description: "Capitalizes first letters",
  },
  { id: "snake", label: "snake_case", description: "snake style" },
  { id: "kebab", label: "kebab-case", description: "dash separators" },
  { id: "camel", label: "camelCase", description: "JS variable style" },
  { id: "pascal", label: "PascalCase", description: "Component style" },
];

const TextCaseConverterPage = () => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CaseMode>("sentence");
  const [shouldTrim, setShouldTrim] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [copied, setCopied] = useState(false);

  const transformed = useMemo(() => {
    if (!input) return "";
    const prepared = collapseSpaces
      ? normalizeWhitespace(shouldTrim ? input : input.trim())
      : shouldTrim
      ? input.trim()
      : input;

    switch (mode) {
      case "upper":
        return toUpperCase(prepared);
      case "lower":
        return toLowerCase(prepared);
      case "title":
        return toTitleCase(prepared);
      case "sentence":
        return toSentenceCase(prepared);
      case "snake":
        return toSnakeCase(prepared);
      case "kebab":
        return toKebabCase(prepared);
      case "camel":
        return toCamelCase(prepared);
      case "pascal":
        return toPascalCase(prepared);
      default:
        return prepared;
    }
  }, [input, mode, collapseSpaces, shouldTrim]);

  const handleCopy = useCallback(async () => {
    if (!transformed) return;
    try {
      await navigator.clipboard.writeText(transformed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }, [transformed]);

  const handleClear = useCallback(() => {
    setInput("");
    setCopied(false);
    inputRef.current?.focus();
  }, []);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <PageHeader
          eyebrow="Text"
          title="Convert text between common cases"
          description="Paste text, pick a case style, and copy the result instantly. Everything happens client-side."
        />
      </div>

      <div className="card border-neutral-900 p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <label className="space-y-3 text-sm text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Input text
              </span>
              <textarea
                ref={inputRef}
                className="min-h-[260px] w-full rounded-3xl border border-neutral-900 bg-neutral-950/70 p-4 text-sm text-zinc-100 outline-none transition focus:border-neutral-700"
                placeholder="Paste or type your text here..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>

            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4 text-sm text-zinc-400">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Options
              </p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={shouldTrim}
                    onChange={(event) => setShouldTrim(event.target.checked)}
                    className="h-4 w-4 rounded border border-neutral-800 bg-neutral-950 text-emerald-400 focus:ring-emerald-500"
                  />
                  Trim whitespace
                </label>
                <label className="flex items-center gap-3 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={collapseSpaces}
                    onChange={(event) =>
                      setCollapseSpaces(event.target.checked)
                    }
                    className="h-4 w-4 rounded border border-neutral-800 bg-neutral-950 text-emerald-400 focus:ring-emerald-500"
                  />
                  Collapse multiple spaces
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Case styles
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {caseModes.map((caseMode) => (
                  <button
                    key={caseMode.id}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                      mode === caseMode.id
                        ? "border-emerald-400/60 bg-emerald-400/10 text-zinc-50"
                        : "border-neutral-900 bg-neutral-950/60 text-zinc-400 hover:border-neutral-700 hover:text-zinc-100"
                    }`}
                    onClick={() => setMode(caseMode.id)}
                  >
                    <p className="text-sm font-semibold">{caseMode.label}</p>
                    <p className="text-xs text-zinc-500">
                      {caseMode.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Output
                  </p>
                  <p className="text-sm text-zinc-400">
                    {transformed ? "Live preview" : "Enter text to see output"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    onClick={handleCopy}
                    disabled={!transformed}
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? "Copied!" : "Copy result"}
                  </PrimaryButton>
                  <button
                    type="button"
                    className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleClear}
                    disabled={!input}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="mt-4 min-h-[200px] rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 text-sm text-zinc-100">
                {transformed || (
                  <p className="text-sm text-zinc-500">
                    Output will appear here as you type.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextCaseConverterPage;
