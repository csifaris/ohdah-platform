import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustodyForm } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { assignCustody } from '../services/custody.service';

export function AssignCustodyPage() { const navigate = useNavigate(); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const save = () => { setSaving(true); assignCustody({ assetId: import.meta.env.VITE_DEFAULT_ASSET_ID, employeeId: import.meta.env.VITE_DEFAULT_EMPLOYEE_ID }).then(() => navigate('/admin/custody')).catch((reason: unknown) => setError(getApiErrorMessage(reason))).finally(() => setSaving(false)); }; return <div className="space-y-4">{error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}{saving && <p className="rounded-lg bg-surface p-4 text-sm text-muted">جاري تسجيل التسليم...</p>}<CustodyForm onCancel={() => navigate('/admin/custody')} onSaved={save} /></div>; }
