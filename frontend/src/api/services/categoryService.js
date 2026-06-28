import supabase from "../../config/supabaseClient";
import { isDemoMode } from "../../demo/demoConfig";
import { demoCategories } from "../../demo/demoData";

export const categoryService = {
  async getAllCategories() {
    if (isDemoMode()) return demoCategories;

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
    if (isDemoMode()) {
      const cat = { id: Date.now(), categoryId: Date.now(), name, icon: icon || "label", depth: parentId ? 1 : 0, parentId, parent_id: parentId, ticketCount: 0, children: [] };
      demoCategories.push(cat);
      return cat;
    }
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
    if (isDemoMode()) {
      const c = demoCategories.find((x) => String(x.id) === String(id));
      if (c) { c.name = name; if (icon) c.icon = icon; }
      return c;
    }
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
    if (isDemoMode()) {
      const i = demoCategories.findIndex((x) => String(x.id) === String(id));
      if (i >= 0) demoCategories.splice(i, 1);
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export default categoryService;
