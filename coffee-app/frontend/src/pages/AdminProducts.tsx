import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/premium.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  roastLevel: string;
  grind: string;
  size: string;
  image: string;
  stock: number;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    roastLevel: "medium",
    grind: "whole",
    size: "250g",
    image: "",
    stock: 10,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    // Only require image when creating new product, not when updating
    if (!editingId && !formData.image)
      newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      console.log("🔵 Submitting product:", formData);
      console.log("🔵 Token:", token);
      console.log("🔵 Token is present:", !!token);

      if (editingId) {
        console.log("🟡 Updating product:", editingId);
        const response = await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("✅ Update response:", response.data);
        alert("✅ Product updated successfully!");
      } else {
        console.log("🟡 Creating new product");
        const response = await axios.post(
          "http://localhost:5000/api/products",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("✅ Create response:", response.data);
        alert("✅ Product created successfully!");
      }

      setFormData({
        name: "",
        description: "",
        price: 0,
        roastLevel: "medium",
        grind: "whole",
        size: "250g",
        image: "",
        stock: 10,
      });
      setShowForm(false);
      setEditingId(null);
      setErrors({});
      setImagePreview("");
      fetchProducts();
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error message:", err.message);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to save product";
      alert("❌ Error: " + errorMsg);
      setErrors({
        submit: errorMsg,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      roastLevel: product.roastLevel,
      grind: product.grind,
      size: product.size,
      image: product.image,
      stock: product.stock,
    });
    setImagePreview(product.image);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      roastLevel: "medium",
      grind: "whole",
      size: "250g",
      image: "",
      stock: 10,
    });
    setErrors({});
    setImagePreview("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <p className="text-xl text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-brown mb-2">
              ☕ Product Management
            </h1>
            <p className="text-lg text-muted">Manage your coffee products</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              ✓ Add New Product
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-cream py-6 px-8">
                <h2 className="text-3xl font-bold">
                  {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {errors.submit && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800 font-semibold">
                      ⚠️ {errors.submit}
                    </p>
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-brown mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.name
                        ? "border-red-500 focus:ring-red-300"
                        : "border-caramel focus:ring-accent"
                    }`}
                    placeholder="Premium Mt. Apo Arabica"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">✕ {errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-brown mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition h-24 ${
                      errors.description
                        ? "border-red-500 focus:ring-red-300"
                        : "border-caramel focus:ring-accent"
                    }`}
                    placeholder="Describe your coffee..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      ✕ {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        errors.price
                          ? "border-red-500 focus:ring-red-300"
                          : "border-caramel focus:ring-accent"
                      }`}
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        ✕ {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        errors.stock
                          ? "border-red-500 focus:ring-red-300"
                          : "border-caramel focus:ring-accent"
                      }`}
                      placeholder="10"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">
                        ✕ {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Roast Level */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Roast Level
                    </label>
                    <select
                      name="roastLevel"
                      value={formData.roastLevel}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  {/* Grind */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Grind Type
                    </label>
                    <select
                      name="grind"
                      value={formData.grind}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                    >
                      <option value="whole">Whole Bean</option>
                      <option value="ground">Ground</option>
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Size
                    </label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                    >
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1kg">1kg</option>
                    </select>
                  </div>
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-brown mb-2">
                    Product Image {!editingId && "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">
                      ✕ {errors.image}
                    </p>
                  )}
                  {imagePreview && (
                    <div className="mt-4 flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-caramel"
                      />
                      <p className="text-xs text-muted mt-2">Image Preview</p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingId ? "✓ Update Product" : "✓ Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary flex-1"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="text-7xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-brown mb-2">
              No Products Yet
            </h3>
            <p className="text-muted mb-6">
              Add your first coffee product to get started!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              ➕ Add Product
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Product Image */}
                  {product.image && (
                    <div className="flex items-center justify-center bg-amber-50 rounded-2xl overflow-hidden h-48 md:h-auto">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className={product.image ? "md:col-span-3" : ""}>
                    <h3 className="text-2xl font-bold text-brown mb-2">
                      {product.name}
                    </h3>
                    <p className="text-muted mb-4">{product.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="font-semibold text-brown">Price:</span>
                        <span className="ml-2 text-accent">
                          ₱{product.price}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-brown">Stock:</span>
                        <span
                          className={`ml-2 ${
                            product.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-brown">Roast:</span>
                        <span className="ml-2">
                          {product.roastLevel.charAt(0).toUpperCase() +
                            product.roastLevel.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-brown">Size:</span>
                        <span className="ml-2">{product.size}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-brown">Grind:</span>
                        <span className="ml-2">
                          {product.grind.charAt(0).toUpperCase() +
                            product.grind.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-secondary text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
