import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBrand } from '../components/auth/AuthBrand';
import { RegisterForm } from '../components/auth/RegisterForm';
import { getApiErrorMessage } from '../services/api';
import { register, type RegisterPayload } from '../services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (payload: RegisterPayload) => {
    setLoading(true);
    setError('');
    try {
      await register(payload);
      navigate('/login', {
        replace: true,
        state: {
          successMessage:
            'تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.',
        },
      });
    } catch (reason: unknown) {
      setError(getApiErrorMessage(reason, 'تعذر إنشاء الحساب.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] p-4 antialiased sm:p-6">
      {/* Subtle radial ambient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent" />

      <section className="z-10 w-full max-w-[500px] rounded-2xl border border-[#D9E2EC]/25 bg-white p-8 shadow-2xl sm:p-10">
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
            إنشاء حساب جديد
          </h1>
        </div>

        {/* ── Form ── */}
        <RegisterForm error={error} loading={loading} onSubmit={submit} />

        {/* ── Footer link ── */}
        <div className="mt-6 border-t border-[#D9E2EC] pt-4 text-center text-xs text-[#64748B]">
          لديك حساب بالفعل؟{' '}
          <Link
            className="inline-flex items-center gap-1 font-bold text-[#062B78] hover:underline"
            to="/login"
          >
            <ArrowRight size={14} />
            تسجيل الدخول
          </Link>
        </div>
      </section>
    </main>
  );
}
