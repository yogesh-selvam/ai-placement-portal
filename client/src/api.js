import { auth } from "./firebase";
import { onIdTokenChanged } from "firebase/auth";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

// Keep localStorage token synchronized with Firebase.
onIdTokenChanged(auth, async (user) => {
  try {
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem("cc_token", token);
    } else {
      localStorage.removeItem("cc_token");
    }
  } catch (error) {
    console.error("Unable to sync Firebase token:", error);
    localStorage.removeItem("cc_token");
  }
});

async function request(path, options = {}) {
  const currentUser = auth.currentUser;

  let token = localStorage.getItem("cc_token");

  // Get a fresh Firebase ID token when a user is signed in.
  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
      localStorage.setItem("cc_token", token);
    } catch (error) {
      console.error("Unable to get Firebase ID token:", error);
      localStorage.removeItem("cc_token");
      token = null;
    }
  }

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the CareerConnect server."
    );
  }

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("cc_token");
    }

    throw new Error(
      data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

/* =========================
   AUTH API
========================= */

export const authApi = {
  async register(email, password) {
    const { createUserWithEmailAndPassword } =
      await import("firebase/auth");

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

    const token = await credential.user.getIdToken();

    localStorage.setItem("cc_token", token);

    return {
      user: credential.user,
      token,
    };
  },

  async login(email, password) {
    const { signInWithEmailAndPassword } =
      await import("firebase/auth");

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

    const token = await credential.user.getIdToken();

    localStorage.setItem("cc_token", token);

    return {
      user: credential.user,
      token,
    };
  },

  async logout() {
    const { signOut } = await import("firebase/auth");

    await signOut(auth);
    localStorage.removeItem("cc_token");
  },

  me() {
    return request("/auth/me");
  },
};

/* =========================
   JOBS API
========================= */

export const jobsApi = {
  getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.type) params.set("type", filters.type);
    if (filters.sort) params.set("sort", filters.sort);

    const query = params.toString();

    return request(
      `/jobs${query ? `?${query}` : ""}`
    );
  },

  getRecommended() {
    return request("/jobs/recommended");
  },

  getById(id) {
    const jobId = Number(id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return Promise.reject(
        new Error("Invalid job ID")
      );
    }

    return request(`/jobs/${jobId}`);
  },

  apply(id, coverLetter = "", resumeUsed = null) {
    const jobId = Number(id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return Promise.reject(
        new Error("Invalid job ID")
      );
    }

    return request(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify({
        coverLetter,
        resumeUsed,
      }),
    });
  },
};

/* =========================
   APPLICATIONS API
========================= */

export const applicationsApi = {
  getAll() {
    return request("/applications");
  },

  getById(id) {
    const applicationId = Number(id);

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      return Promise.reject(
        new Error("Invalid application ID")
      );
    }

    return request(`/applications/${applicationId}`);
  },

  updateStatus(id, status, note = "") {
    const applicationId = Number(id);

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      return Promise.reject(
        new Error("Invalid application ID")
      );
    }

    return request(
      `/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note,
        }),
      }
    );
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
      body: JSON.stringify({
        jobId: Number(jobId),
      }),
    });
  },

  remove(jobId) {
    return request(
      `/saved-jobs/${Number(jobId)}`,
      {
        method: "DELETE",
      }
    );
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
   OPTIONAL MODULE APIs
========================= */

export const interviewApi = {
  getQuestion(jobId) {
    return request(
      `/interview/questions?jobId=${encodeURIComponent(
        jobId
      )}`
    );
  },

  evaluate(payload) {
    return request("/interview/evaluate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

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