import supabase from "../../config/supabaseClient";

export const categoryService = {
  async getAllCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("depth")
      .order("id");
    if (error) throw new Error(error.message);

    // 계층 구조로 변환
    const roots = data.filter((c) => c.depth === 0);
    return roots.map((root) => ({
      ...root,
      children: data.filter((c) => c.parent_id === root.id),
    }));
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async createCategory({ name, icon, parentId = null }) {
    const depth = parentId ? 1 : 0;
    const payload = { name, parent_id: parentId, depth };
    if (icon) payload.icon = icon;
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateCategory(id, { name, icon }) {
    const payload = { name };
    if (icon) payload.icon = icon;
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteCategory(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export default categoryService;
