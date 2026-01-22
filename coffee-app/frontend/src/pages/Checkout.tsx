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
    // Delivery Info
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "Cebu",
    postalCode: "",
    latitude: 10.3157,
    longitude: 123.8854,

    // Payment Info
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brown">Invalid checkout</h1>
          <button
            onClick={() => navigate("/menu")}
            className="mt-4 btn btn-primary"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="section-gap bg-gradient-to-r from-amber-900 to-amber-800 text-cream">
        <div className="container">
          <h1 className="text-5xl font-bold mb-2">🛍️ Checkout</h1>
          <p className="text-lg opacity-90">Complete your coffee order</p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="section-gap bg-white border-b border-caramel border-opacity-20">
        <div className="container">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {(["delivery", "payment", "review"] as const).map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition ${
                    currentStep === step
                      ? "bg-accent text-cream"
                      : ["delivery", "payment", "review"].indexOf(currentStep) >
                          index
                        ? "bg-green-500 text-cream"
                        : "bg-caramel bg-opacity-30 text-brown"
                  }`}
                >
                  {["delivery", "payment", "review"].indexOf(currentStep) >
                  index
                    ? "✓"
                    : index + 1}
                </div>
                <span
                  className={`ml-2 font-semibold ${currentStep === step ? "text-brown" : "text-muted"}`}
                >
                  {step === "delivery" && "Delivery"}
                  {step === "payment" && "Payment"}
                  {step === "review" && "Review"}
                </span>
                {index < 2 && (
                  <div className="flex-1 h-1 mx-4 bg-caramel bg-opacity-20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-gap">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800 font-semibold">⚠️ {error}</p>
                  </div>
                )}

                {/* Delivery Step */}
                {currentStep === "delivery" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-brown mb-6">
                      📍 Delivery Information
                    </h2>

                    <div>
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-brown mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brown mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>

                    {/* MAP CONTAINER */}
                    <div>
                      <label className="block text-sm font-semibold text-brown mb-3">
                        📍 Click on map to pin your location
                      </label>
                      <div
                        id="checkout-map"
                        className="w-full h-96 rounded-2xl border-4 border-caramel overflow-hidden"
                      />
                    </div>

                    {/* Address Search */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-brown mb-2">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-brown mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brown mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="6000"
                          className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Step */}
                {currentStep === "payment" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-brown mb-6">
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      <label
                        className="flex items-center p-4 border-2 border-caramel rounded-lg cursor-pointer hover:bg-cream transition"
                        style={{
                          borderColor:
                            formData.paymentMethod === "cash"
                              ? "var(--color-accent)"
                              : "",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === "cash"}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 font-semibold text-brown">
                          💵 Cash on Delivery (COD)
                        </span>
                        <span className="ml-auto text-sm text-muted">
                          Pay when order arrives
                        </span>
                      </label>

                      <label
                        className="flex items-center p-4 border-2 border-caramel rounded-lg cursor-pointer hover:bg-cream transition"
                        style={{
                          borderColor:
                            formData.paymentMethod === "card"
                              ? "var(--color-accent)"
                              : "",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 font-semibold text-brown">
                          💳 Credit/Debit Card
                        </span>
                      </label>
                    </div>

                    {formData.paymentMethod === "card" && (
                      <div className="space-y-4 pt-6 border-t border-caramel border-opacity-20">
                        <div>
                          <label className="block text-sm font-semibold text-brown mb-2">
                            Card Number *
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
                              Expiry (MM/YY) *
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                if (value.length >= 2) {
                                  value =
                                    value.substring(0, 2) +
                                    "/" +
                                    value.substring(2, 4);
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
                              CVV *
                            </label>
                            <input
                              type="text"
                              name="cardCVV"
                              value={formData.cardCVV}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 4) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    cardCVV: value,
                                  }));
                                }
                              }}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Step */}
                {currentStep === "review" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-brown mb-6">
                      Review Your Order
                    </h2>

                    <div className="bg-cream rounded-lg p-4">
                      <h3 className="font-semibold text-brown mb-4">
                        Delivery Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-brown">
                            Name:
                          </span>{" "}
                          {formData.fullName}
                        </p>
                        <p>
                          <span className="font-semibold text-brown">
                            Email:
                          </span>{" "}
                          {formData.email}
                        </p>
                        <p>
                          <span className="font-semibold text-brown">
                            Phone:
                          </span>{" "}
                          {formData.phone}
                        </p>
                        <p>
                          <span className="font-semibold text-brown">
                            Address:
                          </span>{" "}
                          {formData.address}, {formData.city}{" "}
                          {formData.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="bg-cream rounded-lg p-4">
                      <h3 className="font-semibold text-brown mb-4">
                        Payment Method
                      </h3>
                      <p className="text-sm">
                        {formData.paymentMethod === "cash"
                          ? "💵 Cash on Delivery"
                          : "💳 Credit/Debit Card"}
                      </p>
                    </div>

                    <div className="border-t border-caramel border-opacity-20 pt-6">
                      <p className="text-green-600 font-semibold text-center mb-4">
                        ✓ All information is correct. Ready to place order?
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {currentStep !== "delivery" && (
                    <button
                      onClick={handlePreviousStep}
                      className="flex-1 btn btn-secondary"
                    >
                      ← Back
                    </button>
                  )}

                  {currentStep !== "review" && (
                    <button
                      onClick={handleNextStep}
                      className="flex-1 btn btn-primary"
                    >
                      Next →
                    </button>
                  )}

                  {currentStep === "review" && (
                    <button
                      onClick={handleSubmitOrder}
                      disabled={loading}
                      className="flex-1 btn btn-primary"
                    >
                      {loading ? "⏳ Placing Order..." : "✓ Place Order"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-brown mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm py-2 border-b border-caramel border-opacity-20"
                    >
                      <span className="text-brown">
                        {item.name} ×{" "}
                        <span className="font-bold">{item.quantity}</span>
                      </span>
                      <span className="font-bold text-brown">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-caramel border-opacity-30 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-semibold">
                      ₱{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery Fee</span>
                    <span
                      className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-brown"}`}
                    >
                      ₱{deliveryFee.toFixed(2)}{" "}
                      {deliveryFee === 0 && (
                        <span className="text-xs">(FREE)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-caramel border-opacity-30">
                    <span className="font-bold text-brown">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      ₱{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
