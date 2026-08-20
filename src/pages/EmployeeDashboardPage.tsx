import { useEffect, useState } from 'react';
import { Activity, Bell, Boxes, ClipboardList, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import { useEmployee } from '../hooks/useEmployee';
import { listCustody, listCustodyRequests } from '../services/custody.service';
import { listMaintenance } from '../services/maintenance.service';
import { listNotifications } from '../services/notifications.service';

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { employee } = useEmployee();
  
  const [loading, setLoading] = useState(true);
  const [custodyCount, setCustodyCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user || !employee) return;

    let mounted = true;

    async function fetchData() {
      try {
        const [custodies, requests, maintenance, notifications] = await Promise.all([
          listCustody('ACTIVE'),
          listCustodyRequests('PENDING'),
          listMaintenance(),
          listNotifications(user?.id || '', true),
        ]);

        if (!mounted) return;

        // Filter by the matched employee name
        const myCustodies = custodies.filter(
          (c) => c.employee === employee?.name
        );
        const myRequests = requests.filter(
          (r) => r.requester === employee?.name
        );
        const myMaintenance = maintenance.filter(
          (m) => m.employee === employee?.name && (m.status === 'open' || m.status === 'in_progress')
        );

        setCustodyCount(myCustodies.length);
        setRequestsCount(myRequests.length);
        setMaintenanceCount(myMaintenance.length);
        setNotificationsCount(notifications.length);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user, employee]);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            مرحباً بك، {employee?.name || user?.name}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            بوابة الموظف
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            نظرة عامة على العهد المسندة إليك والطلبات الحالية.
          </p>
        </div>
        <Link
          to="/portal/requests/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#062B78] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#071426]"
        >
          <ClipboardList size={20} />
          طلب عهدة جديدة
        </Link>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          <div className="h-[140px] rounded-2xl border border-[#D9E2EC] bg-white shadow-soft"></div>
          <div className="h-[140px] rounded-2xl border border-[#D9E2EC] bg-white shadow-soft"></div>
          <div className="h-[140px] rounded-2xl border border-[#D9E2EC] bg-white shadow-soft"></div>
          <div className="h-[140px] rounded-2xl border border-[#D9E2EC] bg-white shadow-soft"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="العهد النشطة"
            value={custodyCount.toString()}
            icon={Boxes}
            tone="primary"
          />
          <StatCard
            label="طلبات العهدة (قيد الانتظار)"
            value={requestsCount.toString()}
            icon={Activity}
            tone="tertiary"
          />
          <StatCard
            label="طلبات الصيانة (جارية)"
            value={maintenanceCount.toString()}
            icon={Wrench}
            tone={maintenanceCount > 0 ? 'danger' : 'tertiary'}
          />
          <StatCard
            label="الإشعارات (غير مقروءة)"
            value={notificationsCount.toString()}
            icon={Bell}
            tone={notificationsCount > 0 ? 'success' : 'tertiary'}
          />
        </div>
      )}
    </div>
  );
}
