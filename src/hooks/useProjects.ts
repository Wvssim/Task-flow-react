import { useReducer, useEffect, useCallback } from "react";
import api from "../api/axios";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  color: string;
}
interface Column {
  id: string;
  title: string;
  tasks: string[];
  projectId: string;
}

interface State {
  projects: Project[];
  columns: Column[];
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_PROJECTS_START" }
  | { type: "FETCH_PROJECTS_SUCCESS"; payload: Project[] }
  | { type: "FETCH_PROJECTS_FAILURE"; payload: string }
  | { type: "FETCH_COLUMNS_SUCCESS"; payload: Column[] }
  | { type: "FETCH_COLUMNS_FAILURE"; payload: string }
  | { type: "SELECT_PROJECT"; payload: string | null }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: State = {
  projects: [],
  columns: [],
  selectedProjectId: null,
  loading: true,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_PROJECTS_START":
      return { ...state, loading: true };
    case "FETCH_PROJECTS_SUCCESS":
      return {
        ...state,
        loading: false,
        projects: action.payload,
        selectedProjectId:
          action.payload.length > 0 ? action.payload[0].id : null,
      };
    case "FETCH_PROJECTS_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "FETCH_COLUMNS_SUCCESS":
      return { ...state, columns: action.payload };
    case "FETCH_COLUMNS_FAILURE":
      return { ...state, error: action.payload };
    case "SELECT_PROJECT":
      return { ...state, selectedProjectId: action.payload };
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case "DELETE_PROJECT": {
      const remaining = state.projects.filter((p) => p.id !== action.payload);
      return {
        ...state,
        projects: remaining,
        selectedProjectId:
          state.selectedProjectId === action.payload
            ? remaining.length > 0
              ? remaining[0].id
              : null
            : state.selectedProjectId,
      };
    }
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function useProjects() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchProjects() {
      dispatch({ type: "FETCH_PROJECTS_START" });
      try {
        const { data } = await api.get("/projects");
        dispatch({ type: "FETCH_PROJECTS_SUCCESS", payload: data });
      } catch (e) {
        dispatch({
          type: "FETCH_PROJECTS_FAILURE",
          payload: "Erreur chargement projets",
        });
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchColumns() {
      if (!state.selectedProjectId) {
        dispatch({ type: "FETCH_COLUMNS_SUCCESS", payload: [] });
        return;
      }
      try {
        const { data } = await api.get(
          `/columns?projectId=${state.selectedProjectId}`,
        );
        dispatch({ type: "FETCH_COLUMNS_SUCCESS", payload: data });
      } catch (e) {
        dispatch({
          type: "FETCH_COLUMNS_FAILURE",
          payload: "Erreur chargement colonnes",
        });
        console.error(e);
      }
    }
    fetchColumns();
  }, [state.selectedProjectId]);

  const selectProject = useCallback((id: string) => {
    dispatch({ type: "SELECT_PROJECT", payload: id });
  }, []);

  async function addProject(name: string, color: string) {
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const { data } = await api.post("/projects", { name, color });
      dispatch({ type: "ADD_PROJECT", payload: data });
      dispatch({ type: "SELECT_PROJECT", payload: data.id });
    } catch (err) {
      if (axios.isAxiosError(err))
        dispatch({
          type: "SET_ERROR",
          payload: `Erreur: ${err.response?.status}`,
        });
    }
  }

  async function renameProject(project: Project) {
    const newName = prompt("Nouveau nom :", project.name);
    if (!newName || newName === project.name) return;
    try {
      const { data } = await api.put(`/projects/${project.id}`, {
        ...project,
        name: newName,
      });
      dispatch({ type: "UPDATE_PROJECT", payload: data });
    } catch (err) {
      if (axios.isAxiosError(err))
        dispatch({
          type: "SET_ERROR",
          payload: `Erreur: ${err.response?.status}`,
        });
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Êtes-vous sûr ?")) return;
    try {
      await api.delete(`/projects/${id}`);
      dispatch({ type: "DELETE_PROJECT", payload: id });
    } catch (err) {
      if (axios.isAxiosError(err))
        dispatch({
          type: "SET_ERROR",
          payload: `Erreur: ${err.response?.status}`,
        });
    }
  }

  return {
    ...state,
    selectProject,
    addProject,
    renameProject,
    deleteProject,
  };
}
