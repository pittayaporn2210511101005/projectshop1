"use client"; // Ensure the client-side execution

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import { AxiosResponse, AxiosError } from 'axios';
import AddNewProduct from '@/app/admin/components/AddNewProduct'; // default export

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

const initialOutfits: Outfit[] = [
  {
    id: "1",
    image: "https://cdn.wconcept.com/products/resize/632x843/migration/i/imgpin.wconceptusa.com/18647a1de60/36fd7/44/s0dWLfWXStJlYnd3qU-kFgkr0HA.png",
    name: "Casual Holiday Set",
    brand: "Brand X",
    price: 990,
    sizes: ["S", "M"],
    status: "ใหม่",
    colors: ["#FADCDC", "#92CEA8", "#E8CFF8"]
  },
  {
    id: "2",
    image: "https://cdn.wconcept.com/products/resize/632x843/migration/i/imgpin.wconceptusa.com/18647a1de60/26839/49/pE2IPlnI73EQ0pkY9OH1bw9XqM.png",
    name: "Luxury Work Outfit",
    brand: "Brand Y",
    price: 1590,
    sizes: ["M", "L"],
    status: "ลดราคา",
    colors: ["#F898A4"]
  }
];

export default function Home() {
  const [cartItems, setCartItems] = useState(getInitialCartItems());
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>(initialOutfits);
  const [newProducts, setNewProducts] = useState<Outfit[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItemsWithDetails", JSON.stringify(cartItems));
  }, [cartItems]);

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
    const filtered = initialOutfits.filter(outfit => {
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
        })
        .catch((error: AxiosError) => {
          console.error('การเพิ่มสินค้าใหม่ล้มเหลว', error);
        });
  };

  const allOutfits = [...filteredOutfits, ...newProducts];

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
            {allOutfits.map(outfit => <ProductCard key={outfit.id} outfit={outfit} onAddToCart={handleAddToCart} />)}
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
