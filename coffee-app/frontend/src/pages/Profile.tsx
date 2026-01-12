import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { apiService } from '../services/api';
import { setUser } from '../redux/slices/authSlice';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Set initial form data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      });
    }

    // Initialize map
    const map = L.map(mapRef.current!).setView([10.3157, 123.8854], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Add initial marker if address exists
    if (user?.address) {
      const marker = L.marker([10.3157, 123.8854])
        .addTo(map)
        .bindPopup('📍 Your Delivery Address');
      markerRef.current = marker;
    }

    // Click to pin location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoordinates([lat, lng]);

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(map)
        .bindPopup(`📍 Your Location<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`);

      markerRef.current = marker;
    });

    return () => {
      map.remove();
    };
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updatedUser = await apiService.updateProfile(formData);
      dispatch(setUser(updatedUser));
      setMessage('✓ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-coffee-900 mb-8">👤 My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">📍 Set Default Delivery Location</h2>
              <p className="text-gray-600 mb-4">Click on the map to set your preferred delivery location</p>
              <div
                ref={mapRef}
                className="w-full h-80 rounded-lg border-2 border-coffee-200"
                style={{ minHeight: '320px' }}
              />
              {coordinates && (
                <p className="mt-4 text-sm text-green-600">
                  ✓ Location set at ({coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)})
                </p>
              )}
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">📮 Delivery Address</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-coffee-900 text-white font-bold rounded-lg hover:bg-coffee-800 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-2xl font-bold text-coffee-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            <div className="space-y-4 border-t-2 border-coffee-200 pt-6">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-bold text-coffee-900">{user?.phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-bold text-coffee-900">{user?.city || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-bold text-coffee-900">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;