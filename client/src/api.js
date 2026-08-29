const API_URL = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("cc_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

/* =========================
   AUTH API
========================= */

export const authApi = {
  requestOtp(email) {
    return request("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp(email, otp) {
    return request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  me() {
    return request("/auth/me");
  },
};

/* =========================
   JOBS API
========================= */

export const jobsApi = {
  getAll(params = {}) {
    const query = new URLSearchParams();

    if (params.search) query.append("search", params.search);
    if (params.mode) query.append("mode", params.mode);
    if (params.type) query.append("type", params.type);
    if (params.sort) query.append("sort", params.sort);

    const queryString = query.toString();

    return request(`/jobs${queryString ? `?${queryString}` : ""}`);
  },

  getById(id) {
    return request(`/jobs/${id}`);
  },

  apply(id, coverLetter = "") {
    return request(`/jobs/${id}/apply`, {
      method: "POST",
      body: JSON.stringify({ coverLetter }),
    });
  },

  getRecommended() {
    return request("/jobs/recommended");
  },
};

/* =========================
   APPLICATIONS API
========================= */

export const applicationsApi = {
  getAll() {
    return request("/applications");
  },
};

/* =========================
   PROFILE API
========================= */

export const profileApi = {
  get() {
    return request("/profile");
  },

  update(profileData) {
    return request("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

/* =========================
   SAVED JOBS API
========================= */

export const savedJobsApi = {
  getAll() {
    return request("/saved-jobs");
  },

  save(jobId) {
    return request("/saved-jobs", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    });
  },

  remove(jobId) {
    return request(`/saved-jobs/${jobId}`, {
      method: "DELETE",
    });
  },
};

/* =========================
   NOTIFICATIONS API
========================= */

export const notificationsApi = {
  getAll() {
    return request("/notifications");
  },

  markAllAsRead() {
    return request("/notifications/read-all", {
      method: "PATCH",
    });
  },
};

/* =========================
   AI ASSISTANT API
========================= */

export const assistantApi = {
  chat(message) {
    return request("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};

/* =========================
   MODULE 7 - INTERVIEW PREP API
========================= */

export const interviewApi = {
  getQuestion(jobId) {
    return request(`/interview/questions?jobId=${encodeURIComponent(jobId)}`);
  },

  evaluate(payload) {
    return request("/interview/evaluate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

/* =========================
   HEALTH CHECK
========================= */


/* =========================
   MODULE 8 - CAREER INSIGHTS API
========================= */

export const careerInsightsApi = {
  get() {
    return request("/career-insights");
  },
};
export const healthApi = {
  check() {
    return request("/health");
  },
};
