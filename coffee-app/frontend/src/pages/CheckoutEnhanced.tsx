import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";
import L from "leaflet";
import "../styles/premium.css";
import "leaflet/dist/leaflet.css";

type CheckoutStep = "delivery" | "payment" | "review";

interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);
  const { items, totalPrice } = useAppSelector((state: any) => state.cart);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "Cebu",
    postalCode: "",
    latitude: 10.3157,
    longitude: 123.8854,

    paymentMethod: "cash",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
  });

  const deliveryFee = totalPrice >= 500 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, items.length, navigate]);

  // Initialize map on delivery step
  useEffect(() => {
    if (
      currentStep === "delivery" &&
      !mapInitialized &&
      mapRef.current === null
    ) {
      initializeMap();
    }
  }, [currentStep, mapInitialized]);

  const initializeMap = () => {
    const container = document.getElementById("checkout-map");
    if (!container) return;

    const map = L.map("checkout-map").setView(
      [formData.latitude, formData.longitude],
      14,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([formData.latitude, formData.longitude], {
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
    }).addTo(map);

    marker.bindPopup("Your delivery location");
    markerRef.current = marker;
    mapRef.current = map;
    setMapInitialized(true);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      updateMapMarker(lat, lng);
      reverseGeocode(lat, lng);
    });
  };

  const updateMapMarker = (lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14);
    }
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      );

      const suggestions = response.data.slice(0, 5).map((result: any) => ({
        name: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      }));

      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      setFormData((prev) => ({
        ...prev,
        address:
          response.data.address?.road || response.data.address?.village || "",
      }));
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    }));
    updateMapMarker(suggestion.lat, suggestion.lon);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "address") {
      searchLocation(value);
    }
  };

  const validateDeliveryInfo = () => {
    if (
      !formData.fullName.trim() ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all delivery fields");
      return false;
    }
    setError("");
    return true;
  };

  const validatePaymentInfo = () => {
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVV) {
        setError("Please fill in all card details");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === "delivery" && validateDeliveryInfo()) {
      setCurrentStep("payment");
    } else if (currentStep === "payment" && validatePaymentInfo()) {
      setCurrentStep("review");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("delivery");
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          deliveryAddress: `${formData.address}, ${formData.city} ${formData.postalCode}`,
          paymentMethod: formData.paymentMethod,
          items: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: finalTotal,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        dispatch(clearCart());
        navigate("/orders");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl font-bold text-brown mb-8">☕ Checkout</h1>

        {/* Step Indicator */}
        <div className="flex gap-4 mb-8 justify-center">
          {(["delivery", "payment", "review"] as const).map((step, idx) => (
            <div key={step} className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                  currentStep === step
                    ? "bg-accent text-white"
                    : idx <
                        (["delivery", "payment", "review"] as const).indexOf(
                          currentStep,
                        )
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`w-12 h-1 transition ${
                    idx <
                    (["delivery", "payment", "review"] as const).indexOf(
                      currentStep,
                    )
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* DELIVERY STEP */}
            {currentStep === "delivery" && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-brown mb-6">
                  📍 Delivery Information
                </h2>

                <div className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Phone & Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Map */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-3">
                      📍 Click on map to pin your location
                    </label>
                    <div
                      id="checkout-map"
                      className="w-full h-96 rounded-2xl border-4 border-caramel overflow-hidden"
                    />
                  </div>

                  {/* Address Search with Suggestions */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-brown mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Search or type your address..."
                      className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-caramel rounded-lg shadow-lg mt-1 z-50">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-caramel last:border-0 transition"
                          >
                            <p className="text-sm font-semibold text-brown">
                              {suggestion.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-brown mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="Cebu">Cebu</option>
                      <option value="Manila">Manila</option>
                      <option value="Davao">Davao</option>
                    </select>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleNextStep}
                    className="btn btn-primary btn-lg w-full mt-6"
                  >
                    ✓ Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENT STEP */}
            {currentStep === "payment" && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-brown mb-6">
                  💳 Payment Method
                </h2>

                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-caramel rounded-lg cursor-pointer hover:bg-amber-50 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="ml-3 font-semibold text-brown">
                        💵 Cash on Delivery
                      </span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-caramel rounded-lg cursor-pointer hover:bg-amber-50 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="ml-3 font-semibold text-brown">
                        🏦 Credit Card
                      </span>
                    </label>
                  </div>

                  {/* Card Details */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 p-6 bg-amber-50 rounded-2xl">
                      <div>
                        <label className="block text-sm font-semibold text-brown mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\s/g, "");
                            value = value.replace(/(\d{4})/g, "$1 ").trim();
                            setFormData((prev) => ({
                              ...prev,
                              cardNumber: value,
                            }));
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brown mb-2">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value =
                                  value.slice(0, 2) + "/" + value.slice(2, 4);
                              }
                              setFormData((prev) => ({
                                ...prev,
                                cardExpiry: value,
                              }));
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brown mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cardCVV"
                            value={formData.cardCVV}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);
                              setFormData((prev) => ({
                                ...prev,
                                cardCVV: value,
                              }));
                            }}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handlePreviousStep}
                      className="btn btn-secondary flex-1"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="btn btn-primary flex-1"
                    >
                      Continue to Review ✓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEW STEP */}
            {currentStep === "review" && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-brown mb-6">
                  👀 Review Your Order
                </h2>

                <div className="space-y-6">
                  {/* Delivery Info */}
                  <div className="p-4 bg-amber-50 rounded-2xl">
                    <h3 className="font-bold text-brown mb-2">
                      📍 Delivery To:
                    </h3>
                    <p className="text-sm">{formData.fullName}</p>
                    <p className="text-sm text-muted">{formData.address}</p>
                    <p className="text-sm text-muted">
                      {formData.city}, {formData.postalCode}
                    </p>
                    <p className="text-sm text-muted">📱 {formData.phone}</p>
                  </div>

                  {/* Payment Info */}
                  <div className="p-4 bg-amber-50 rounded-2xl">
                    <h3 className="font-bold text-brown mb-2">
                      💳 Payment Method:
                    </h3>
                    <p className="text-sm">
                      {formData.paymentMethod === "cash"
                        ? "💵 Cash on Delivery"
                        : "🏦 Credit Card"}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handlePreviousStep}
                      className="btn btn-secondary flex-1"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={loading}
                      className="btn btn-primary flex-1"
                    >
                      {loading ? "⏳ Placing Order..." : "✓ Place Order"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-3xl shadow-lg p-6 h-fit sticky top-8">
            <h3 className="text-2xl font-bold text-brown mb-6">
              📋 Order Summary
            </h3>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-brown">
                    ₱{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t-2 border-caramel pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal:</span>
                <span className="font-semibold">₱{totalPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee:</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? "FREE" : `₱${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t border-caramel pt-3">
                <span className="font-bold text-brown">Total:</span>
                <span className="font-bold text-accent text-2xl">
                  ₱{finalTotal.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
