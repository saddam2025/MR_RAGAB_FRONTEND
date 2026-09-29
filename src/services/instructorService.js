// src/services/instructorService.js
import api, { resolveApiAssetUrl } from './api';

function mapTenant(tenant) {
  if (!tenant) return null;
  return {
    id: tenant.subdomain,
    subdomain: tenant.subdomain,
    name: tenant.name,
    avatar: resolveApiAssetUrl(tenant.profileImageUrl || tenant.logoUrl),
    profileImageUrl: resolveApiAssetUrl(tenant.profileImageUrl),
    logoUrl: resolveApiAssetUrl(tenant.logoUrl),
    faviconUrl: resolveApiAssetUrl(tenant.faviconUrl),
    tagline: tenant.tagline || '',
    bio: tenant.bio || '',
    subject: tenant.subject || '',
    location: tenant.location || '',
    coverPhotoUrl: resolveApiAssetUrl(tenant.coverPhotoUrl),
    stagesOffered: Array.isArray(tenant.stagesOffered) ? tenant.stagesOffered : [],
    monthlyPrice: tenant.monthlyPrice,
    perLecturePrice: tenant.perLecturePrice,
    supportPhone: tenant.supportPhone || '',
    themeColors: tenant.themeColors || {}
  };
}

function mapCourse(course) {
  return {
    id: course._id,
    title: course.title_ar || course.title_en,
    subtitle: course.description_ar || course.description_en || '',
    image: resolveApiAssetUrl(course.thumbnailUrl || course.thumbnail || course.imageUrl || course.image),
    price: course.price,
    lectureCount: course.lectureCount || 0,
    homeworkCount: course.homeworkCount || 0,
    stage: course.stage,
    category: course.categoryId?.name || '',
    accessPeriodDays: course.accessPeriodDays,
    maxViews: course.maxViews,
    isPublished: course.isPublished,
    owned: Boolean(course.owned),
    locked: course.locked,
    partialLectureCount: course.partialLectureCount || 0,
    hasPartialLectureAccess: Boolean(course.hasPartialLectureAccess),
    instructor: course.instructor ? {
      name: course.instructor.name || course.instructorName || '',
      avatar: resolveApiAssetUrl(course.instructor.avatar)
    } : undefined,
    subdomain: course.subdomain || course.instructor?.subdomain || ''
  };
}

function mapLecture(lecture) {
  return {
    id: lecture._id,
    courseId: lecture.courseId,
    courseTitle: lecture.courseTitle || '',
    title: lecture.title_ar || lecture.title_en,
    subtitle: lecture.description_ar || lecture.description_en || '',
    image: resolveApiAssetUrl(lecture.thumbnailUrl),
    price: Number(lecture.price),
    order: lecture.order,
    instructor: lecture.instructor ? {
      name: lecture.instructor.name || lecture.instructorName || '',
      avatar: resolveApiAssetUrl(lecture.instructor.avatar)
    } : undefined,
    subdomain: lecture.subdomain || lecture.instructor?.subdomain || ''
  };
}

/**
 * Instructor related API calls.
 * Returns objects shaped like { data, status, headers } to match existing consumers.
 */

const instructorService = {
  list: async ({ page = 1, limit = 12 } = {}) => {
    const response = await api.get('/tenants/public', { params: { page, limit } });
    return { ...response, data: (response.data.data || []).map(mapTenant), pagination: response.data.pagination };
  },

  get: async (subdomain) => {
    if (!subdomain) throw { message: 'Tenant subdomain is required' };
    const response = await api.get(`/tenants/public/${encodeURIComponent(subdomain)}`);
    return { ...response, data: mapTenant(response.data.data) };
  },

  getCourses: async (instructorId, filters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const response = await api.get(`/instructors/${encodeURIComponent(instructorId)}/courses`, { params });
    return { ...response, data: (response.data.data || []).map(mapCourse) };
  },

  getFeaturedLectures: async (instructorId) => {
    const response = await api.get(`/instructors/${encodeURIComponent(instructorId)}/lectures/featured`);
    return { ...response, data: (response.data.data || []).map(mapLecture) };
  },

  getPublicFeaturedCourses: async () => {
    const response = await api.get('/public/featured-courses');
    return { ...response, data: (response.data.data || []).map(mapCourse) };
  },

  getPublicFeaturedLectures: async () => {
    const response = await api.get('/public/featured-lectures');
    return { ...response, data: (response.data.data || []).map(mapLecture) };
  },

  getCourse: async (instructorId, courseId) => {
    const response = await api.get(`/instructors/${encodeURIComponent(instructorId)}/courses/${encodeURIComponent(courseId)}`);
    return { ...response, data: mapCourse(response.data.data) };
  }
};

export default instructorService;
