const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("cc_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const authApi = {
  requestOtp: (email) => api("/auth/request-otp", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => api("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),
  me: () => api("/auth/me")
};
export const jobsApi = {
  list: (params = "") => api(`/jobs${params ? `?${params}` : ""}`),
  get: (id) => api(`/jobs/${id}`),
  apply: (id, coverLetter = "") => api(`/jobs/${id}/apply`, { method: "POST", body: JSON.stringify({ coverLetter }) })
};
export const applicationsApi = {
  list: () => api("/applications")
};
export const profileApi = {
  get: () => api("/profile"),
  update: (profile) => api("/profile", { method: "PUT", body: JSON.stringify(profile) })
};
export const notificationsApi = {
  list: () => api("/notifications"),
  readAll: () => api("/notifications/read-all", { method: "PATCH" })
};
export const assistantApi = {
  chat: (message) => api("/assistant/chat", { method: "POST", body: JSON.stringify({ message }) })
};
