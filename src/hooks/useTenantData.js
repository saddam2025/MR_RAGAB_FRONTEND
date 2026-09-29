import { useEffect, useState } from 'react';
import instructorService from '../services/instructorService';

export default function useTenantData(instructorId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    instructorProfile: null,
    catalogCourses: [],
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!instructorId) {
      setData({ instructorProfile: null, catalogCourses: [] });
      setError('لم يتم العثور على المنصة.');
      setLoading(false);
      return undefined;
    }

    let active = true;
    Promise.all([instructorService.get(instructorId), instructorService.getCourses(instructorId)])
      .then(([tenantResponse, coursesResponse]) => {
        if (!active) return;
        const instructorProfile = tenantResponse.data;
        const catalogCourses = coursesResponse.data.map((course) => ({
          ...course,
          instructor: {
            ...course.instructor,
            name: course.instructor?.name || instructorProfile.name,
            avatar: instructorProfile.logoUrl || course.instructor?.logoUrl || course.instructor?.avatar,
          },
        }));
        setData({ instructorProfile, catalogCourses });
      })
      .catch((requestError) => {
        if (active) {
          setData({ instructorProfile: null, catalogCourses: [] });
          setError(requestError.message || 'تعذر تحميل بيانات المنصة.');
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [instructorId]);

  return {
    instructorProfile: data.instructorProfile,
    catalogCourses: data.catalogCourses,
    loading,
    error,
  };
}
