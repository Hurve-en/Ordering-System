import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import { apiService } from "../services/api";
import { Order } from "../types";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await apiService.getOrders();
      console.log("Orders fetched:", data);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-purple-100 text-purple-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "DELIVERED":
        return "bg-green-200 text-green-900";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "CONFIRMED":
        return "✓";
      case "PREPARING":
        return "☕";
      case "READY":
        return "📦";
      case "DELIVERED":
        return "✓✓";
      case "CANCELLED":
        return "✕";
      default:
        return "•";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-coffee-900">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">📦</div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">
            No orders yet
          </h1>
          <p className="text-gray-600 mb-8">
            Start ordering your favorite Mt. Apo coffee!
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="px-8 py-3 bg-coffee-900 text-white rounded-lg font-bold hover:bg-coffee-800 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-coffee-900 mb-8">
          📦 My Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-coffee-100">
                <div>
                  <h3 className="text-lg font-bold text-coffee-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-bold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)} {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="font-bold text-coffee-900 mb-3">Items:</h4>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-gray-700 bg-coffee-50 p-3 rounded"
                      >
                        <span className="font-medium">
                          {/* Show product ID or generic name */}
                          Product × {item.quantity}
                        </span>
                        <span className="font-bold">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No items in this order</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 p-4 bg-coffee-50 rounded-lg">
                <h4 className="font-bold text-coffee-900 mb-2">
                  📍 Delivery Address:
                </h4>
                <p className="text-gray-700">{order.deliveryAddress}</p>
              </div>

              {/* Total & Action */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-coffee-700">
                    ₱{order.totalPrice.toFixed(2)}
                  </p>
                </div>
                {order.status === "PENDING" && (
                  <button
                    onClick={() => alert("Cancel functionality coming soon")}
                    className="px-6 py-2 bg-red-100 text-red-800 rounded-lg font-bold hover:bg-red-200 transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
