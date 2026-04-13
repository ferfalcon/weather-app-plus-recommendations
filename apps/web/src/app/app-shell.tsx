import type { PropsWithChildren } from "react";

import { Container } from "../components/ui/container";
import styles from "./app-shell.module.css";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className={styles.app}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <Container className={styles.headerInner}>
          <div className={styles.brandLockup}>
            <span aria-hidden="true" className={styles.brandMark} />
            <div>
              <p className={styles.eyebrow}>Weather Now</p>
              <p className={styles.title}>Search-first forecast and recommendations</p>
            </div>
          </div>
        </Container>
      </header>

      <main className={styles.main}>
        <Container>{children}</Container>
      </main>
    </div>
  );
}
