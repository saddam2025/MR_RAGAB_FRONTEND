import { useEffect, useState } from 'react';
import api from '../services/api';
import instructorService from '../services/instructorService';

export default function useEnrolledCourses(instructorId) {
  const [courses, setCourses] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.allSettled([
      api.get('/courses/enrolled'),
      instructorService.get(instructorId)
    ]).then(([courseResult, tenantResult]) => {
      if (!active) return;
      if (courseResult.status === 'fulfilled') {
        const rows = courseResult.value?.data?.data;
        setCourses(Array.isArray(rows) ? rows : []);
      } else {
        setError(courseResult.reason?.message || 'تعذر تحميل كورساتك. حاول مرة أخرى.');
      }
      if (tenantResult.status === 'fulfilled') setTenant(tenantResult.value?.data || null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [instructorId]);

  return { courses, tenant, loading, error };
}
