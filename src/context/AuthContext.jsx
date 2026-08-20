import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("safecity_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(email, role = "citizen") {
    const fakeUser = { name: email.split("@")[0], email, role };
    sessionStorage.setItem("safecity_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    return fakeUser;
  }

  function register(name, email) {
    const fakeUser = { name, email, role: "citizen" };
    sessionStorage.setItem("safecity_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    return fakeUser;
  }

  function updateProfile(fields) {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      sessionStorage.setItem("safecity_user", JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    sessionStorage.removeItem("safecity_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
