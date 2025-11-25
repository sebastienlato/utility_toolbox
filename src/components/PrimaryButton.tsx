import { type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { type ButtonHTMLAttributes } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type RouterLinkProps = BaseProps &
  LinkProps & {
    as: "link";
  };

type PrimaryButtonProps = ButtonProps | RouterLinkProps;

const sharedClasses =
  "inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-emerald-300/80 hover:bg-emerald-400/20 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

const merge = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const PrimaryButton = (props: PrimaryButtonProps) => {
  if (props.as === "link") {
    const { className, children, ...linkProps } = props;
    return (
      <Link className={merge(sharedClasses, className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { className, children, ...buttonProps } = props;
  return (
    <button className={merge(sharedClasses, className)} {...buttonProps}>
      {children}
    </button>
  );
};

export default PrimaryButton;
