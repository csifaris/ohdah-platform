import type { ReactNode } from 'react';

type AuthFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function AuthField({ id, label, error, children }: AuthFieldProps) {
  return <div className="space-y-2"><label className="block text-sm font-medium text-slate-700" htmlFor={id}>{label}</label>{children}{error && <p className="text-xs font-medium text-red-600" id={`${id}-error`}>{error}</p>}</div>;
}
