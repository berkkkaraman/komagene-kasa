import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types";

export const productService = {
    async fetchCategories(branchId: string) {
        if (!branchId) return [];
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('branch_id', branchId)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error("❌ Kategori Çekme Hatası:", error);
            return [];
        }
        return (data || []) as Category[];
    },

    async fetchProducts(branchId: string) {
        if (!branchId) return [];
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                variants:product_variants(*)
            `)
            .eq('branch_id', branchId)
            .eq('is_active', true);

        if (error) {
            console.error("❌ Ürün Çekme Hatası:", error);
            return [];
        }
        return (data || []) as Product[];
    },

    async saveProduct(product: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .upsert({
                ...product,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
