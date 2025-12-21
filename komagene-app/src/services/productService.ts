import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export const productService = {
    async fetchProducts(branchId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('branch_id', branchId)
            .order('category', { ascending: true });

        if (error) throw error;
        return data as Product[];
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
