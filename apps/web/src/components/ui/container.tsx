import type { HTMLAttributes } from "react";

import styles from "./container.module.css";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
  const classes = [styles.container, className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}
