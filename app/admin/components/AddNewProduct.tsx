import { useState, useEffect } from 'react';
import axios from 'axios';

interface Dress {
  id?: string;
  name: string;
  brand: string;
  price: number;
  status: string;
  size: string;
  color: string;
  imageUrl?: string;
  created_at?: string;
}

export default function AddDress() {
  const [formData, setFormData] = useState<Dress>({
    name: '',
    brand: '',
    price: 0,
    status: '',
    size: '',
    color: '',
    imageUrl: '',
  });

  const [dresses, setDresses] = useState<Dress[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'size' | 'color') => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file); // เก็บไฟล์สำหรับอัปโหลด
    }
  };

  // ✅ ฟังก์ชันอัปโหลดภาพขึ้น Cloudinary
  const uploadImageToServer = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'PROJCET'); // <-- เปลี่ยนค่าให้ตรงกับ Cloudinary
    const res = await axios.post('https://api.cloudinary.com/v1_1/\n' +
        'dp3rmlfap/image/upload', data); // <-- เปลี่ยนค่า YOUR_CLOUD_NAME
    return res.data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;

    if (imageFile) {
      try {
        imageUrl = await uploadImageToServer(imageFile);
        console.log("image_url",imageUrl)
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
        return;
      }
    }

    const payload: Dress = {
      ...formData,
      price: parseFloat(formData.price.toString()),
      imageUrl: imageUrl,
    };

    await axios.post('http://localhost:8081/api/dress/save', payload);
    setFormData({ name: '', brand: '', price: 0, status: '', size: '', color: '', imageUrl: '' });
    setImagePreview(null);
    setImageFile(null);
    fetchDresses();
  };

  const fetchDresses = async () => {
    const response = await axios.get('http://localhost:8081/api/dress');
    setDresses(response.data);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirm = window.confirm('คุณต้องการลบชุดนี้หรือไม่?');
    if (confirm) {
      await axios.delete(`http://localhost:8081/api/dress/${id}`);
      fetchDresses();
    }
  };

  useEffect(() => {
    fetchDresses();
  }, []);

  return (
      <div className="space-y-8">
        {/* ฟอร์มเพิ่มชุด */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">ชื่อชุด</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">ยี่ห้อ</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">ราคา</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">สถานะ</label>
            <input type="text" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">ขนาด</label>
            <select onChange={(e) => handleSelectChange(e, 'size')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option value="">-- เลือกขนาด --</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
            {formData.size && <p className="mt-2"><strong>ขนาดที่เลือก:</strong> {formData.size}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">สี</label>
            <select onChange={(e) => handleSelectChange(e, 'color')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option value="">-- เลือกสี --</option>
              <option value="แดง">แดง</option>
              <option value="น้ำเงิน">น้ำเงิน</option>
              <option value="เขียว">เขียว</option>
            </select>
            {formData.color && <p className="mt-2"><strong>สีที่เลือก:</strong> {formData.color}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">รูปภาพ</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />}
          </div>

          <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            บันทึกชุดใหม่
          </button>
        </form>

        {/* รายการชุด */}
        <div>
          <h2 className="text-lg font-bold">รายการชุดที่บันทึกแล้ว</h2>
          {dresses.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีรายการชุด</p>
          ) : (
              <div className="grid gap-4 mt-4">
                {dresses.map((dress) => (
                    <div key={dress.id} className="border p-4 rounded shadow-sm">
                      <p><strong>ชื่อชุด:</strong> {dress.name}</p>
                      <p><strong>ยี่ห้อ:</strong> {dress.brand}</p>
                      <p><strong>ราคา:</strong> {dress.price} บาท</p>
                      <p><strong>สถานะ:</strong> {dress.status}</p>
                      <p><strong>ขนาด:</strong> {dress.size}</p>
                      <p><strong>สี:</strong> {dress.color}</p>
                      {dress.created_at && <p><strong>วันที่เพิ่ม:</strong> {new Date(dress.created_at).toLocaleString()}</p>}
                      {dress.imageUrl && <img src={dress.imageUrl} alt={dress.name} className="mt-2 w-24 h-24 object-cover rounded-md" />}
                      <button onClick={() => handleDelete(dress.id)} className="mt-2 text-red-500 hover:underline">ลบชุดนี้</button>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
