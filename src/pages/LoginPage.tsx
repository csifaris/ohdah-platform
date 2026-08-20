import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBrand } from '../components/auth/AuthBrand';
import { AuthField } from '../components/auth/AuthField';
import { useAuth } from '../context/AuthContext';

type LoginValues = { email: string; password: string; rememberMe: boolean };
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

function validate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!values.email.trim()) errors.email = 'يرجى إدخال البريد الإلكتروني';
  else if (!/^\S+@\S+\.\S+$/.test(values.email))
    errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
  if (!values.password) errors.password = 'يرجى إدخال كلمة المرور';
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, logout, loading, error } = useAuth();

  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      const user = await login(values.email, values.password);
      const roles = user.roles.map((role) => role.toUpperCase());
      if (roles.includes('ADMIN'))
        navigate('/admin/dashboard', { replace: true });
      else if (roles.includes('ASSET_MANAGER'))
        navigate('/asset-manager/dashboard', { replace: true });
      else if (roles.includes('EMPLOYEE'))
        navigate('/portal', { replace: true });
      else {
        logout();
        setSubmitError('لا يوجد دور صالح لهذا الحساب.');
      }
    } catch {
      setSubmitError(
        error || 'بيانات الدخول غير صحيحة أو تعذر الاتصال بالخادم.',
      );
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] p-4 antialiased sm:p-6">
      {/* Subtle radial ambient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent" />

      <section className="z-10 flex w-full max-w-[440px] flex-col rounded-2xl border border-[#D9E2EC]/25 bg-white p-8 shadow-2xl sm:p-10">
        {/* ── Logo Section ── */}
        <div className="mb-4">
          <AuthBrand />
        </div>

        {/* ── Page Title ── */}
        <div className="mb-6 text-center">
          <h1
            className="text-2xl font-bold text-[#071426]"
            style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}
          >
            تسجيل الدخول
          </h1>
        </div>

        {/* ── Form ── */}
        <form className="flex flex-col gap-4" noValidate onSubmit={submit}>
          {/* Email */}
          <AuthField id="email" label="البريد الإلكتروني" error={errors.email}>
            <div className="relative flex items-center rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] transition-colors focus-within:border-[#062B78] focus-within:ring-1 focus-within:ring-[#062B78]">
              <Mail className="absolute right-3 text-[#64748B]" size={18} />
              <input
                aria-invalid={Boolean(errors.email)}
                className="w-full rounded-xl border-none bg-transparent py-3 pl-3 pr-10 text-sm text-[#071426] outline-none placeholder:text-[#64748B]/60"
                dir="ltr"
                id="email"
                name="email"
                onChange={update}
                placeholder="name@domain.com"
                type="email"
                value={values.email}
              />
            </div>
          </AuthField>

          {/* Password */}
          <AuthField id="password" label="كلمة المرور" error={errors.password}>
            <div className="relative flex items-center rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] transition-colors focus-within:border-[#062B78] focus-within:ring-1 focus-within:ring-[#062B78]">
              <LockKeyhole className="absolute right-3 text-[#64748B]" size={18} />
              <input
                aria-invalid={Boolean(errors.password)}
                className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-10 text-sm text-[#071426] outline-none placeholder:text-[#64748B]/60"
                dir="ltr"
                id="password"
                name="password"
                onChange={update}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
              />
              <button
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute left-3 text-[#64748B] hover:text-[#071426] transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </AuthField>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-[#64748B] cursor-pointer">
              <input
                checked={values.rememberMe}
                className="h-4 w-4 rounded border-[#D9E2EC] text-[#062B78] focus:ring-[#062B78]"
                name="rememberMe"
                onChange={update}
                type="checkbox"
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-[#DC2626]"
              role="alert"
            >
              <AlertCircle className="shrink-0" size={16} />
              <p>{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#062B78] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#071426] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowLeft size={16} />
              </>
            )}
          </button>
        </form>

        {/* ── Footer Link ── */}
        <div className="mt-6 border-t border-[#D9E2EC] pt-4 text-center">
          <p className="text-xs text-[#64748B]">
            ليس لديك حساب؟{' '}
            <Link
              className="font-bold text-[#062B78] hover:underline"
              to="/register"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
