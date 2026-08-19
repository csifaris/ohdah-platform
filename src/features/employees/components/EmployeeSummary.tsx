import { BriefcaseBusiness, Building2, Mail, Phone, UserRound } from 'lucide-react';
import type { Employee } from '../types';

export function EmployeeSummary({ employee }: { employee: Employee }) { return <div className="grid gap-4 rounded-xl bg-surface p-5 sm:grid-cols-2"><Info icon={UserRound} label="الرقم الوظيفي" value={employee.id} /><Info icon={Building2} label="القسم" value={employee.department} /><Info icon={BriefcaseBusiness} label="المسمى الوظيفي" value={employee.jobTitle} /><Info icon={Mail} label="البريد الإلكتروني" value={employee.email} /><Info icon={Phone} label="رقم التواصل" value={employee.phone} /><Info icon={Building2} label="الفرع" value={employee.branch} /></div>; }
function Info({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) { return <div><p className="mb-1 text-xs text-muted">{label}</p><p className="flex items-center gap-2 text-sm font-semibold"><Icon className="text-muted" size={16} />{value}</p></div>; }
