function EmptyState ({ icon: Icon, title, description, className }) {
    return (
        <div className={className ?? "rounded-2xl border border-border bg-card p-10 text-center shadow-sm sm:p-12"}>
            {Icon ? <Icon className="mx-auto mb-4 size-12 text-muted-foreground/40" /> : null}
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
    )
}

export default EmptyState