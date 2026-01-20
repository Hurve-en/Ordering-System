import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fadeInLeft">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-coffee-900 mb-6 leading-tight">
                Your Favorite Coffee,
                <span className="text-coffee-700"> Delivered Fresh</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the finest coffee in Cebu. Order now and get your
                favorite brew delivered to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-8 py-4 bg-coffee-900 text-white rounded-lg font-semibold hover:bg-coffee-800 transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Order Now ☕
                </button>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 bg-white text-coffee-900 border-2 border-coffee-900 rounded-lg font-semibold hover:bg-coffee-50 transition duration-300"
                  >
                    Join Us
                  </button>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="animate-fadeInRight flex justify-center">
              <div className="text-9xl animate-float">☕</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-coffee-900 mb-16">
            Why Choose Mt Apo's Coffee?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-coffee-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2 animate-slideUp">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-coffee-900 mb-4">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Get your coffee delivered in minutes. We guarantee fresh, hot
                coffee at your doorstep.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="bg-coffee-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2 animate-slideUp"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-coffee-900 mb-4">
                Customizable
              </h3>
              <p className="text-gray-600">
                Choose your coffee strength, milk type, and size. Perfect
                coffee, your way!
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="bg-coffee-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2 animate-slideUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-coffee-900 mb-4">
                Cebu Wide
              </h3>
              <p className="text-gray-600">
                Serving all of Cebu with premium quality coffee. Your
                neighborhood barista online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-coffee-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-coffee-700 to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready for Your Perfect Cup?
          </h2>
          <p className="text-xl text-coffee-200 mb-8">
            Join thousands of coffee lovers in Cebu enjoying fresh, delicious
            coffee delivered to their door.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? "/menu" : "/register")}
            className="px-10 py-4 bg-white text-coffee-900 rounded-lg font-bold text-lg hover:bg-coffee-100 transition duration-300 transform hover:scale-105 active:scale-95 shadow-xl"
          >
            {isAuthenticated ? "Start Ordering" : "Get Started Free"} →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
