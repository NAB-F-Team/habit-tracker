import { cn } from "../ui/utils";

function SectionCard({ title, description, actions, className, contentClassName, children }) {
    //title: dòng tiêu đề trên cùng (ở trang search habits), đa dụng, v...
    return (
        <section className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
            {(title || description || actions) && (
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                        {title ? <h3 className="text-lg font-semibold text-foreground">{title}</h3> : null}
                        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                </div>
            )}

            <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
        </section>
    );
}

export default SectionCard;
