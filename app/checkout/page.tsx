"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Outfit {
  id: string;
  image: string;
  name: string;
  brand: string;
  price: number;
  sizes: string[];
  colors?: string[];
  status?: "ใหม่" | "ลดราคา";
}

interface CartItem extends Outfit {
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phoneNumber: "",
  });
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem("cartItemsWithDetails");
        if (stored) {
          try {
            const parsed: { [key: string]: { outfit: Outfit; quantity: number } } = JSON.parse(stored);
            const itemsArray = Object.values(parsed).map(item => ({
              ...item.outfit,
              quantity: item.quantity,
            }));
            setCartItems(itemsArray);
          } catch (error) {
            console.error("Error parsing cart items:", error);
            setCartItems([]);
          }
        }
      }
    };
    fetchCartItems();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fetchUser = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return;
      try {
        const res = await fetch(`http://localhost:8081/api/customer/email/${email}`);
        if (res.ok) {
          const data = await res.json();
          setShippingInfo({
            name: data.name || "",
            address: data.address || "",
            phoneNumber: data.phone || "",
          });
        } else {
          console.error("ไม่สามารถโหลดข้อมูลผู้ใช้");
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", err);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQrCodeImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า");
      return;
    }

    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phoneNumber) {
      alert("กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน");
      return;
    }

    if (!qrCodeImage) {
      alert("กรุณาอัปโหลดหลักฐานการชำระเงิน");
      return;
    }

    console.log("ข้อมูลจัดส่ง:", shippingInfo);
    console.log("สินค้าในตะกร้า:", cartItems);
    console.log("ยอดรวม:", totalPrice);
    console.log("หลักฐานการชำระเงิน (Base64):", qrCodeImage);

    alert("ดำเนินการสั่งซื้อและอัปโหลดหลักฐานการชำระเงินแล้ว! (ขั้นตอนต่อไปคือการส่งข้อมูลนี้ไปยัง Backend)");

    // 👇 กลับไปยังหน้าหลักหลังจากยืนยันการสั่งซื้อ
    router.push('/');
  };

  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-pink-50 py-6 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-600 mb-4">ไม่มีสินค้าอยู่ในตะกร้าของคุณ</p>
            <Link href="/" className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded">
              กลับไปเลือกสินค้า
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-pink-50 py-6">
        <div className="container mx-auto p-6 bg-white rounded-2xl shadow-lg max-w-lg">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">ชำระเงิน</h2>

          {/* 🔸 Order Summary */}
          <section className="mb-6 p-4 border border-pink-200 rounded-xl bg-pink-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-pink-700">สรุปคำสั่งซื้อ</h3>
            <ul>
              {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center py-2 text-gray-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-2 overflow-hidden rounded-md shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                    <span>฿ {item.price * item.quantity}</span>
                  </li>
              ))}
            </ul>
            <div className="text-right font-semibold mt-2">ยอดรวม: ฿ {totalPrice}</div>
          </section>

          {/* 🔸 Shipping Info */}
          <section className="mb-6 p-4 border border-pink-200 rounded-xl bg-pink-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-pink-700">ข้อมูลการจัดส่ง</h3>
            <div className="mb-3">
              <label className="block text-sm font-bold mb-1 text-gray-700">ชื่อ-นามสกุล:</label>
              <input type="text" name="name" placeholder="สมชาย ใจดี"
                     value={shippingInfo.name} onChange={handleInputChange} className={inputStyle} required />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-bold mb-1 text-gray-700">ที่อยู่:</label>
              <textarea name="address" placeholder="123 หมู่ 4 ต.บางรัก อ.เมือง จ.กรุงเทพฯ"
                        value={shippingInfo.address} onChange={handleInputChange} className={inputStyle} required />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-bold mb-1 text-gray-700">เบอร์โทรศัพท์:</label>
              <input type="tel" name="phoneNumber" placeholder="0812345678"
                     value={shippingInfo.phoneNumber} onChange={handleInputChange} className={inputStyle} required />
            </div>
          </section>

          {/* 🔸 Admin QR Code (ส่วนที่แสดงรูปภาพ) */}
          <section className="mb-6 p-4 border border-pink-200 rounded-xl bg-pink-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-pink-700">QR Code ชำระเงิน (จากร้านค้า)</h3>
            {/* แสดงรูป QR Code จากไฟล์โดยตรง */}
            <div className="mt-3 text-center">
              {/* Path นี้จะทำงานได้หลังจากย้ายโฟลเดอร์ imge ไปไว้ใน public แล้ว */}
              <img
                  src="/imge/qr-code-generated-7.jpg" // <-- Path นี้ถูกต้องแล้ว เมื่อ imge อยู่ใน public
                  alt="QR จากร้าน"
                  className="max-w-full rounded-md shadow-sm inline-block transition-transform hover:scale-105 duration-200"
              />
            </div>
            <p className="text-gray-600 text-xs mt-2 text-center">สแกน QR Code นี้เพื่อชำระเงิน</p>
          </section>

          {/* 🔸 Upload หลักฐานการชำระเงิน */}
          <section className="mb-6 p-4 border border-pink-200 rounded-xl bg-pink-50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-pink-700">อัปโหลดหลักฐานการชำระเงิน</h3>
            <label className="block text-sm font-bold mb-1 text-gray-700">อัปโหลดรูปภาพสลิปหรือ QR Code ที่ชำระแล้ว:</label>
            <input type="file" accept="image/*" onChange={handleQrCodeUpload} className={inputStyle} />
            {qrCodeImage && (
                <div className="mt-3">
                  <img src={qrCodeImage} alt="QR Code ผู้ใช้" className="max-w-full rounded-md shadow-sm transition-transform hover:scale-105 duration-200" />
                </div>
            )}
            <p className="text-gray-600 text-xs mt-1">อัปโหลดรูปภาพหลักฐานการชำระเงิน (เช่น สลิปโอนเงิน หรือ QR Code ที่สแกนแล้ว)</p>
          </section>

          {/* 🔸 Action Buttons */}
          <div className="flex justify-between mt-6">
            <Link href="/cart" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
              กลับไปแก้ไขตะกร้า
            </Link>
            <button onClick={handleCheckout}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded">
              ยืนยันการสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
  );
}

const inputStyle =
    "shadow appearance-none border border-pink-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400";