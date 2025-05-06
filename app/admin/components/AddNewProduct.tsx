// app/admin/components/AddNewProduct.tsx
import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiMinus } from 'react-icons/fi';

export interface NewProduct {
  id?: string;
  images: File[];
  name: string;
  brand: string;
  price: number | null;
  sizes: string[];
  colors: string[];
  status?: "ใหม่" | "ลดราคา";
}

interface AddNewProductProps {
  onProductAdded: (newProduct: Omit<NewProduct, 'id'>) => void;
  onProductUpdated?: (updatedProduct: NewProduct) => void;
  existingProduct?: NewProduct;
}

const availableSizes = ["XS", "S", "M", "L", "XL"];

const AddNewProduct: React.FC<AddNewProductProps> = ({ onProductAdded, onProductUpdated, existingProduct }) => {
  const [newProduct, setNewProduct] = useState<NewProduct>({
    id: existingProduct?.id,
    images: existingProduct?.images ? [] : [],
    name: existingProduct?.name || '',
    brand: existingProduct?.brand || '',
    price: existingProduct?.price || null,
    sizes: existingProduct?.sizes || ['S'],
    colors: existingProduct?.colors || ['#000000'],
    status: existingProduct?.status || 'ใหม่',
  });

  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setNewProduct({
        id: existingProduct.id,
        images: [], // รีเซ็ต images เมื่อแก้ไข
        name: existingProduct.name,
        brand: existingProduct.brand,
        price: existingProduct.price,
        sizes: existingProduct.sizes,
        colors: existingProduct.colors,
        status: existingProduct.status,
      });
      setIsFormVisible(true);
    } else {
      setNewProduct({ images: [], name: '', brand: '', price: null, sizes: ['S'], colors: ['#000000'], status: 'ใหม่' });
      setIsFormVisible(false);
    }
  }, [existingProduct]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewProduct(prevProduct => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setNewProduct(prevProduct => ({
        ...prevProduct,
        images: [...prevProduct.images, ...Array.from(files)],
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();

    // เพิ่มข้อมูลสินค้าใน FormData
    formData.append('name', newProduct.name);
    formData.append('brand', newProduct.brand);
    formData.append('price', String(newProduct.price));
    formData.append('status', newProduct.status || 'ใหม่');
    formData.append('sizes', JSON.stringify(newProduct.sizes));
    formData.append('colors', JSON.stringify(newProduct.colors));

    // เพิ่มไฟล์ภาพใน FormData
    newProduct.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    let response;
    if (existingProduct?.id) {
      // การอัปเดตสินค้า (PUT request)
      response = await fetch(`/api/Dress/${existingProduct.id}`, {
        method: 'PUT', // ใช้ PUT ในการอัปเดต
        body: formData,
      });
      console.log('Response status:', response.status); // ตรวจสอบ status ของ response
      if (response.ok) {
        const updatedProduct = await response.json();
        onProductUpdated?.(updatedProduct);
      } else {
        console.error("Error updating product");
      }
    } else {
      // การเพิ่มสินค้าใหม่ (POST request)
      response = await fetch('/api/Dress/save', {
        method: 'POST',
        body: formData,
      });
      console.log('Response status:', response.status); // ตรวจสอบ status ของ response
      if (response.ok) {
        const newProductData = await response.json();
        onProductAdded(newProductData);
      } else {
        console.error("Error adding product");
      }
    }

    // รีเซ็ตฟอร์มหลังจากส่งข้อมูล
    setNewProduct({ images: [], name: '', brand: '', price: null, sizes: ['S'], colors: ['#000000'], status: 'ใหม่' });
    setIsFormVisible(false);
  };



  return (
      <div className="p-6 rounded-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{existingProduct ? 'แก้ไขชุดสินค้า' : 'เพิ่มชุดใหม่'}</h2>
          <button
              type="button"
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 hover:text-gray-700"
          >
            {isFormVisible ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </button>
        </div>

        {isFormVisible && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อชุด</label>
                  <input
                      type="text"
                      id="name"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">แบรนด์</label>
                  <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={newProduct.brand}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
                  <input
                      type="number"
                      id="price"
                      name="price"
                      value={newProduct.price || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ขนาด</label>
                {newProduct.sizes.map((size, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select
                          value={size}
                          onChange={(e) => {
                            const newSizes = [...newProduct.sizes];
                            newSizes[index] = e.target.value;
                            setNewProduct({ ...newProduct, sizes: newSizes });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        {availableSizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {newProduct.sizes.length > 1 && (
                          <button
                              type="button"
                              onClick={() => {
                                const newSizes = [...newProduct.sizes];
                                newSizes.splice(index, 1);
                                setNewProduct({ ...newProduct, sizes: newSizes });
                              }}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                          >
                            <FiMinus size={12} />
                          </button>
                      )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, 'S'] })}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded"
                >
                  <FiPlus size={12} /> เพิ่มขนาด
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สี</label>
                <div className="flex items-center space-x-2">
                  {newProduct.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...newProduct.colors];
                              newColors[index] = e.target.value;
                              setNewProduct({ ...newProduct, colors: newColors });
                            }}
                            className="rounded-md border-gray-300 shadow-sm"
                        />
                        {newProduct.colors.length > 1 && (
                            <button
                                type="button"
                                onClick={() => {
                                  const newColors = [...newProduct.colors];
                                  newColors.splice(index, 1);
                                  setNewProduct({ ...newProduct, colors: newColors });
                                }}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                            >
                              <FiMinus size={12} />
                            </button>
                        )}
                      </div>
                  ))}
                  <button
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, colors: [...newProduct.colors, '#000000'] })}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded"
                  >
                    <FiPlus size={12} /> เพิ่มสี
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                    id="status"
                    name="status"
                    value={newProduct.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="ใหม่">ใหม่</option>
                  <option value="ลดราคา">ลดราคา</option>
                </select>
              </div>

              <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                {existingProduct ? 'บันทึกการแก้ไข' : 'บันทึกชุดใหม่'}
              </button>
            </form>
        )}
      </div>
  );
};

export default AddNewProduct;
