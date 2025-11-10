interface DropdownSectionProps {
  label?: string;
  children: React.ReactNode;
  divider?: boolean;
}

export function DropdownSection({ label, children, divider = false }: DropdownSectionProps) {
  return (
    <div className={divider ? 'border-t border-neutral-100 mt-1 pt-1' : ''}>
      {label && <div className="px-3 py-1 text-xs font-semibold text-neutral-400">{label}</div>}
      {children}
    </div>
  );
}
