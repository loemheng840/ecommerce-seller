interface ShellProps {
    children: React.ReactNode;
    title?: string;
}

export function Shell({ children, title }: ShellProps) {
    return (
        <>
            {title && (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                </div>
            )}
            {children}
        </>
    );
}
