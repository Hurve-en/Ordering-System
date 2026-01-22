import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/premium.css";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    size: string;
    roastLevel: string;
  };
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  deliveryAddress: string;
  orderItems?: OrderItem[];
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const url = statusFilter
        ? `http://localhost:5000/api/admin/orders?status=${statusFilter}`
        : "http://localhost:5000/api/admin/orders";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(orders.map((o) => (o.id === orderId ? response.data.data : o)));
      setSelectedOrder(response.data.data);
    } catch (err) {
      alert("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
      preparing: { bg: "bg-purple-100", text: "text-purple-800" },
      ready: { bg: "bg-green-100", text: "text-green-800" },
      delivered: { bg: "bg-green-200", text: "text-green-900" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = statusMap[status.toLowerCase()] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };
    return `${s.bg} ${s.text}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <p className="text-xl text-muted">Loading orders...</p>
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
              📦 Order Management
            </h1>
            <p className="text-lg text-muted">Manage all customer orders</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter */}
        <div className="mb-8 max-w-64">
          <label className="block text-sm font-semibold text-brown mb-3">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-brown mb-2">
                  No Orders Found
                </h3>
                <p className="text-muted">
                  No orders match your filter criteria
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-3xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition ${
                    selectedOrder?.id === order.id ? "ring-4 ring-accent" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-brown">
                        Order #{String(order.id).padStart(4, "0")}
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        {order.user?.name} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-lg">
                    <span className="text-muted">
                      {order.orderItems?.length || 0} items
                    </span>
                    <span className="font-bold text-accent">
                      ₱{order.total}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Details Sidebar */}
          {selectedOrder && (
            <div className="bg-white rounded-3xl shadow-lg p-6 h-fit sticky top-8">
              <h2 className="text-3xl font-bold text-brown mb-6">📋 Details</h2>

              {/* Customer Info */}
              <div className="mb-6 pb-6 border-b-2 border-caramel">
                <h3 className="font-bold text-brown mb-3 text-lg">
                  👤 Customer
                </h3>
                <p className="text-sm font-semibold text-brown">
                  {selectedOrder.user?.name}
                </p>
                <p className="text-sm text-muted">
                  {selectedOrder.user?.email}
                </p>
                <p className="text-sm text-muted">
                  {selectedOrder.user?.phone}
                </p>
              </div>

              {/* Items */}
              <div className="mb-6 pb-6 border-b-2 border-caramel">
                <h3 className="font-bold text-brown mb-3 text-lg">☕ Items</h3>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm bg-amber-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-brown">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-muted">×{item.quantity}</p>
                      </div>
                      <p className="font-bold text-accent">
                        ₱{(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 pb-6 border-b-2 border-caramel">
                <h3 className="font-bold text-brown mb-3 text-lg">
                  📍 Address
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>

              {/* Total */}
              <div className="mb-6 pb-6 border-b-2 border-caramel">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-brown">Total</span>
                  <span className="font-bold text-2xl text-accent">
                    ₱{selectedOrder.total}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-semibold text-brown mb-3">
                  Update Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  disabled={updating}
                  className="w-full px-4 py-3 border border-caramel rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
