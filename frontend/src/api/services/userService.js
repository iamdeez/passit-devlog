import supabase from "../../config/supabaseClient";

export const userService = {
  async getMe() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("인증 정보가 없습니다");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateMe(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async uploadProfileImage(file) {
    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/profile.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(path, file, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage.from("profile-images").getPublicUrl(path);

    await supabase.from("profiles").update({ profile_image_url: publicUrl }).eq("id", user.id);
    return publicUrl;
  },

  async deleteAccount() {
    // Edge Function으로 계정 삭제 위임 (service role 필요)
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error("계정 삭제에 실패했습니다");
    await supabase.auth.signOut();
  },
};

export default userService;
