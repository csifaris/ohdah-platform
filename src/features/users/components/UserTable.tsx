import { Edit3, MoreVertical, Trash2 } from 'lucide-react';
import type { User } from '../types';
import { UserStatusBadge } from './UserStatusBadge';

export function UserTable({
  users,
  onEdit,
  onStatus,
  onDelete,
  onSelect,
}: {
  users: User[];
  onEdit: (user: User) => void;
  onStatus: (user: User) => void;
  onDelete: (user: User) => void;
  onSelect?: (user: User) => void;
}) {
  const isProtectedRole = (user: User) => {
    const roleUpper = (user.role || '').toUpperCase();
    return (
      roleUpper.includes('ADMIN') ||
      roleUpper.includes('ASSET_MANAGER') ||
      user.role.includes('مدير') ||
      user.role.includes('مسؤول')
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E2EC] bg-white shadow-soft">
      <table className="w-full min-w-[900px] text-right text-sm">
        <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold text-[#071426]">
          <tr className="h-12">
            {['المستخدم', 'الدور', 'القسم', 'الحالة', 'آخر نشاط', 'الإجراءات'].map((heading) => (
              <th className="px-4 py-3" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E2EC] text-sm">
          {users.map((user) => {
            const protectedUser = isProtectedRole(user);
            return (
              <tr className="h-14 hover:bg-[#FFF7E6] transition-colors" key={user.id}>
                <td className="cursor-pointer px-4 py-3" onClick={() => onSelect?.(user)}>
                  <p className="font-bold text-[#071426]">{user.name}</p>
                  <p className="text-xs text-[#64748B]" dir="ltr">
                    {user.email}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#062B78]">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#64748B]">{user.department}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-xs text-[#64748B]">{user.lastActivity}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="تعديل"
                      className="rounded-lg p-1.5 text-[#062B78] hover:bg-blue-50 transition-colors"
                      onClick={() => onEdit(user)}
                      title="تعديل المستخدم"
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      aria-label="تغيير الحالة"
                      className="rounded-lg p-1.5 text-[#F59E0B] hover:bg-amber-50 transition-colors"
                      onClick={() => onStatus(user)}
                      title="تغيير حالة الحساب"
                      type="button"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {!protectedUser && (
                      <button
                        aria-label="حذف الموظف"
                        className="rounded-lg p-1.5 text-[#DC2626] hover:bg-red-50 transition-colors"
                        onClick={() => onDelete(user)}
                        title="حذف حساب الموظف"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!users.length && (
        <p className="bg-white p-10 text-center text-xs text-[#64748B]">لا يوجد مستخدمون مطابقون.</p>
      )}
    </div>
  );
}
