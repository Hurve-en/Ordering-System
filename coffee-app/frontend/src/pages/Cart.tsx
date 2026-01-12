import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { removeFromCart, updateCartItem, clearCart } from '../redux/slices/cartSlice';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const { items, totalPrice } = useAppSelector((state: any) => state.cart);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">🛒</div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <button
            onClick={() => navigate('/menu')}
            className="px-8 py-3 bg-coffee-900 text-white rounded-lg font-bold hover:bg-coffee-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-coffee-900 mb-8">🛒 Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.productId} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-coffee-900">{item.product.name}</h3>
                    <p className="text-gray-600">₱{item.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity - 1 }))
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity + 1 }))
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-24">
                      <p className="text-lg font-bold text-coffee-900">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">₱{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-bold">TBD</span>
              </div>
              <div className="border-t-2 border-coffee-200 pt-4 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-coffee-700">₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-coffee-900 text-white rounded-lg font-bold hover:bg-coffee-800 transition mb-3"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/menu')}
              className="w-full py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition mb-3"
            >
              Continue Shopping
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full py-3 bg-red-100 text-red-800 rounded-lg font-bold hover:bg-red-200 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;