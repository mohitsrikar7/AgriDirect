import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Build a user-specific storage key
    const storageKey = user ? `agri_cart_${user._id || user.email}` : null;

    const [cart, setCart] = useState(() => {
        if (!storageKey) return [];
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist cart to localStorage on every change
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(cart));
        }
    }, [cart, storageKey]);

    // Reload cart when user changes (login/logout)
    useEffect(() => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                setCart(saved ? JSON.parse(saved) : []);
            } catch {
                setCart([]);
            }
        } else {
            setCart([]);
        }
    }, [storageKey]);

    /* ── Cart Operations ── */

    const addToCart = (item) => {
        setCart((prev) => {
            const exists = prev.find((i) => i._id === item._id);
            if (exists) return prev; // Already in cart
            return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item._id !== id));
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item._id === id
                    ? { ...item, quantity: Math.min(newQty, item.availableStock || 9999) }
                    : item
            )
        );
    };

    const increaseQuantity = (id) => {
        setCart((prev) =>
            prev.map((item) =>
                item._id === id && item.quantity < (item.availableStock || 9999)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart((prev) =>
            prev.map((item) =>
                item._id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        if (storageKey) localStorage.removeItem(storageKey);
    };

    const isInCart = (id) => cart.some((item) => item._id === id);

    /* ── Computed Values ── */
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartItemsCount = cart.length; // unique items

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                isInCart,
                cartCount,
                cartTotal,
                cartItemsCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
