// src/contexts/InstructorContext.jsx
import React, { createContext, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import instructorService from '../services/instructorService';

export const InstructorContext = createContext({
  instructors: [],
  selected: null,
  loading: false,
  fetchInstructors: async () => {},
  selectInstructor: () => {},
});

export function InstructorProvider({ children }) {
  const [instructors, setInstructors] = useState([]);
  const [selected, setSelected] = useState(() => {
    try {
      const raw = localStorage.getItem('mp_selected_instructor');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchInstructors = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const res = await instructorService.list(opts);
      setInstructors(res.data || []);
      setLoading(false);
      return res.data || [];
    } catch (err) {
      setLoading(false);
      return [];
    }
  }, []);

  const selectInstructor = useCallback((instructor) => {
    setSelected(instructor || null);
    if (instructor) localStorage.setItem('mp_selected_instructor', JSON.stringify(instructor));
    else localStorage.removeItem('mp_selected_instructor');
  }, []);

  useEffect(() => {
    // TODO: this safely serves mock tenant data until the backend provides a
    // public active-tenant listing endpoint. Do not substitute the protected
    // /super-admin/tenants endpoint here.
    fetchInstructors();
  }, [fetchInstructors]);

  return (
    <InstructorContext.Provider
      value={{
        instructors,
        selected,
        loading,
        fetchInstructors,
        selectInstructor,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

InstructorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
