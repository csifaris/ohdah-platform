/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Mail, Phone, Building2, Briefcase, Hash, Camera, Save, X, type LucideIcon } from 'lucide-react';
import { useEmployee } from '../hooks/useEmployee';
import { updateEmployee } from '../services/employees.service';
import { getApiErrorMessage } from '../services/api';
import logoUrl from '../assets/ohdah-logo.png';

export function EmployeeProfilePage() {
  const { employee, loading, error: fetchError } = useEmployee();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    email: '',
    jobTitle: '',
    department: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (fetchError || !employee) {
    return <div className="rounded-lg bg-red-50 p-6 text-center text-danger">{fetchError || 'لم يتم العثور على بيانات الموظف'}</div>;
  }

  const handleEditClick = () => {
    setForm({
      name: employee.name,
      phone: employee.phone || '',
      avatar: (employee as any).avatar || '',
      email: employee.email || '',
      jobTitle: employee.jobTitle || '',
      department: employee.department || '',
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('صيغة الملف غير مدعومة. يرجى رفع صورة JPG أو PNG أو WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('يرجى إدخال الاسم بالكامل');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await updateEmployee(employee.id, {
        name: form.name,
        phone: form.phone,
        avatar: form.avatar,
        email: form.email,
        jobTitle: form.jobTitle,
        departmentName: form.department,
      });
      setSuccess('تم تحديث الملف الشخصي بنجاح. يرجى تحديث الصفحة لرؤية التغييرات في الشريط العلوي.');
      setIsEditing(false);
      // Optimistically update the employee object via reload or just inform the user
      window.location.reload();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر تحديث الملف الشخصي'));
      setSaving(false);
    }
  };

  const currentAvatar = isEditing ? form.avatar || logoUrl : (employee as any).avatar || logoUrl;

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">الملف الشخصي</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">المعلومات الشخصية والوظيفية</h1>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#071426]"
          >
            تعديل الملف الشخصي
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-[#059669]">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#D9E2EC] bg-white shadow-soft overflow-hidden">
        <div className="bg-[#062B78]/10 h-32 w-full border-b border-[#D9E2EC]"></div>
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative -mt-16 mb-6 flex justify-between items-end">
            <div className="relative group">
              <div className="flex h-32 w-32 overflow-hidden items-center justify-center rounded-2xl border-4 border-white bg-[#062B78] text-4xl font-bold text-white shadow-md">
                <img src={currentAvatar} alt="Profile" className="h-full w-full object-cover" />
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-full bg-[#062B78] p-2.5 text-white shadow-lg transition-transform hover:scale-105"
                  title="تغيير الصورة"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  <X size={16} />
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2 text-sm font-bold text-white hover:bg-[#071426] disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-[#071426]">{employee.name}</h2>
              <p className="text-[#64748B] mt-1 text-sm font-medium">{employee.jobTitle}</p>
            </>
          ) : (
            <div className="grid gap-4 max-w-md">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#071426]">الاسم الكامل</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#071426] focus:border-[#062B78] focus:outline-none"
                />
              </label>
            </div>
          )}
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {!isEditing ? (
              <InfoItem icon={Mail} label="البريد الإلكتروني" value={employee.email} />
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC]">
                <div className="p-2 bg-white rounded-lg border border-[#D9E2EC]">
                  <Mail size={20} className="text-[#062B78]" />
                </div>
                <label className="w-full">
                  <span className="block text-xs font-semibold text-[#64748B]">البريد الإلكتروني</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D9E2EC] bg-white px-2.5 py-1.5 text-sm text-[#071426] focus:border-[#062B78] focus:outline-none"
                    placeholder="البريد الإلكتروني..."
                  />
                </label>
              </div>
            )}
            
            {!isEditing ? (
              <InfoItem icon={Phone} label="رقم الهاتف" value={employee.phone || '—'} />
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC]">
                <div className="p-2 bg-white rounded-lg border border-[#D9E2EC]">
                  <Phone size={20} className="text-[#062B78]" />
                </div>
                <label className="w-full">
                  <span className="block text-xs font-semibold text-[#64748B]">رقم الهاتف</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D9E2EC] bg-white px-2.5 py-1.5 text-sm text-[#071426] focus:border-[#062B78] focus:outline-none"
                    placeholder="رقم الهاتف..."
                  />
                </label>
              </div>
            )}
            
            {!isEditing ? (
              <InfoItem icon={Building2} label="القسم" value={employee.department} />
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC]">
                <div className="p-2 bg-white rounded-lg border border-[#D9E2EC]">
                  <Building2 size={20} className="text-[#062B78]" />
                </div>
                <label className="w-full">
                  <span className="block text-xs font-semibold text-[#64748B]">القسم</span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D9E2EC] bg-white px-2.5 py-1.5 text-sm text-[#071426] focus:border-[#062B78] focus:outline-none"
                    placeholder="القسم..."
                  />
                </label>
              </div>
            )}
            
            {!isEditing ? (
              <InfoItem icon={Briefcase} label="المسمى الوظيفي" value={employee.jobTitle || '—'} />
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC]">
                <div className="p-2 bg-white rounded-lg border border-[#D9E2EC]">
                  <Briefcase size={20} className="text-[#062B78]" />
                </div>
                <label className="w-full">
                  <span className="block text-xs font-semibold text-[#64748B]">المسمى الوظيفي</span>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D9E2EC] bg-white px-2.5 py-1.5 text-sm text-[#071426] focus:border-[#062B78] focus:outline-none"
                    placeholder="المسمى الوظيفي..."
                  />
                </label>
              </div>
            )}
            
            <InfoItem icon={Hash} label="الرقم الوظيفي" value={employee.id.slice(0, 8).toUpperCase()} />
          </div>
        </div>
      </form>
    </section>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC]">
      <div className="p-2 bg-white rounded-lg border border-[#D9E2EC]">
        <Icon size={20} className="text-[#062B78]" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
        <p className="mt-1 font-bold text-[#071426]">{value}</p>
      </div>
    </div>
  );
}
