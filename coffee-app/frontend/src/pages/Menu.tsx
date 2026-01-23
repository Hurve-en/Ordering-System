import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import ProductCard from "../components/Common/ProductCard";
import "../styles/premium.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  roastLevel: string;
  grind: string;
  size: string;
  stock: number;
}

interface Filters {
  roastLevel: string[];
  grind: string[];
  size: string[];
  priceRange: [number, number];
  searchTerm: string;
}

export default function Menu() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">(
    "price-asc",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [filters, setFilters] = useState<Filters>({
    roastLevel: [],
    grind: [],
    size: [],
    priceRange: [0, 2000],
    searchTerm: "",
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/products");
        if (response.data.success) {
          setAllProducts(response.data.data || []);
        }
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...allProducts];

    // Search filter
    if (filters.searchTerm) {
      result = result.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()),
      );
    }

    // Roast level filter
    if (filters.roastLevel.length > 0) {
      result = result.filter((product) =>
        filters.roastLevel.includes(product.roastLevel),
      );
    }

    // Grind type filter
    if (filters.grind.length > 0) {
      result = result.filter((product) =>
        filters.grind.includes(product.grind),
      );
    }

    // Size filter
    if (filters.size.length > 0) {
      result = result.filter((product) => filters.size.includes(product.size));
    }

    // Price range filter
    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1],
    );

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortBy, allProducts]);

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle filter changes
  const handleRoastLevelChange = (roast: string) => {
    setFilters((prev) => ({
      ...prev,
      roastLevel: prev.roastLevel.includes(roast)
        ? prev.roastLevel.filter((r) => r !== roast)
        : [...prev.roastLevel, roast],
    }));
  };

  const handleGrindChange = (grind: string) => {
    setFilters((prev) => ({
      ...prev,
      grind: prev.grind.includes(grind)
        ? prev.grind.filter((g) => g !== grind)
        : [...prev.grind, grind],
    }));
  };

  const handleSizeChange = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter((s) => s !== size)
        : [...prev.size, size],
    }));
  };

  const handlePriceChange = (newPrice: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: newPrice,
    }));
  };

  const handleSearchChange = (term: string) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: term,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      roastLevel: [],
      grind: [],
      size: [],
      priceRange: [0, 2000],
      searchTerm: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-pulse mb-4 text-4xl">☕</div>
          <p className="text-primary-brown font-semibold">
            Loading premium coffee menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="section-gap bg-gradient-to-r from-amber-900 to-amber-800 text-cream">
        <div className="container">
          <h1 className="text-5xl font-bold mb-2">Our Coffee Menu</h1>
          <p className="text-lg opacity-90">
            Discover our curated selection of premium Mt. Apo coffee
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-gap">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-brown">Filters</h3>
                  {(filters.roastLevel.length > 0 ||
                    filters.grind.length > 0 ||
                    filters.size.length > 0 ||
                    filters.searchTerm ||
                    filters.priceRange[0] !== 0 ||
                    filters.priceRange[1] !== 2000) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-accent hover:text-brown transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-brown mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Roast Level */}
                <div className="mb-6 pb-6 border-b border-caramel border-opacity-30">
                  <h4 className="font-semibold text-brown mb-3">Roast Level</h4>
                  <div className="space-y-2">
                    {["Light", "Medium", "Dark"].map((roast) => (
                      <label
                        key={roast}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.roastLevel.includes(roast)}
                          onChange={() => handleRoastLevelChange(roast)}
                          className="w-4 h-4 text-accent rounded cursor-pointer"
                        />
                        <span className="ml-2 text-brown group-hover:text-accent transition">
                          {roast}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grind Type */}
                <div className="mb-6 pb-6 border-b border-caramel border-opacity-30">
                  <h4 className="font-semibold text-brown mb-3">Grind Type</h4>
                  <div className="space-y-2">
                    {["Whole Beans", "Ground", "Espresso"].map((grind) => (
                      <label
                        key={grind}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.grind.includes(grind)}
                          onChange={() => handleGrindChange(grind)}
                          className="w-4 h-4 text-accent rounded cursor-pointer"
                        />
                        <span className="ml-2 text-brown group-hover:text-accent transition">
                          {grind}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-6 pb-6 border-b border-caramel border-opacity-30">
                  <h4 className="font-semibold text-brown mb-3">Size</h4>
                  <div className="space-y-2">
                    {["250g", "500g", "1kg"].map((size) => (
                      <label
                        key={size}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.size.includes(size)}
                          onChange={() => handleSizeChange(size)}
                          className="w-4 h-4 text-accent rounded cursor-pointer"
                        />
                        <span className="ml-2 text-brown group-hover:text-accent transition">
                          {size}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-brown mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted mb-2 block">
                        Min: ₱{filters.priceRange[0]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={filters.priceRange[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value);
                          if (newMin < filters.priceRange[1]) {
                            handlePriceChange([newMin, filters.priceRange[1]]);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted mb-2 block">
                        Max: ₱{filters.priceRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={filters.priceRange[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value);
                          if (newMax > filters.priceRange[0]) {
                            handlePriceChange([filters.priceRange[0], newMax]);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-4">
                <p className="text-muted font-semibold">
                  Showing{" "}
                  {paginatedProducts.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                  -
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length,
                  )}{" "}
                  of {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-4">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin/products")}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold text-sm"
                    >
                      ✓ Add New Product
                    </button>
                  )}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-2xl text-muted mb-4">No products found</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-accent font-semibold hover:text-brown transition"
                  >
                    Clear filters and try again
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-1 sm:grid-2 lg:grid-4 gap-6 mb-8">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-caramel rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream transition"
                      >
                        ← Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg transition ${
                              currentPage === page
                                ? "bg-accent text-cream font-semibold"
                                : "border border-caramel hover:bg-cream"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-caramel rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream transition"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
