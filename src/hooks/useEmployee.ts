/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyEmployeeProfile } from '../services/employees.service';
import type { Employee } from '../features/employees';

export function useEmployee() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let mounted = true;

    getMyEmployeeProfile()
      .then((profile) => {
        if (!mounted) return;
        setEmployee(profile);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'حدث خطأ في تحميل ملف الموظف');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { employee, loading, error };
}
