/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listEmployees } from '../services/employees.service';
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
    
    listEmployees(user.email)
      .then((employees) => {
        if (!mounted) return;
        const current = employees.find((e) => e.email === user.email || e.name === user.name);
        if (current) {
          setEmployee(current);
        } else {
          setError('لم يتم العثور على ملف الموظف');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'حدث خطأ');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [user]);

  return { employee, loading, error };
}
