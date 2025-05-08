// components/ProductCard.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Outfit {
    imageUrl: string | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES] | undefined;
    id: string;
    image: string;
    name: string;
    brand: string;
    price: number;
    sizes: string[];
    colors?: string[];
    status?: "ใหม่" | "ลดราคา";
}

interface ProductCardProps {
    outfit: Outfit;
    onAddToCart: (item: { outfit: Outfit; size?: string; color?: string }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ outfit, onAddToCart }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(outfit.colors?.[0] || null);

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        setIsAvailable(null);
    };

    const handleCheckAvailability = async () => {
        if (startDate && endDate) {
            setIsChecking(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockAvailability = Math.random() > 0.3;
            setIsAvailable(mockAvailability);
            setIsChecking(false);
            setShowDatePicker(false);
        } else {
            alert('โปรดระบุวันที่เช่าและวันที่คืน');
        }
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedColor(event.target.value);
    };

    const handleAddToCartClick = () => {
        onAddToCart({
            outfit,
            size: selectedSize === null ? undefined : selectedSize,
            color: selectedColor === null ? undefined : selectedColor
        });
    };

    return (
        <div className="bg-white p-2 shadow-md rounded-lg flex flex-col justify-between">
            <Link href={`/product/${outfit.id}`}>
                <div className="aspect-w-1 aspect-h-1 relative overflow-hidden rounded-md mb-2 cursor-pointer">
                    <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>
            </Link>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{outfit.name}</h3>
            <div className="flex items-center space-x-2 mb-2"> {/* Container สำหรับ สี และ ขนาด */}
                {outfit.colors && outfit.colors.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            {outfit.colors.map((color) => (
                                <div
                                    key={color}
                                    className="w-5 h-5 rounded-full shadow-sm cursor-pointer"
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                    aria-label={`สี ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ส่วนตรวจสอบวันว่าง */}
            {/* ปุ่ม "เพิ่มลงตะกร้า" */}
        </div>
    );
};

export default ProductCard;