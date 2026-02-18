import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminLogisticsAPI, vendorLogisticsAPI } from '../lib/api';

const defaultPoint = {
  name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  lat: '',
  lng: '',
  instructions: '',
  isActive: true
};

export function VendorLogistics() {
  const [settings, setSettings] = useState<any>({ enabledZones: [], freeDeliveryThreshold: '', pickupEnabled: false });
  const [zones, setZones] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [pointForm, setPointForm] = useState<any>(defaultPoint);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsRes, zonesRes, pointsRes] = await Promise.all([
        vendorLogisticsAPI.getSettings(),
        adminLogisticsAPI.listZones({ page: 1, limit: 100 }),
        vendorLogisticsAPI.listPickupPoints()
      ]);
      setSettings(settingsRes.data?.data || { enabledZones: [], freeDeliveryThreshold: '', pickupEnabled: false });
      setZones(zonesRes.data?.data || []);
      setPoints(pointsRes.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load vendor logistics');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSettings = async () => {
    try {
      await vendorLogisticsAPI.updateSettings({
        enabledZones: settings.enabledZones || [],
        freeDeliveryThreshold: settings.freeDeliveryThreshold === '' ? null : Number(settings.freeDeliveryThreshold),
        pickupEnabled: !!settings.pickupEnabled
      });
      toast.success('Logistics settings updated');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    }
  };

  const savePoint = async () => {
    if (!pointForm.name || pointForm.lat === '' || pointForm.lng === '' || !pointForm.street || !pointForm.city || !pointForm.country) {
      return toast.error('Name, coordinates, street, city and country are required');
    }

    const payload = {
      name: pointForm.name,
      address: {
        street: pointForm.street,
        city: pointForm.city,
        state: pointForm.state || '',
        country: pointForm.country,
        zipCode: pointForm.zipCode || ''
      },
      location: { lat: Number(pointForm.lat), lng: Number(pointForm.lng) },
      instructions: pointForm.instructions || '',
      isActive: !!pointForm.isActive
    };

    try {
      if (editingPoint) await vendorLogisticsAPI.updatePickupPoint(editingPoint, payload);
      else await vendorLogisticsAPI.createPickupPoint(payload);
      setPointForm(defaultPoint);
      setEditingPoint(null);
      toast.success(editingPoint ? 'Pickup point updated' : 'Pickup point created');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save pickup point');
    }
  };

  const toggleZone = (zoneId: string) => {
    const set = new Set(settings.enabledZones || []);
    if (set.has(zoneId)) set.delete(zoneId);
    else set.add(zoneId);
    setSettings({ ...settings, enabledZones: Array.from(set) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-nvm-dark-900">Vendor Logistics</h1>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Delivery Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input className="border rounded p-2" type="number" placeholder="Free delivery threshold" value={settings.freeDeliveryThreshold ?? ''} onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!settings.pickupEnabled} onChange={(e) => setSettings({ ...settings, pickupEnabled: e.target.checked })} />
              Pickup enabled
            </label>
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={saveSettings}>Save Settings</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {zones.filter((zone) => zone.isActive).map((zone) => (
              <label key={zone._id} className="border rounded p-2 text-sm flex items-center gap-2">
                <input type="checkbox" checked={(settings.enabledZones || []).includes(zone._id)} onChange={() => toggleZone(zone._id)} />
                {zone.name} (R {zone.baseFee})
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Pickup Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="border rounded p-2" placeholder="Name" value={pointForm.name} onChange={(e) => setPointForm({ ...pointForm, name: e.target.value })} />
            <input className="border rounded p-2" placeholder="Street" value={pointForm.street} onChange={(e) => setPointForm({ ...pointForm, street: e.target.value })} />
            <input className="border rounded p-2" placeholder="City" value={pointForm.city} onChange={(e) => setPointForm({ ...pointForm, city: e.target.value })} />
            <input className="border rounded p-2" placeholder="Country" value={pointForm.country} onChange={(e) => setPointForm({ ...pointForm, country: e.target.value })} />
            <input className="border rounded p-2" placeholder="State" value={pointForm.state} onChange={(e) => setPointForm({ ...pointForm, state: e.target.value })} />
            <input className="border rounded p-2" placeholder="Zip code" value={pointForm.zipCode} onChange={(e) => setPointForm({ ...pointForm, zipCode: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Lat" value={pointForm.lat} onChange={(e) => setPointForm({ ...pointForm, lat: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Lng" value={pointForm.lng} onChange={(e) => setPointForm({ ...pointForm, lng: e.target.value })} />
            <input className="border rounded p-2 md:col-span-2" placeholder="Instructions" value={pointForm.instructions} onChange={(e) => setPointForm({ ...pointForm, instructions: e.target.value })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={savePoint}>{editingPoint ? 'Update Pickup Point' : 'Create Pickup Point'}</button>
          </div>
          <div className="space-y-2">
            {points.map((point) => (
              <div key={point._id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{point.name}</div>
                  <div>{point.address?.street}, {point.address?.city}, {point.address?.country}</div>
                </div>
                <div className="flex gap-2">
                  <button className="border rounded px-2 py-1 text-xs" onClick={() => {
                    setEditingPoint(point._id);
                    setPointForm({
                      name: point.name || '',
                      street: point.address?.street || '',
                      city: point.address?.city || '',
                      state: point.address?.state || '',
                      country: point.address?.country || '',
                      zipCode: point.address?.zipCode || '',
                      lat: point.location?.coordinates?.[1] ?? '',
                      lng: point.location?.coordinates?.[0] ?? '',
                      instructions: point.instructions || '',
                      isActive: point.isActive !== false
                    });
                  }}>Edit</button>
                  <button className="border rounded px-2 py-1 text-xs text-red-600" onClick={() => vendorLogisticsAPI.deletePickupPoint(point._id).then(load)}>Delete</button>
                </div>
              </div>
            ))}
            {!points.length ? <p className="text-sm text-gray-500">No pickup points found.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
