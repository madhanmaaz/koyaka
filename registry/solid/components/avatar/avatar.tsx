import { Show, splitProps, JSX } from "solid-js";

import { useAvatarImage } from "./useAvatarImage";
import type { ImageLoadingStatus } from "./useAvatarImage";

import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarStatus = "online" | "busy" | "away" | "offline";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AvatarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    size?: Size;
    color?: Color;
    status?: AvatarStatus;
}

interface AvatarImageProps extends JSX.HTMLAttributes<HTMLImageElement> {
    fallbacks?: string[];
    src?: string;
    alt?: string;
}

interface AvatarPlaceholderProps extends JSX.HTMLAttributes<HTMLDivElement> {
    placeholderText?: string;
}

interface AvatarGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {}

// ─── Components ───────────────────────────────────────────────────────────────────
function Avatar(props: AvatarProps) {
    const [local, others] = splitProps(props, [
        "size",
        "color",
        "status",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "avatar",
                local.size,
                local.color,

                local.class,
                `status-${local.status}`,
            )}

            {...others}
        >
            {local.children}
        </div>
    );
}

function AvatarImage(props: AvatarImageProps) {
    const [local, others] = splitProps(props, [
        "src",
        "alt",
        "fallbacks",
        "class",
    ]);

    const { resolvedSrc, status } = useAvatarImage({
        src: local.src,
        fallbacks: local.fallbacks,
    });

    return (
        <Show when={status() !== "error" && resolvedSrc() !== null}>
            <img
                class={cn("avatar-image", local.class)}
                src={resolvedSrc()!}
                alt={local.alt ?? ""}
                {...others}
            />
        </Show>
    );
}

function AvatarPlaceholder(props: AvatarPlaceholderProps) {
    const [local, others] = splitProps(props, [
        "placeholderText",
        "class",
        "children",
    ]);

    return (
        <div class="avatar-placeholder" aria-hidden="true" {...others}>
            {local.placeholderText ?? "?"}
        </div>
    );
}

function AvatarGroup(props: AvatarGroupProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("avatar-group", local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Avatar, AvatarImage, AvatarPlaceholder, AvatarGroup };

export type {
    AvatarProps,
    AvatarImageProps,
    AvatarPlaceholderProps,
    AvatarGroupProps,
    AvatarStatus,
    ImageLoadingStatus,
    Size as AvatarSize,
};
