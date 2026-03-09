import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { orderManagementAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  MapPin,
  Truck,
  Package,
  CheckCircle,
  Navigation,
  Calendar,
  Clock,
  MapPinned
} from 'lucide-react';

interface VendorOrderTrackingProps {
  orderId: string;
  orderStatus: string;
  fulfillmentMethod: 'delivery' | 'collection';
  onUpdate: () => void;
}

export function VendorOrderTracking({ 
  orderId, 
  orderStatus, 
  fulfillmentMethod,
  onUpdate 
}: VendorOrderTrackingProps) {
  const [updating, setUpdating] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    description: ''
  });

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Update order status to "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      await orderManagementAPI.updateStatus(orderId, { 
        status: newStatus,
        ...(newStatus === 'shipped' && {
          trackingNumber: prompt('Enter tracking number (optional):') || '',
          carrier: prompt('Enter carrier name (optional):') || ''
        })
      });
      toast.success('Order status updated!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!locationData.latitude || !locationData.longitude) {
      toast.error('Please enter latitude and longitude');
      return;
    }

    setUpdating(true);
    try {
      await orderManagementAPI.updateTrackingLocation(orderId, {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        address: locationData.address,
        description: locationData.description
      });
      toast.success('Location updated successfully!');
      setShowLocationForm(false);
      setLocationData({ latitude: '', longitude: '', address: '', description: '' });
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update location');
    } finally {
      setUpdating(false);
    }
  };

  const getLocationFromBrowser = () => {
    if ('geolocation' in navigator) {
      toast.loading('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          setLocationData({
            ...locationData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          toast.success('Location captured!');
        },
        (error) => {
          toast.dismiss();
          toast.error('Could not get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Status progression for delivery
  const deliveryStatuses = [
    { value: 'confirmed', label: 'Confirm Order', icon: CheckCircle, color: 'blue' },
    { value: 'processing', label: 'Start Processing', icon: Package, color: 'purple' },
    { value: 'shipped', label: 'Mark as Shipped', icon: Truck, color: 'indigo' },
    { value: 'delivered', label: 'Mark as Delivered', icon: CheckCircle, color: 'green' },
  ];

  // Status progression for collection
  const collectionStatuses = [
    { value: 'confirmed', label: 'Confirm Order', icon: CheckCircle, color: 'blue' },
    { value: 'processing', label: 'Start Preparing', icon: Package, color: 'purple' },
    { value: 'shipped', label: 'Ready for Collection', icon: MapPinned, color: 'indigo' },
    { value: 'delivered', label: 'Mark as Collected', icon: CheckCircle, color: 'green' },
  ];

  const statuses = fulfillmentMethod === 'delivery' ? deliveryStatuses : collectionStatuses;

  const getNextStatus = () => {
    const currentIndex = statuses.findIndex(s => s.value === orderStatus);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-nvm-dark-900 mb-6 flex items-center gap-2">
        {fulfillmentMethod === 'delivery' ? (
          <>
            <Truck className="w-6 h-6" />
            Delivery Tracking
          </>
        ) : (
          <>
            <MapPinned className="w-6 h-6" />
            Collection Status
          </>
        )}
      </h2>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Current Status</p>
        <p className="text-lg font-bold text-gray-900 capitalize">{orderStatus}</p>
      </div>

      {/* Next Action */}
      {nextStatus && (
        <div className="mb-6">
          <button
            onClick={() => handleStatusUpdate(nextStatus.value)}
            disabled={updating}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 bg-${nextStatus.color}-500 text-white rounded-lg hover:bg-${nextStatus.color}-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              backgroundColor: `var(--color-${nextStatus.color}-500, #6366f1)`,
            }}
          >
            <nextStatus.icon className="w-5 h-5" />
            {nextStatus.label}
          </button>
        </div>
      )}

      {/* Location Update for Delivery */}
      {fulfillmentMethod === 'delivery' && orderStatus === 'shipped' && (
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowLocationForm(!showLocationForm)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium mb-4"
          >
            <MapPin className="w-5 h-5" />
            {showLocationForm ? 'Hide Location Update' : 'Update Delivery Location'}
          </button>

          {showLocationForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  Update your current location to help customers track their delivery in real-time.
                </p>
                <button
                  onClick={getLocationFromBrowser}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Use My Current Location
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    placeholder="-26.2041"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    placeholder="28.0473"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Address/Location
                </label>
                <input
                  type="text"
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                  placeholder="e.g., On route to Sandton"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Description
                </label>
                <textarea
                  value={locationData.description}
                  onChange={(e) => setLocationData({ ...locationData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                  placeholder="e.g., Package is on the delivery vehicle, expected arrival in 30 minutes"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLocationUpdate}
                  disabled={updating || !locationData.latitude || !locationData.longitude}
                  className="flex-1 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Location'}
                </button>
                <button
                  onClick={() => setShowLocationForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Quick Status Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-900 mb-3">
          {fulfillmentMethod === 'delivery' ? 'Delivery Progress:' : 'Collection Progress:'}
        </p>
        <div className="space-y-2">
          {statuses.map((status, index) => (
            <div
              key={status.value}
              className={`flex items-center gap-3 text-sm ${
                orderStatus === status.value
                  ? 'text-nvm-green-primary font-medium'
                  : index < statuses.findIndex(s => s.value === orderStatus)
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                orderStatus === status.value
                  ? 'bg-nvm-green-primary text-white'
                  : index < statuses.findIndex(s => s.value === orderStatus)
                  ? 'bg-gray-300 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index < statuses.findIndex(s => s.value === orderStatus) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span>{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Tip:</strong> {fulfillmentMethod === 'delivery' 
            ? 'Update your location regularly so customers can track their delivery in real-time.'
            : 'Update the status to "Ready for Collection" when the order is prepared and ready to be picked up.'
          }
        </p>
      </div>
    </div>
  );
}

