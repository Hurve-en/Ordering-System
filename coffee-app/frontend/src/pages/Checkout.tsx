import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { clearCart } from "../redux/slices/cartSlice";
import { apiService } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);
  const { items, totalPrice } = useAppSelector((state: any) => state.cart);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [formData, setFormData] = useState({
    address: "",
    city: "Cebu",
    postalCode: "",
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([10.3157, 123.8854], 12); // Cebu coordinates
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Click to pin location
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoordinates([lat, lng]);

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(map)
        .bindPopup(
          `📍 Pinned Location<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(
            4
          )}`
        );

      markerRef.current = marker;
    });

    return () => {
      map.remove();
    };
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address) {
      setError("Please enter delivery address");
      return;
    }

    if (!coordinates) {
      setError("Please pin your location on the map");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice,
        deliveryAddress: `${formData.address}, ${formData.city} ${formData.postalCode}`,
      };

      await apiService.createOrder(orderData);
      dispatch(clearCart());
      alert("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-coffee-900">
            Invalid checkout
          </h1>
          <button
            onClick={() => navigate("/menu")}
            className="mt-4 px-6 py-2 bg-coffee-900 text-white rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-coffee-900 mb-8">🛍️ Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section - NOT STICKY */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">
                📍 Pin Your Location
              </h2>
              <p className="text-gray-600 mb-4">
                Click on the map to pin your delivery location in Cebu
              </p>
              <div
                ref={mapContainerRef}
                className="w-full rounded-lg border-2 border-coffee-200"
                style={{ height: "400px" }}
              />
              {coordinates && (
                <p className="mt-4 text-sm text-green-600">
                  ✓ Location pinned at ({coordinates[0].toFixed(4)},{" "}
                  {coordinates[1].toFixed(4)})
                </p>
              )}
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">
                📮 Delivery Address
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your delivery address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="e.g., 6000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 bg-coffee-900 text-white font-bold text-lg rounded-lg hover:bg-coffee-800 transition disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "✓ Place Order"}
            </button>
          </div>

          {/* Order Summary - STICKY on desktop only */}
          <div className="bg-white rounded-lg shadow p-6 lg:sticky lg:top-20 lg:h-fit">
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item: any) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-bold">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-coffee-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">₱{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-bold">₱50.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-coffee-900">
                <span>Total</span>
                <span>₱{(totalPrice + 50).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
