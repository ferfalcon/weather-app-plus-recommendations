import type { ReactNode } from "react";

import styles from "./location-search-empty-state.module.css";

type LocationSearchStatusPanelProps = {
  copy: ReactNode;
  heading: string;
  kicker: string;
  liveRegion?: boolean;
  role?: "alert" | "status";
  tone?: "default" | "error" | "warning";
};

const panelClassNameByTone = {
  default: styles.statusPanel,
  error: styles.errorPanel,
  warning: styles.noResultsPanel,
} as const;

export function LocationSearchStatusPanel({
  copy,
  heading,
  kicker,
  liveRegion = false,
  role = "status",
  tone = "default",
}: LocationSearchStatusPanelProps) {
  return (
    <div
      aria-atomic={liveRegion ? "true" : undefined}
      aria-live={liveRegion ? "polite" : undefined}
      className={panelClassNameByTone[tone]}
      role={role}
    >
      <p className={styles.panelKicker}>{kicker}</p>
      <h2 className={styles.panelHeading}>{heading}</h2>
      <p className={styles.panelCopy}>{copy}</p>
    </div>
  );
}
