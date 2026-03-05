import axios from "axios";

import { getStoredToken } from "@/lib/auth";

const API_ROOT = `${process.env.REACT_APP_BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API_ROOT,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export const authApi = {
  signup: async (payload) => {
    const response = await apiClient.post("/auth/signup", payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};


export const builderApi = {
  listProjects: async () => {
    const response = await apiClient.get("/website-builder/projects");
    return response.data;
  },
  createProject: async (payload) => {
    const response = await apiClient.post("/website-builder/projects", payload);
    return response.data;
  },
  getProject: async (projectId) => {
    const response = await apiClient.get(`/website-builder/projects/${projectId}`);
    return response.data;
  },
  updateProject: async (projectId, payload) => {
    const response = await apiClient.put(`/website-builder/projects/${projectId}`, payload);
    return response.data;
  },
  deleteProject: async (projectId) => {
    const response = await apiClient.delete(`/website-builder/projects/${projectId}`);
    return response.data;
  },
};