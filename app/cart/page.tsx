"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiTrash, FiPlus, FiMinus } from "react-icons/fi";

interface Outfit {
    id: string;
    image: string;
    name: string;
    brand: string;
    details: string;
    otherImages: string[];
    price: number;
}

interface CartItem {
    outfit: Outfit;
    quantity: number;
    rentDate?: string | null;
    returnDate?: string | null;
    isAvailable?: boolean;
    frequently?: number;
    size?: string;
    color?: string;
}

const getCartItemsFromLocalStorage = (): CartItem[] => {
    try {
        const storedCartItemsWithDetails = localStorage.getItem("cartItemsWithDetails");
        if (storedCartItemsWithDetails) {
            const parsedItems: Record<string, CartItem> = JSON.parse(storedCartItemsWithDetails);
            return Object.values(parsedItems).map((item) => ({
                outfit: item.outfit,
                quantity: item.quantity,
                rentDate: null,
                returnDate: null,
                isAvailable: true,
                frequently: item.frequently || 0,
                size: item.size,
                color: item.color,
            }));
        }
        return [];
    } catch (error) {
        console.error("Error getting cart items from local storage:", error);
        return [];
    }
};

const saveCartItemsToLocalStorage = (items: CartItem[]) => {
    try {
        const dataToStore: Record<string, Omit<CartItem, 'rentDate' | 'returnDate' | 'isAvailable'>> = items.reduce(
            (acc, item) => {
                const key = `${item.outfit.id}-${item.size}-${item.color}`;
                acc[key] = {
                    outfit: item.outfit,
                    quantity: item.quantity,
                    frequently: item.frequently || 0,
                    size: item.size,
                    color: item.color,
                };
                return acc;
            },
            {} as Record<string, Omit<CartItem, 'rentDate' | 'returnDate' | 'isAvailable'>>
        );
        localStorage.setItem("cartItemsWithDetails", JSON.stringify(dataToStore));
    } catch (error) {
        console.error("Error saving cart items to local storage:", error);
    }
};

// ส่วนอื่นๆ ของ CartPage เหมือนเดิม


