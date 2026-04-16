import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import axios from 'axios';

interface Project { id: string; name: string; color: string; }
interface Column { id: string; title: string; tasks: string[]; projectId: string; }

export default function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const { data: projectData } = await api.get('/projects');
        setProjects(projectData);
        if (projectData.length > 0) {
          // Select the first project by default
          setSelectedProjectId(projectData[0].id);
        }
      } catch (e) {
        setError('Erreur chargement projets');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchColumns() {
      if (!selectedProjectId) {
        setColumns([]); // No project selected, clear columns
        return;
      }
      // setLoading(true); // Optional: show loading state for columns specifically
      try {
        const { data: columnData } = await api.get(`/columns?projectId=${selectedProjectId}`);
        setColumns(columnData);
      } catch (e) {
        setError('Erreur chargement colonnes');
        console.error(e);
      } finally {
        // setLoading(false);
      }
    }
    fetchColumns();
  }, [selectedProjectId]);


  const selectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  async function addProject(name: string, color: string) {
    setError(null);
    try {
      const { data } = await api.post('/projects', { name, color });
      setProjects(prev => [...prev, data]);
      // Optionally select the new project
      setSelectedProjectId(data.id);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(`Erreur: ${err.response?.status}`);
    }
  }

  async function renameProject(project: Project) {
    const newName = prompt('Nouveau nom :', project.name);
    if (!newName || newName === project.name) return;
    try {
      const { data } = await api.put(`/projects/${project.id}`, {
        ...project, name: newName,
      });
      setProjects(prev => prev.map(p => p.id === data.id ? data : p));
    } catch (err) {
      if (axios.isAxiosError(err)) setError(`Erreur: ${err.response?.status}`);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Êtes-vous sûr ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => {
        const remainingProjects = prev.filter(p => p.id !== id);
        // If the deleted project was selected, select the first of the remaining
        if (selectedProjectId === id) {
          setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
        return remainingProjects;
      });
    } catch (err) {
      if (axios.isAxiosError(err)) setError(`Erreur: ${err.response?.status}`);
    }
  }

  return { projects, columns, loading, error, addProject, renameProject, deleteProject, selectProject, selectedProjectId };
}
