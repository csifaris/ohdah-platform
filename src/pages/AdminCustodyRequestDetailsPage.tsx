/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, User, ShieldAlert, Check, X, Laptop } from 'lucide-react';
import { CustodyStatusBadge, type CustodyRequest } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { getAdminCustodyRequest, adminApproveCustodyRequest, adminRejectCustodyRequest, adminAssignCustodyRequest } from '../services/custody.service';
import { listAssets } from '../services/assets.service';
import type { Asset } from '../features/assets';
import { RequestTimeline } from '../components/RequestTimeline';

export function AdminCustodyRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/asset-manager') ? '/asset-manager' : '/admin';
  
  const [request, setRequest] = useState<CustodyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdminCustodyRequest(id)
      .then(setRequest)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!id || !confirm('هل أنت متأكد من قبول هذا الطلب؟')) return;
    try {
      const updated = await adminApproveCustodyRequest(id);
      setRequest(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر قبول الطلب.'));
    }
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) return;
    try {
      const updated = await adminRejectCustodyRequest(id, rejectionReason.trim());
      setRequest(updated);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر رفض الطلب.'));
    }
  };

  const handleAssignClick = async () => {
    setShowAssignModal(true);
    setLoadingAssets(true);
    try {
      const assets = await listAssets({ status: 'AVAILABLE' });
      setAvailableAssets(assets);
      if (assets.length > 0) {
        setSelectedAssetId(assets[0].id);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر تحميل الأصول المتاحة.'));
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAssignConfirm = async () => {
    if (!id || !selectedAssetId) return;
    try {
      const updated = await adminAssignCustodyRequest(id, selectedAssetId);
      setRequest(updated);
      setShowAssignModal(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر تخصيص الأصل.'));
    }
  };

  const formatId = (reqId: string) => `REQ-${reqId.slice(0, 5).toUpperCase()}`;

  if (loading) {
    return <div className="p-8 text-center text-muted">جاري تحميل تفاصيل الطلب...</div>;
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-6 text-center text-danger">{error}</div>
        <button onClick={() => navigate(`${basePath}/custody/requests`)} className="text-primary hover:underline">العودة للطلبات</button>
      </div>
    );
  }

  const requesterData = request.requesterData || {};

  return (
    <section className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`${basePath}/custody/requests`} className="rounded-lg p-2 text-muted hover:bg-surface">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">تفاصيل طلب العهدة {formatId(request.id)}</h1>
            <p className="text-sm text-muted mt-1">مراجعة ومعالجة طلب العهدة المقدم من الموظف</p>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <button 
                onClick={handleApprove}
                className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:bg-success/90"
              >
                <Check size={16} /> قبول الطلب
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90"
              >
                <X size={16} /> رفض الطلب
              </button>
            </>
          )}
          
          {request.status === 'approved' && (
            <button 
              onClick={handleAssignClick}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <Laptop size={16} /> تخصيص أصل
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: بيانات الطلب */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <ClipboardList className="text-primary" size={20} />
            <h2 className="text-lg font-bold">بيانات الطلب</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted mb-1">رقم الطلب</p>
              <p className="font-semibold">{formatId(request.id)}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">تاريخ الإنشاء</p>
              <p className="font-semibold">{request.requestedAt}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">نوع الأصل المطلوب</p>
              <p className="font-semibold">{request.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">الحالة</p>
              <div><CustodyStatusBadge request status={request.status} /></div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted mb-1">سبب الطلب</p>
              <p className="font-semibold bg-surface p-3 rounded-lg border border-border">{request.reason}</p>
            </div>
            {request.rejectionReason && (
              <div className="col-span-2 bg-red-50 text-danger p-3 rounded-lg border border-red-200">
                <p className="text-xs font-bold mb-1">سبب الرفض:</p>
                <p>{request.rejectionReason}</p>
              </div>
            )}
            {request.employeeReply && (
              <div className="col-span-2 bg-slate-50 text-ink p-3 rounded-lg border border-border">
                <p className="text-xs font-bold mb-1">رد الموظف:</p>
                <p>{request.employeeReply}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: بيانات الموظف */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <User className="text-primary" size={20} />
            <h2 className="text-lg font-bold">بيانات الموظف</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-muted mb-1">الاسم الكامل</p>
              <p className="font-semibold text-base">{request.requester}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">الرقم الوظيفي</p>
              <p className="font-semibold">{requesterData.employeeNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">القسم</p>
              <p className="font-semibold">{request.department || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted mb-1">البريد الإلكتروني</p>
              <p className="font-semibold">{requesterData.email || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted mb-1">الجوال</p>
              <p className="font-semibold">{requesterData.phone || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Timeline */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-border pb-3 mb-6">
          <ShieldAlert className="text-primary" size={20} />
          <h2 className="text-lg font-bold">مسار الطلب</h2>
        </div>
        <RequestTimeline request={request} />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-danger">رفض طلب العهدة</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-muted hover:text-ink"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                رفض الطلب - سبب الرفض <span className="text-danger">*</span>
              </label>
              <textarea 
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: الأصل غير متوفر حالياً أو لا توجد صلاحية للتسليم"
                className="w-full rounded-lg border border-border p-3 text-sm focus:border-danger focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 rounded-lg bg-danger py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-50"
              >
                تأكيد الرفض
              </button>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold text-muted hover:bg-surface"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold">تخصيص أصل للموظف</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-muted hover:text-ink"><X size={18} /></button>
            </div>
            
            {loadingAssets ? (
              <p className="text-center py-6 text-sm text-muted">جاري تحميل الأصول المتاحة...</p>
            ) : availableAssets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted">لا توجد أصول متاحة حالياً من الحالة AVAILABLE</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">اختر الأصل المتاح:</label>
                  <select 
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} (رقم: {asset.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="rounded-lg bg-surface p-4 border border-border space-y-2 text-xs">
                  <p className="font-semibold text-muted">تفاصيل الأصل المختار:</p>
                  {(() => {
                    const selected = availableAssets.find(a => a.id === selectedAssetId);
                    if (!selected) return null;
                    return (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-muted">اسم الأصل:</span> {selected.name}</p>
                        <p><span className="text-muted">الرقم التسلسلي:</span> {selected.serialNumber}</p>
                        <p><span className="text-muted">النوع/القسم:</span> {selected.category}</p>
                        <p><span className="text-muted">الحالة المادية:</span> {selected.condition}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleAssignConfirm}
                disabled={!selectedAssetId || loadingAssets}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                تخصيص الأصل
              </button>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold text-muted hover:bg-surface"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
