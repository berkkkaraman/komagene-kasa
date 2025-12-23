import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BasketItem, Product, Category } from '@/types';

interface PosState {
    basket: BasketItem[];
    categories: Category[];
    products: Product[];
    activeCategoryId: string | null;
    searchQuery: string;

    // Actions
    setCategories: (categories: Category[]) => void;
    setProducts: (products: Product[]) => void;
    setActiveCategory: (id: string | null) => void;
    setSearchQuery: (query: string) => void;

    addToBasket: (product: Product, quantity?: number, variants?: any[]) => void; // variants type to be refined
    removeFromBasket: (index: number) => void;
    updateBasketItemQuantity: (index: number, delta: number) => void;
    clearBasket: () => void;

    // Computed (helper)
    getBasketTotal: () => number;
}

export const usePosStore = create<PosState>()(
    persist(
        (set, get) => ({
            basket: [],
            categories: [],
            products: [],
            activeCategoryId: null,
            searchQuery: '',

            setCategories: (categories) => set({ categories }),
            setProducts: (products) => set({ products }),
            setActiveCategory: (id) => set({ activeCategoryId: id }),
            setSearchQuery: (query) => set({ searchQuery: query }),

            addToBasket: (product, quantity = 1, variants = []) => {
                const currentBasket = get().basket;
                const basePrice = product.price;
                const variantPrice = variants.reduce((acc, v) => acc + v.price_adjustment, 0);
                const unitPrice = basePrice + variantPrice;

                // Simple 'same product' check - can be enhanced for deep variant comparison
                const existingItemIndex = currentBasket.findIndex(
                    item => item.product.id === product.id &&
                        JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
                );

                if (existingItemIndex > -1) {
                    const newBasket = [...currentBasket];
                    newBasket[existingItemIndex].quantity += quantity;
                    newBasket[existingItemIndex].totalPrice = newBasket[existingItemIndex].quantity * unitPrice;
                    set({ basket: newBasket });
                } else {
                    const newItem: BasketItem = {
                        product,
                        quantity,
                        selectedVariants: variants,
                        totalPrice: quantity * unitPrice
                    };
                    set({ basket: [...currentBasket, newItem] });
                }
            },

            removeFromBasket: (index) => {
                const newBasket = [...get().basket];
                newBasket.splice(index, 1);
                set({ basket: newBasket });
            },

            updateBasketItemQuantity: (index, delta) => {
                const newBasket = [...get().basket];
                const item = newBasket[index];
                const newQuantity = item.quantity + delta;

                if (newQuantity <= 0) {
                    newBasket.splice(index, 1);
                } else {
                    const unitPrice = item.totalPrice / item.quantity;
                    item.quantity = newQuantity;
                    item.totalPrice = newQuantity * unitPrice;
                }
                set({ basket: newBasket });
            },

            clearBasket: () => set({ basket: [] }),

            getBasketTotal: () => {
                return get().basket.reduce((acc, item) => acc + item.totalPrice, 0);
            }
        }),
        {
            name: 'gunkasa-pos-storage',
            partialize: (state) => ({ basket: state.basket }), // Only persist basket
        }
    )
);
