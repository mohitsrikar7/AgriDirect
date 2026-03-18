import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user"))
  );

  const [cartCount, setCartCount] = useState(0);

  const login = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    sessionStorage.setItem(
      "roles",
      JSON.stringify(data.user.roles)
    );

    setUser(data.user);
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
