import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSGetOne } from '@/modules/pos/types';

export interface CartItem {
	product: POSGetOne;
	quantity: number;
}

interface CartStore {
	items: CartItem[];
	addItem: (product: POSGetOne) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (product) => {
				set((state) => {
					const existing = state.items.find((i) => i.product.id === product.id);
					if (existing) {
						return {
							items: state.items.map((i) =>
								i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
							),
						};
					}
					return { items: [...state.items, { product, quantity: 1 }] };
				});
			},

			removeItem: (productId) => {
				set((state) => ({
					items: state.items.filter((i) => i.product.id !== productId),
				}));
			},

			updateQuantity: (productId, quantity) => {
				if (quantity < 1) {
					get().removeItem(productId);
					return;
				}
				set((state) => ({
					items: state.items.map((i) =>
						i.product.id === productId ? { ...i, quantity } : i
					),
				}));
			},

			clearCart: () => set({ items: [] }),

			subtotal: () => {
				return get().items.reduce(
					(sum, i) => sum + Number(i.product.price) * i.quantity,
					0
				);
			},
		}),
		{ name: 'pos-cart', version: 2 }
	)
);