export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>(getCartItemsFromLocalStorage());
    const [globalRentDate, setGlobalRentDate] = useState<string | null>(null);
    const [globalReturnDate, setGlobalReturnDate] = useState<string | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [allAvailable, setAllAvailable] = useState(false);

    useEffect(() => {
        localStorage.removeItem("cartItemsWithDates");
        localStorage.removeItem("cartItems");
    }, []);

    useEffect(() => {
        saveCartItemsToLocalStorage(cartItems);
    }, [cartItems]);

    const removeFromCart = (id: string, size?: string, color?: string) => {
        const updatedCart = cartItems.filter(
            (item) => item.outfit.id !== id || item.size !== size || item.color !== color
        );
        setCartItems(updatedCart);
    };

    const increaseQuantity = (id: string, size?: string, color?: string) => {
        const updatedCart = cartItems.map((item) =>
            item.outfit.id === id && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
        setCartItems(updatedCart);
    };

    const decreaseQuantity = (id: string, size?: string, color?: string) => {
        const updatedCart = cartItems
            .map((item) =>
                item.outfit.id === id && item.size === size && item.color === color
                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                    : item
            )
            .filter((item) => item.quantity > 0);
        setCartItems(updatedCart);
    };

    const handleGlobalRentDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalRentDate(e.target.value);
    };

    const handleGlobalReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalReturnDate(e.target.value);
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.outfit.price * item.quantity, 0);
    };

    const handleCheckAvailability = async () => {
        if (globalRentDate && globalReturnDate) {
            setIsCheckingAvailability(true);
            const availabilityResults = await Promise.all(
                cartItems.map(async (item) => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const isAvailableMock = Math.random() > 0.2;
                    return { ...item, isAvailable: isAvailableMock };
                })
            );
            setCartItems(availabilityResults);
            setAllAvailable(availabilityResults.every((item) => item.isAvailable));
            setIsCheckingAvailability(false);
        } else {
            alert("โปรดระบุวันที่เช่าและวันที่คืน");
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 py-8">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
                <h1 className="text-3xl font-bold mb-6 text-pink-600 text-center">🛒 ตะกร้าสินค้า</h1>

                <div className="mb-6 p-4 bg-pink-100 rounded-xl shadow-inner">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">ระบุวันที่เช่าและคืน</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                            <label htmlFor="globalRentDate" className="block text-gray-600 text-sm font-bold mb-2">
                                วันที่เช่า:
                            </label>
                            <input
                                type="date"
                                id="globalRentDate"
                                className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                onChange={handleGlobalRentDateChange}
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <label htmlFor="globalReturnDate" className="block text-gray-600 text-sm font-bold mb-2">
                                วันที่คืน:
                            </label>
                            <input
                                type="date"
                                id="globalReturnDate"
                                className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                onChange={handleGlobalReturnDateChange}
                            />
                        </div>
                    </div>
                </div>

                <ul>
                    {cartItems.map((cartItem) => (
                        <li
                            key={`${cartItem.outfit.id}-${cartItem.size}-${cartItem.color}`}
                            className={`flex flex-col md:flex-row items-center gap-4 p-4 mb-4 rounded-xl shadow-md bg-white border ${
                                cartItem.isAvailable === false ? "bg-red-100 border-red-400" : "border-pink-200"
                            }`}
                        >
                            <img
                                src={cartItem.outfit.image}
                                alt={cartItem.outfit.name}
                                className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="font-semibold text-gray-800">{cartItem.outfit.name}</h3>
                                <p className="text-gray-600 text-sm">{cartItem.outfit.brand}</p>
                                <p className="text-pink-700 font-semibold">฿ {cartItem.outfit.price}</p>
                                {cartItem.size && <p className="text-gray-500 text-sm">ขนาด: {cartItem.size}</p>}
                                {cartItem.color && (
                                    <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                                        <span className="text-gray-500 text-sm">สี:</span>
                                        <div
                                            className="w-4 h-4 rounded-md shadow-sm border"
                                            style={{ backgroundColor: cartItem.color }}
                                        />
                                    </div>
                                )}
                                {cartItem.isAvailable === false && (
                                    <p className="text-red-600 font-semibold mt-1">ไม่ว่างในวันที่เลือก</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => decreaseQuantity(cartItem.outfit.id, cartItem.size, cartItem.color)}
                                    className="bg-pink-200 text-white p-2 rounded hover:bg-pink-300"
                                >
                                    <FiMinus />
                                </button>
                                <span className="text-lg text-gray-800">{cartItem.quantity}</span>
                                <button
                                    onClick={() => increaseQuantity(cartItem.outfit.id, cartItem.size, cartItem.color)}
                                    className="bg-pink-500 text-white p-2 rounded hover:bg-pink-600"
                                >
                                    <FiPlus />
                                </button>
                                <button
                                    onClick={() => removeFromCart(cartItem.outfit.id, cartItem.size, cartItem.color)}
                                    className="bg-red-400 text-white p-2 rounded hover:bg-red-500"
                                >
                                    <FiTrash />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-semibold text-gray-800">ยอดรวม: ฿ {calculateTotalPrice()}</h2>
                        {globalRentDate && globalReturnDate ? (
                            <p className="text-gray-600 text-sm mt-1">
                                วันที่เช่า: {globalRentDate}, วันที่คืน: {globalReturnDate}
                            </p>
                        ) : (
                            <p className="text-gray-600 text-sm mt-1">โปรดระบุวันที่เช่าและวันที่คืน</p>
                        )}
                    </div>
                    {allAvailable && cartItems.length > 0 ? (
                        <Link
                            href={{
                                pathname: '/checkout',
                                query: {
                                    cartItems: JSON.stringify(cartItems), // ส่งข้อมูลตะกร้า
                                    rentDate: globalRentDate,               // ส่งวันที่เช่า
                                    returnDate: globalReturnDate           // ส่งวันที่คืน
                                },
                            }}
                        >
                            <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition shadow-md">
                                ไปยังหน้าชำระเงิน
                            </button>
                        </Link>

                    ) : (
                        <button
                            onClick={handleCheckAvailability}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md"
                            disabled={!globalRentDate || !globalReturnDate || isCheckingAvailability}
                        >
                            {isCheckingAvailability ? "กำลังตรวจสอบ..." : "ตรวจสอบวันว่าง"}
                        </button>
                    )}

                </div>

                <div className="mt-4 text-center">
                    <Link href="/">
                        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition">
                            กลับไปเลือกสินค้าต่อ
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
