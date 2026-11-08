import { createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

interface UseAvatarImageOptions {
    src?: string;
    fallbacks?: string[];
}

interface UseAvatarImageReturn {
    resolvedSrc: () => string | null;
    status: () => ImageLoadingStatus;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function probeImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject();
        img.src = url;
    });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useAvatarImage(options: UseAvatarImageOptions): UseAvatarImageReturn {
    const allSrcs = (): string[] =>
        [options.src, ...(options.fallbacks ?? [])].filter(
            (s): s is string => !!s,
        );

    const [resolvedSrc, setResolvedSrc] = createSignal<string | null>(
        isServer ? (allSrcs()[0] ?? null) : null,
    );
    const [status, setStatus] = createSignal<ImageLoadingStatus>(
        isServer ? "loaded" : "idle",
    );

    createEffect(() => {
        const srcs = allSrcs();

        if (srcs.length === 0) {
            setResolvedSrc(null);
            setStatus("error");
            return;
        }

        setStatus("loading");
        let cancelled = false;

        (async () => {
            for (const url of srcs) {
                if (cancelled) return;
                try {
                    await probeImage(url);
                    if (!cancelled) {
                        setResolvedSrc(url);
                        setStatus("loaded");
                    }
                    return;
                } catch {
                    // try next
                }
            }
            if (!cancelled) {
                setResolvedSrc(null);
                setStatus("error");
            }
        })();

        onCleanup(() => {
            cancelled = true;
        });
    });

    return { resolvedSrc, status };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { useAvatarImage };
export type { UseAvatarImageOptions, UseAvatarImageReturn, ImageLoadingStatus };
