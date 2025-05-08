"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ProductCard from './components/ProductCard';
import axios, { AxiosResponse, AxiosError } from 'axios';
import AddNewProduct from '@/app/admin/components/AddNewProduct';

export type NewProduct = {
  name: string;
  brand: string;
  price: number;
  sizes: string[];
  colors?: string[];
  status?: "ใหม่" | "ลดราคา";
  images: File[];
};

interface Outfit {
  id: string;
  image: string;
  name: string;
  brand: string;
  price: number;
  sizes: string[];
  colors?: string[];
  status?: "ใหม่" | "ลดราคา";
}

const getInitialCartItems = (): { [id: string]: { outfit: Outfit; quantity: number; size?: string; color?: string } } =>
    typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem("cartItemsWithDetails") || '{}')
        : {};

export default function Home() {
  const [cartItems, setCartItems] = useState(getInitialCartItems());
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [allLoadedOutfits, setAllLoadedOutfits] = useState<Outfit[]>([]); // State สำหรับเก็บสินค้าทั้งหมดที่โหลดจาก API
  const [newProducts, setNewProducts] = useState<Outfit[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]); // State สำหรับเก็บสินค้าที่ถูกกรอง

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItemsWithDetails", JSON.stringify(cartItems));
  }, [cartItems]);

  // ดึงข้อมูลสินค้าทั้งหมดจาก API เมื่อ component mount
  useEffect(() => {
    const fetchInitialOutfits = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/dress');
        setAllLoadedOutfits(response.data);     // เก็บชุดทั้งหมด
        setFilteredOutfits(response.data);       // สำหรับการกรอง
      } catch (error) {
        console.error('Failed to fetch initial outfits:', error);
      }
    };

    fetchInitialOutfits();
  }, []);


  const handleAddToCart = (item: { outfit: Outfit; size?: string; color?: string }) => {
    const key = `${item.outfit.id}-${item.size}-${item.color}`;
    setCartItems(prevItems => ({ ...prevItems, [key]: { ...item, quantity: (prevItems[key]?.quantity || 0) + 1 } }));
  };

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      localStorage.clear();
      setCartItems({});
      setUserRole(null);
      router.push("/");
    }
  };

  const handleNavigation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Logout") {
      handleLogout();
    } else if (value) {
      router.push(`/${value.toLowerCase()}`);
    }
    e.target.value = "";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterOutfits(term, selectedBrand);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    filterOutfits(searchTerm, brand);
  };

  const filterOutfits = (term: string, brand: string) => {
    const filtered = allLoadedOutfits.filter(outfit => {
      const matchesSearchTerm = outfit.name.toLowerCase().includes(term);
      const matchesBrand = brand ? outfit.brand === brand : true;
      return matchesSearchTerm && matchesBrand;
    });
    setFilteredOutfits(filtered);
  };

  const handleAddNewProduct = (newProductData: NewProduct) => {
    const newOutfit: Outfit = {
      id: `new-${Date.now()}`,
      image: newProductData.images[0] ? URL.createObjectURL(newProductData.images[0]) : "https://via.placeholder.com/300/CCCCCC/000000?Text=New+Product",
      name: newProductData.name,
      brand: newProductData.brand,
      price: newProductData.price || 0,
      sizes: newProductData.sizes,
      colors: newProductData.colors,
      status: newProductData.status,
    };
    setNewProducts(prevProducts => [...prevProducts, newOutfit]);

    axios.post('http://localhost:8081/api/dress/save', newOutfit)
        .then((response: AxiosResponse) => {
          console.log('เพิ่มสินค้าใหม่สำเร็จ', response.data);
          // หลังจากเพิ่มสินค้าใหม่สำเร็จ ควรดึงข้อมูลทั้งหมดจาก API ใหม่อีกครั้ง
          fetchInitialOutfits();
        })
        .catch((error: AxiosError) => {
          console.error('การเพิ่มสินค้าใหม่ล้มเหลว', error);
        });
  };

  // รวมสินค้าที่กรองแล้ว และสินค้าใหม่
  const allOutfitsToDisplay = [...filteredOutfits, ...newProducts];

  let outfit;
  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-rose-600 shadow-md p-3 rounded-lg bg-pink-100/80">Rent Your Style</h1>
            <select
                className="shadow-md focus:ring-rose-400 focus:border-rose-400 block sm:text-sm border border-rose-300 rounded-md py-2 px-3 text-rose-700 appearance-none bg-white cursor-pointer"
                onChange={handleNavigation}
                defaultValue=""
            >
              <option value="" className="text-gray-500">Home</option>
              {userRole === null && <option value="Login">Login</option>}
              {userRole !== null && <option value="Profile">Profile</option>}
              <option value="Contact">About Us</option>
              <option value="Review">Review</option>
              {userRole !== null && <option value="Logout">Logout</option>}
            </select>
          </div>

          <div className="mb-6 flex items-center space-x-4">
            <input
                type="text"
                placeholder="Search outfit names..."
                className="shadow-sm focus:ring-rose-400 focus:border-rose-400 block w-full sm:text-sm border border-rose-300 rounded-md py-2 px-3 text-rose-700"
                value={searchTerm}
                onChange={handleSearch}
            />
            <select
                className="shadow-md focus:ring-rose-400 focus:border-rose-400 block sm:text-sm border border-rose-300 rounded-md py-2 px-3 text-rose-700 appearance-none bg-white cursor-pointer"
                value={selectedBrand}
                onChange={handleBrandChange}
            >
              <option value="">All Brands</option>
              <option value="Brand X">Brand X</option>
              <option value="Brand Y">Brand Y</option>
            </select>
          </div>

          {userRole === 'ADMIN' && <AddNewProduct onProductAdded={handleAddNewProduct} />}

          <h2 className="text-2xl font-semibold text-rose-700 mb-4">Our Outfits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {allOutfitsToDisplay.map(outfit => (
                <div key={outfit.id} className="relative"> {/* เพิ่ม div container */}
                  <ProductCard key={outfit.id} outfit={outfit} onAddToCart={handleAddToCart} />
                  <button
                      onClick={() => handleAddToCart({ outfit })}
                      className="absolute bottom-2 left-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition text-sm shadow-sm"
                  >
                    เพิ่มลงตะกร้า
                  </button>
                </div>
            ))}
          </div>

          <div className="flex justify-center mb-8">
            <button className="bg-rose-100 text-rose-700 px-5 py-2 rounded-md hover:bg-rose-200 transition shadow-sm">See More Outfits +</button>
          </div>


          <div className="relative">
            <Link
                href="/cart"
                className="fixed bottom-8 right-8 bg-rose-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-800 transition cursor-pointer text-xl"
            >
              🛒
              {Object.keys(cartItems).length > 0 && (
                  <div className="absolute top-0 right-0 translate-x-[0%] -translate-y-[50%] bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold border border-red-500">
                    {Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
              )}
            </Link>
          </div>
        </div>
      </div>
  );
}