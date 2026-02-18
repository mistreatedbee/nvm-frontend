import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminLogisticsAPI } from '../lib/api';

const defaultZone = {
  name: '',
  centerLat: '',
  centerLng: '',
  radiusKm: 10,
  baseFee: 0,
  feePerKm: 0,
  minimumOrderValue: 0,
  estimatedDays: 2,
  isActive: true,
  sortOrder: 0
};

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

export function AdminLogistics() {
  const [zones, setZones] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [zoneForm, setZoneForm] = useState<any>(defaultZone);
  const [pointForm, setPointForm] = useState<any>(defaultPoint);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [zonesRes, pointsRes] = await Promise.all([
        adminLogisticsAPI.listZones({ page: 1, limit: 100 }),
        adminLogisticsAPI.listPickupPoints({ page: 1, limit: 100 })
      ]);
      setZones(zonesRes.data?.data || []);
      setPoints(pointsRes.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load logistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveZone = async () => {
    if (!zoneForm.name || zoneForm.centerLat === '' || zoneForm.centerLng === '') {
      return toast.error('Name and center coordinates are required');
    }

    const payload = {
      name: zoneForm.name,
      center: { lat: Number(zoneForm.centerLat), lng: Number(zoneForm.centerLng) },
      radiusKm: Number(zoneForm.radiusKm || 0),
      baseFee: Number(zoneForm.baseFee || 0),
      feePerKm: Number(zoneForm.feePerKm || 0),
      minimumOrderValue: Number(zoneForm.minimumOrderValue || 0),
      estimatedDays: Number(zoneForm.estimatedDays || 2),
      isActive: !!zoneForm.isActive,
      sortOrder: Number(zoneForm.sortOrder || 0)
    };

    try {
      if (editingZone) await adminLogisticsAPI.updateZone(editingZone, payload);
      else await adminLogisticsAPI.createZone(payload);
      setZoneForm(defaultZone);
      setEditingZone(null);
      toast.success(editingZone ? 'Zone updated' : 'Zone created');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save zone');
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
      if (editingPoint) await adminLogisticsAPI.updatePickupPoint(editingPoint, payload);
      else await adminLogisticsAPI.createPickupPoint(payload);
      setPointForm(defaultPoint);
      setEditingPoint(null);
      toast.success(editingPoint ? 'Pickup point updated' : 'Pickup point created');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save pickup point');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Logistics</h1>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Delivery Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input className="border rounded p-2" placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Center lat" value={zoneForm.centerLat} onChange={(e) => setZoneForm({ ...zoneForm, centerLat: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Center lng" value={zoneForm.centerLng} onChange={(e) => setZoneForm({ ...zoneForm, centerLng: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Radius km" value={zoneForm.radiusKm} onChange={(e) => setZoneForm({ ...zoneForm, radiusKm: Number(e.target.value) })} />
            <input className="border rounded p-2" type="number" placeholder="Base fee" value={zoneForm.baseFee} onChange={(e) => setZoneForm({ ...zoneForm, baseFee: Number(e.target.value) })} />
            <input className="border rounded p-2" type="number" placeholder="Fee/km" value={zoneForm.feePerKm} onChange={(e) => setZoneForm({ ...zoneForm, feePerKm: Number(e.target.value) })} />
            <input className="border rounded p-2" type="number" placeholder="Minimum order value" value={zoneForm.minimumOrderValue} onChange={(e) => setZoneForm({ ...zoneForm, minimumOrderValue: Number(e.target.value) })} />
            <input className="border rounded p-2" type="number" placeholder="Estimated days" value={zoneForm.estimatedDays} onChange={(e) => setZoneForm({ ...zoneForm, estimatedDays: Number(e.target.value) })} />
            <input className="border rounded p-2" type="number" placeholder="Sort order" value={zoneForm.sortOrder} onChange={(e) => setZoneForm({ ...zoneForm, sortOrder: Number(e.target.value) })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={saveZone}>{editingZone ? 'Update Zone' : 'Create Zone'}</button>
          </div>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div key={zone._id} className="border rounded p-3 flex items-center justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{zone.name}</div>
                  <div>R {zone.baseFee} | {zone.radiusKm} km | {zone.isActive ? 'ACTIVE' : 'INACTIVE'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="border rounded px-2 py-1 text-xs" onClick={() => adminLogisticsAPI.activateZone(zone._id, !zone.isActive).then(load)}>Toggle</button>
                  <button className="border rounded px-2 py-1 text-xs" onClick={() => setZones((prev) => {
                    const idx = prev.findIndex((item) => item._id === zone._id);
                    if (idx <= 0) return prev;
                    const next = [...prev];
                    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                    adminLogisticsAPI.reorderZones(next.map((item) => item._id)).then(load);
                    return next;
                  })}>Up</button>
                  <button className="border rounded px-2 py-1 text-xs" onClick={() => {
                    setEditingZone(zone._id);
                    setZoneForm({
                      name: zone.name || '',
                      centerLat: zone.center?.lat ?? '',
                      centerLng: zone.center?.lng ?? '',
                      radiusKm: zone.radiusKm ?? 0,
                      baseFee: zone.baseFee ?? 0,
                      feePerKm: zone.feePerKm ?? 0,
                      minimumOrderValue: zone.minimumOrderValue ?? 0,
                      estimatedDays: zone.estimatedDays ?? 2,
                      isActive: zone.isActive !== false,
                      sortOrder: zone.sortOrder ?? 0
                    });
                  }}>Edit</button>
                </div>
              </div>
            ))}
            {!loading && !zones.length ? <p className="text-sm text-gray-500">No zones found.</p> : null}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Platform Pickup Points</h2>
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
                  <button className="border rounded px-2 py-1 text-xs text-red-600" onClick={() => adminLogisticsAPI.deletePickupPoint(point._id).then(load)}>Delete</button>
                </div>
              </div>
            ))}
            {!loading && !points.length ? <p className="text-sm text-gray-500">No pickup points found.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
