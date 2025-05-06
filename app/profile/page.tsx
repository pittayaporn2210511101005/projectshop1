"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // ไม่มีการติดตั้งเพิ่มเติม เพราะ Next.js มีให้อยู่แล้ว

interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
    profileImage?: string;
}

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const email = localStorage.getItem("userEmail"); // ลองดึง email จาก localStorage หรือ sessionStorage
        if (email) {
            // ดึงข้อมูล
            fetch(`http://localhost:8081/api/customer/profile?email=${email}`)
                .then((response) => response.json()) // แปลงข้อมูลที่รับมาเป็น JSON
                .then((data) => {
                    setUser(data);  // เก็บข้อมูลที่ดึงมา
                    setLoading(false);  // เปลี่ยนสถานะให้โหลดเสร็จ
                })
                .catch((err) => {
                    console.error("Error fetching profile:", err);
                    setLoading(false); // ถ้าผิดพลาด
                });
        } else {
            setLoading(false); // ถ้าไม่มี email
        }
    }, []);


    if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>; // จะแสดงข้อความระหว่างโหลดข้อมูล
    if (!user) return <div className="text-center py-10 text-red-600">ไม่พบข้อมูลผู้ใช้งาน</div>; // ถ้าไม่มีข้อมูล

    return (
        <div className="min-h-screen bg-gray-100 py-12 flex justify-center items-center fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200 slide-up">
                <div className="flex justify-center mb-8 animate-bounce">
                    <div className="relative rounded-full h-24 w-24 overflow-hidden border-4 border-black shadow-md transition-transform duration-300 hover:scale-105">
                        <img
                            src={user.profileImage || "/images/default-profile.png"}
                            alt="รูปโปรไฟล์"
                            className="object-cover h-full w-full grayscale"
                        />
                    </div>
                </div>
                <h2 className="block text-gray-800 text-3xl font-bold text-center mb-6 uppercase tracking-wide text-black">
                    <span className="text-black">โปรไฟล์</span> <span className="text-gray-600">ผู้ใช้</span>
                </h2>
                <div className="space-y-6 mb-8">
                    <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            ชื่อผู้ใช้:
                        </label>
                        <p className="text-gray-900 font-semibold">{user.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            อีเมล:
                        </label>
                        <p className="text-gray-900 font-semibold">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            ที่อยู่จัดส่ง:
                        </label>
                        <p className="text-gray-900 font-semibold">{user.address}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 shadow-inner">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            เบอร์โทรศัพท์:
                        </label>
                        <p className="text-gray-900 font-semibold">{user.phone}</p>
                    </div>
                </div>

                {/* ส่วนของการติดตามสถานะชุดเช่า */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide text-black">
                        <span className="text-black">สถานะ</span> <span className="text-gray-600">การเช่า</span>
                    </h3>
                    {/* สามารถดึงประวัติการเช่าเพิ่มเติมจาก API ตามที่ต้องการ */}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <Link
                        href="/profile/edit"
                        className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-5 rounded-md focus:outline-none focus:shadow-outline text-sm transition duration-300 ease-in-out hover:scale-105"
                    >
                        แก้ไขโปรไฟล์
                    </Link>
                    <Link
                        href="/"
                        className="inline-block align-baseline font-semibold text-sm text-gray-600 hover:text-gray-800 transition duration-300 ease-in-out hover:underline"
                    >
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>
            <style jsx>{`
                .fade-in {
                    animation: fadein 0.5s;
                }

                .slide-up {
                    animation: slideup 0.5s;
                }

                @keyframes fadein {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes slideup {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }

                .grayscale {
                    filter: grayscale(100%);
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
