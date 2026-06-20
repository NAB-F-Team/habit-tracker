import { cn } from "../ui/utils";

const WIDTHS = {
    sm: "mx-auto max-w-sm",
    md: "mx-auto max-w-2xl",
    lg: "mx-auto max-w-4xl",
    xl: "mx-auto max-w-6xl",
    full: "w-full"
};

function ResponsivePageContainer({ children, className, width = "full" }) {
    return <div className={cn("space-y-6", WIDTHS[width], className)}>{children}</div>;
}

export default ResponsivePageContainer;
