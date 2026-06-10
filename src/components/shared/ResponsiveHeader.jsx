import { cn } from "../ui/utils";

function ResponsiveHeader({ title, description, actions, className }) {
    return (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
            <div>
                <h1 className="text-2xl font-semibold text-primary">{title}</h1>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>

            {actions ? <div className="flex flex-wrap items-center gap-2 text-primary">{actions}</div> : null}
        </div>
    );
}

export default ResponsiveHeader;    
