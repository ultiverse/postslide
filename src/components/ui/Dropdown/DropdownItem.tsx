import type { LucideIcon } from 'lucide-react';

interface DropdownItemProps {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
}

export function DropdownItem({ icon: Icon, label, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
