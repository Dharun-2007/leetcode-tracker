"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const storedUserId =
          typeof window !== "undefined"
            ? window.localStorage.getItem("lc_tracker_user_id")
            : null;
        if (storedUserId) {
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", storedUserId)
            .single();
          if (user && !error) setCurrentUser(user);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setInitialized(true);
      }
    }
    init();
  }, []);

  const login = async (loginId, password) => {
    try {
      let emailForAuth = loginId;
      if (!loginId.includes('@')) {
        const { data: users } = await supabase
          .from('users')
          .select('email')
          .or(`roll_number.eq.${loginId},leetcode_username.eq.${loginId}`);
        if (users && users.length > 0) {
          emailForAuth = users[0].email;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password,
      });

      if (authError) {
        return { ok: false, message: "Invalid login credentials. Please check your password." };
      }

      // Fetch custom user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailForAuth)
        .single();

      if (userError || !user) {
        return { ok: false, message: "User profile not found. It may be pending admin approval." };
      }

      setCurrentUser(user);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lc_tracker_user_id", user.id);
      }
      return { ok: true, user };
    } catch (err) {
      console.error(err);
      return { ok: false, message: "An error occurred during login." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("lc_tracker_user_id");
    }
    supabase.auth.signOut().catch(console.error);
  };

  const registerRequest = async (formData) => {
    try {
      // 1. Send password directly to Supabase Auth ONLY
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      // User might already exist in Supabase auth, but that's fine. 
      // If error is something else, throw it.
      if (authError && authError.message !== "User already registered") {
        throw authError;
      }

      // 2. Insert into account_requests (NO password stored)
      const { data, error } = await supabase
        .from("account_requests")
        .insert([{
          name: formData.name,
          roll_number: formData.roll_number || null,
          email: formData.email,
          role: "student",
          leetcode_username: formData.leetcode_username || null,
          status: "pending",
        }])
        .select();
      if (error) throw error;
      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  // Admin: refresh user profile from DB
  const refreshUser = async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase.from("users").select("*").eq("id", currentUser.id).single();
    if (data) setCurrentUser(data);
  };

  const value = { currentUser, initialized, login, logout, registerRequest, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
