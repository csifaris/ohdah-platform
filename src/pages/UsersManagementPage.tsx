/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search, X } from 'lucide-react';
import { UserForm, type UserFormPayload } from '../features/users/components/UserForm';
import { UserTable } from '../features/users/components/UserTable';
import { UserDetailsDrawer } from '../features/users/components/UserDetailsDrawer';
import type { Role, User } from '../features/users/types';
import {
  createUser,
  deleteUser,
  listRoles,
  listUsersPage,
  updateUser,
  updateUserStatus,
} from '../services/users.service';
import { getApiErrorMessage } from '../services/api';

export function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roleId, setRoleId] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formUser, setFormUser] = useState<User | null | undefined>(undefined);
  const [selected, setSelected] = useState<User>();
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const load = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const [result, roleItems] = await Promise.all([
        listUsersPage({
          page: nextPage,
          limit: 10,
          search: search || undefined,
          status: status || undefined,
          roleId: roleId || undefined,
        }),
        listRoles(),
      ]);
      setUsers(result.items);
      setPage(result.pagination.page);
      setPages(result.pagination.pages || 1);
      setRoles(roleItems);
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل المستخدمين.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
  }, [search, status, roleId]);

  const save = async (payload: UserFormPayload) => {
    setSaving(true);
    setError('');
    try {
      if (formUser) await updateUser(formUser.id, payload);
      else await createUser(payload);
      setSuccess('تم حفظ المستخدم بنجاح.');
      setFormUser(undefined);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر حفظ المستخدم.'));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (user: User) => {
    try {
      await updateUserStatus(
        user.id,
        user.status === 'active' ? 'INACTIVE' : 'ACTIVE',
      );
      setSuccess('تم تحديث حالة الحساب بنجاح.');
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحديث الحالة.'));
    }
  };

  const confirmDelete = (user: User) => {
    setDeletingUser(user);
    setError('');
    setSuccess('');
  };

  const executeDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    setError('');
    try {
      await deleteUser(deletingUser.id);
      setSuccess(`تم حذف حساب الموظف "${deletingUser.name}" بنجاح.`);
      setDeletingUser(null);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر حذف المستخدم.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            الإدارة والصلاحيات
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-[#071426]"
            style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}
          >
            إدارة المستخدمين
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            التحكم في حسابات الموظفين، الأدوار التشغيلية، وصلاحيات النظام.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#071426]"
          onClick={() => setFormUser(null)}
          type="button"
        >
          <Plus size={18} />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <label className="relative">
            <Search
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
              size={18}
            />
            <input
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pr-11 pl-3 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">كل الأدوار</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
            <option value="SUSPENDED">موقوف</option>
          </select>
        </div>
      </div>

      {success && (
        <p className="rounded-xl bg-green-50 p-4 text-sm font-bold text-[#059669]" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-[#DC2626]" role="alert">
          {error}
        </p>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-12 text-center text-sm text-[#64748B]">
          جاري تحميل بيانات المستخدمين...
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={setFormUser}
          onStatus={changeStatus}
          onDelete={confirmDelete}
          onSelect={setSelected}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <button
          className="rounded-xl border border-[#D9E2EC] bg-white px-4 py-2 font-bold hover:bg-[#F8FAFC] disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => void load(page - 1)}
          type="button"
        >
          الصفحة السابقة
        </button>
        <span className="font-semibold">
          صفحة {page} من {pages}
        </span>
        <button
          className="rounded-xl border border-[#D9E2EC] bg-white px-4 py-2 font-bold hover:bg-[#F8FAFC] disabled:opacity-40"
          disabled={page >= pages}
          onClick={() => void load(page + 1)}
          type="button"
        >
          الصفحة التالية
        </button>
      </div>

      {/* User Form Modal (Create / Edit) */}
      {formUser !== undefined && (
        <UserForm
          user={formUser || undefined}
          roles={roles}
          loading={saving}
          onClose={() => setFormUser(undefined)}
          onSubmit={save}
        />
      )}

      {/* User Details Drawer */}
      <UserDetailsDrawer user={selected} onClose={() => setSelected(undefined)} />

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold">تأكيد حذف الموظف</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-[#071426]">
                هل أنت متأكد من حذف هذا الموظف؟
              </p>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#D9E2EC] text-xs space-y-1">
                <p className="font-bold text-[#071426]">{deletingUser.name}</p>
                <p className="text-[#64748B]" dir="ltr">
                  {deletingUser.email}
                </p>
                <p className="text-[#062B78] font-semibold">الدور: {deletingUser.role}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleting}
                className="rounded-xl border border-[#D9E2EC] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
