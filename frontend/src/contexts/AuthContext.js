import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import supabase from "../config/supabaseClient";
import { API_SERVICES } from "../config/apiConfig";
import { ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const buildUser = useCallback(async (authUser) => {
    if (!authUser) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, role, status, profile_image_url, phone, provider")
      .eq("id", authUser.id)
      .single();
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name ?? "",
      nickname: profile?.nickname ?? "",
      role: profile?.role ?? "USER",
      status: profile?.status ?? "ACTIVE",
      profileImageUrl: profile?.profile_image_url ?? null,
      phone: profile?.phone ?? null,
      provider: profile?.provider ?? authUser.app_metadata?.provider ?? "email",
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const built = await buildUser(session.user);
        setUser(built);
        setIsAuthenticated(true);
      } else {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const built = await buildUser(session.user);
          setUser(built);
          setIsAuthenticated(true);
        } else {
          const storedToken = localStorage.getItem("token");
          const storedUser = localStorage.getItem("user");
          if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [buildUser]);

  const login = useCallback(async (email, password) => {
    // 1) Supabase 로그인 시도 (일반 사용자)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const built = await buildUser(data.user);
      return { success: true, user: built };
    }

    // 2) Supabase 실패 시 백엔드 로그인 시도 (관리자 등 백엔드 전용 계정)
    try {
      const res = await axios.post(`${API_SERVICES.ACCOUNT}/api/auth/login`, { email, password });
      const loginData = res.data?.data;
      if (!loginData?.accessToken) throw new Error("토큰 없음");

      const backendUser = {
        id: loginData.userId,
        email: loginData.email,
        name: loginData.name ?? "",
        nickname: loginData.name ?? "",
        role: loginData.role ?? "USER",
        status: "ACTIVE",
        profileImageUrl: null,
        phone: null,
        provider: loginData.provider ?? "email",
      };

      localStorage.setItem("token", loginData.accessToken);
      localStorage.setItem("refreshToken", loginData.refreshToken);
      localStorage.setItem("user", JSON.stringify(backendUser));
      setUser(backendUser);
      setIsAuthenticated(true);

      return { success: true, user: backendUser };
    } catch {
      return { success: false, error: error.message };
    }
  }, [buildUser]);

  const signup = useCallback(async ({ email, password, name, nickname, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { success: false, error: error.message };

    // profiles에 추가 정보 저장
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        name,
        nickname,
        phone,
      });
    }
    return { success: true, data };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const updateUser = useCallback(async (updates) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (!error) {
      setUser((prev) => ({ ...prev, ...updates }));
    }
    return { success: !error, error: error?.message };
  }, [user]);

  const getKakaoLoginUrl = useCallback(() => {
    return `${API_SERVICES.ACCOUNT}${ENDPOINTS.AUTH.KAKAO}`;
  }, []);

  const handleKakaoCallback = useCallback((token, refreshToken, userId, email, name, provider) => {
    if (!token || !refreshToken || !userId || !email) {
      return { success: false, error: "카카오 로그인 정보가 부족합니다" };
    }

    const kakaoUser = {
      id: Number(userId),
      email,
      name: name || "",
      nickname: name || "",
      role: "USER",
      status: "ACTIVE",
      profileImageUrl: null,
      phone: null,
      provider: provider || "KAKAO",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(kakaoUser));
    setUser(kakaoUser);
    setIsAuthenticated(true);

    return { success: true, user: kakaoUser };
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const value = {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateUser,
    getKakaoLoginUrl,
    handleKakaoCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
