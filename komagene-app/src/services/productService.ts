import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export const ProductService = {
    async getProducts(branchId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('branch_id', branchId)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Product[];
    },

    async createProduct(product: Omit<Product, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    async updateProduct(id: string, updates: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
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
    }
};
