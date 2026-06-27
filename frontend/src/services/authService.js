import supabase from "../config/supabaseClient";
import { API_SERVICES } from "../config/apiConfig";
import { ENDPOINTS } from "../api/endpoints";

class AuthService {
  async signup({ email, password, name, nickname, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        name,
        nickname,
        phone,
      });
    }
    return data;
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  getKakaoLoginUrl() {
    return `${API_SERVICES.ACCOUNT}${ENDPOINTS.AUTH.KAKAO}`;
  }
}

export default new AuthService();
