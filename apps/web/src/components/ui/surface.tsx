import type { HTMLAttributes } from "react";

import styles from "./surface.module.css";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "aside";
};

export function Surface({
  as: Component = "section",
  className,
  ...props
}: SurfaceProps) {
  const classes = [styles.surface, className].filter(Boolean).join(" ");

  return <Component className={classes} {...props} />;
}
