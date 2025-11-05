import * as React from "react";

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
  onError,
}: {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = async (value: string): Promise<void> => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      if (onCopy) {
        onCopy();
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = undefined;
      }, timeout);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  };

  return { copied, copy };
}
