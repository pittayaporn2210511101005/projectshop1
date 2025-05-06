"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Outfit {
    id: string;
    image: string;
    name: string;
    brand: string;
    price: number;
    sizes: string[];
    colors?: string[];
    status?: "ใหม่" | "ลดราคา";
    otherImages?: string[];
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

const outfitsData: Outfit[] = [
    {
        id: "1",
        image: "https://cdn.wconcept.com/products/resize/632x843/migration/i/imgpin.wconceptusa.com/18647a1de60/36fd7/44/s0dWLfWXStJlYnd3qU-kFgkr0HA.png",
        name: "ชุดสบายๆ วันหยุด",
        brand: "แบรนด์ X",
        price: 990,
        sizes: ["S", "M"],
        status: "ใหม่",
        colors: ["#FADCDC", "#92CEA8", "#E8CFF8"],
        otherImages: [
            "https://via.placeholder.com/600/333333/FFFFFF?Text=Image+2_1",
            "https://via.placeholder.com/600/555555/FFFFFF?Text=Image+3_1",
        ],
    },
    {
        id: "2",
        image: "https://cdn.wconcept.com/products/resize/632x843/migration/i/imgpin.wconceptusa.com/18647a1de60/26839/49/pE2IPlnI73EQ0pkY49OH1bw9XqM.png",
        name: "ชุดทำงานสุดหรู",
        brand: "แบรนด์ Y",
        price: 1590,
        sizes: ["M", "L"],
        status: "ลดราคา",
        colors: ["#F898A4"],
        otherImages: [
            "https://via.placeholder.com/600/777777/FFFFFF?Text=Image+2_2",
            "https://via.placeholder.com/600/999999/FFFFFF?Text=Image+3_2",
        ],
    }


];

export default function ProductDetailPage() {
    const { id } = useParams();
    const outfit = outfitsData.find((item) => item.id === id);
    const [selectedSize, setSelectedSize] = useState<string | undefined>();
    const [selectedColor, setSelectedColor] = useState<string | undefined>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddToCart = () => {
        if (outfit && selectedSize && selectedColor) {
            const cartItemToAdd: CartItem = {
                outfit: outfit,
                quantity: 1,
                size: selectedSize,
                color: selectedColor,
            };

            const storedCart = localStorage.getItem("cartItemsWithDetails");
            let cartItems: { [key: string]: CartItem } = storedCart ? JSON.parse(storedCart) : {};

            const key = `${outfit.id}-${selectedSize}-${selectedColor}`;
            if (cartItems[key]) {
                cartItems[key].quantity += 1;
            } else {
                cartItems[key] = cartItemToAdd;
            }

            localStorage.setItem("cartItemsWithDetails", JSON.stringify(Object.values(cartItems)));
            alert(`เพิ่ม "${outfit.name} (ขนาด: ${selectedSize}, สี: ${selectedColor})" ลงในตะกร้าแล้ว!`);
        } else if (outfit && outfit.sizes.length > 0 && !selectedSize) {
            alert("โปรดเลือกขนาด");
        } else if (outfit && outfit.colors && outfit.colors.length > 0 && !selectedColor) {
            alert("โปรดเลือกสี");
        } else if (outfit) {
            const cartItemToAdd: CartItem = {
                outfit: outfit,
                quantity: 1,
                size: undefined,
                color: undefined,
            };
            const storedCart = localStorage.getItem("cartItemsWithDetails");
            let cartItems: { [key: string]: CartItem } = storedCart ? JSON.parse(storedCart) : {};
            const key = `${outfit.id}-undefined-undefined`;
            if (cartItems[key]) {
                cartItems[key].quantity += 1;
            } else {
                cartItems[key] = cartItemToAdd;
            }
            localStorage.setItem("cartItemsWithDetails", JSON.stringify(Object.values(cartItems)));
            alert(`เพิ่ม "${outfit.name}" ลงในตะกร้าแล้ว!`);
        }
    };

    const handleNextImage = () => {
        if (outfit?.otherImages && outfit.otherImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (outfit.otherImages!.length + 1));
        }
    };

    const handlePrevImage = () => {
        if (outfit?.otherImages && outfit.otherImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (outfit.otherImages!.length + 1)) % (outfit.otherImages!.length + 1));
        }
    };

    const currentImage = () => {
        if (outfit?.image) {
            if (outfit.otherImages && outfit.otherImages.length > 0 && currentImageIndex > 0) {
                return outfit.otherImages[currentImageIndex - 1];
            }
            return outfit.image;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        <div className="relative w-full aspect-w-1 aspect-h-1">
                            {currentImage() && (
                                <Image
                                    src={currentImage()!}
                                    alt={outfit?.name || 'Product Image'}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="rounded-md"
                                />
                            )}
                            {outfit?.otherImages && outfit.otherImages.length > 0 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center opacity-75 hover:opacity-90 focus:outline-none"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center opacity-75 hover:opacity-90 focus:outline-none"
                                    >
                                        →
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="py-4">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{outfit?.name}</h2>
                            <p className="text-gray-500 mb-4">{outfit?.brand}</p>
                            <p className="text-xl text-black font-bold mb-4">฿ {outfit?.price}</p>

                            {outfit?.status && (
                                <div className="mb-3">
                                    <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                        {outfit.status}
                                    </span>
                                </div>
                            )}

                            {outfit?.sizes && outfit.sizes.length > 0 && (
                                <div className="mb-3">
                                    <label htmlFor="size" className="block text-gray-700 text-sm font-medium mb-2">
                                        ขนาด:
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="size"
                                            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400 text-sm"
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                            value={selectedSize}
                                        >
                                            <option value="">เลือกขนาด</option>
                                            {outfit.sizes.map((size) => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {outfit?.colors && outfit.colors.length > 0 && (
                                <div className="mb-4">
                                    <label htmlFor="color" className="block text-gray-700 text-sm font-medium mb-2">
                                        สี:
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="color"
                                            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400 text-sm"
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                            value={selectedColor}
                                        >
                                            <option value="">เลือกสี</option>
                                            {outfit.colors.map((color) => (
                                                <option key={color} value={color}>{color}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleAddToCart} className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition w-full font-semibold text-sm">
                                เพิ่มลงตะกร้า
                            </button>

                            <Link href="/" className="inline-block mt-4 text-gray-500 hover:text-gray-700 text-sm">
                                ← กลับไปหน้าหลัก
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
