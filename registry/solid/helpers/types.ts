export type Placement = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type ResponsiveSize = `${Breakpoint}:${Size}`;
export type SizeVariant = Size | "responsive" | ResponsiveSize;

export type Orientation = "horizontal" | "vertical";
export type ResponsiveOrientation =
    Orientation | `${Breakpoint}:${Orientation}`;

export type Color =
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
