import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { Container } from "../components/ui/container";
import styles from "./app-shell.module.css";

const AppShellHeaderAccessoryContext = createContext<
  ((accessory: ReactNode | null) => void) | null
>(null);

export function useAppShellHeaderAccessory(accessory: ReactNode | null) {
  const setHeaderAccessory = useContext(AppShellHeaderAccessoryContext);

  if (!setHeaderAccessory) {
    throw new Error("App shell header accessory must be used within AppShell.");
  }

  useEffect(() => {
    setHeaderAccessory(accessory);

    return () => {
      setHeaderAccessory(null);
    };
  }, [accessory, setHeaderAccessory]);
}

export function AppShell({ children }: PropsWithChildren) {
  const [headerAccessory, setHeaderAccessory] = useState<ReactNode | null>(null);

  return (
    <AppShellHeaderAccessoryContext.Provider value={setHeaderAccessory}>
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

            {headerAccessory ? (
              <div className={styles.headerAccessory}>{headerAccessory}</div>
            ) : null}
          </Container>
        </header>

        <main className={styles.main}>
          <Container>{children}</Container>
        </main>
      </div>
    </AppShellHeaderAccessoryContext.Provider>
  );
}
