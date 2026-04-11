import type { PropsWithChildren } from "react";

import { Container } from "../components/ui/container";
import styles from "./app-shell.module.css";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className={styles.app}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <Container className={styles.headerInner}>
          <div>
            <p className={styles.eyebrow}>Weather App + Recommendations</p>
            <p className={styles.title}>Search-first live weather flow</p>
          </div>
        </Container>
      </header>

      <main className={styles.main}>
        <Container>{children}</Container>
      </main>
    </div>
  );
}
