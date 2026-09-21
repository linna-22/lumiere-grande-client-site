import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ErrorModal from "../components/ErrorModal";
import { getFriendlyError } from "../utils/friendlyError";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showError = useCallback((error, options = {}) => {
    setModal({
      message: getFriendlyError(error),
      title: options.title,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    });
  }, []);

  const hideError = useCallback(() => setModal(null), []);

  const value = useMemo(() => ({ showError, hideError }), [showError, hideError]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
      {modal && <ErrorModal {...modal} onClose={hideError} />}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useError must be used inside <ErrorProvider>");
  return ctx;
}