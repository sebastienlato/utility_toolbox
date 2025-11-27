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

const sharedClasses = "btn";

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
