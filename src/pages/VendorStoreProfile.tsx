import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorsAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type StoreProfileForm = {
  storeName: string;
  usernameSlug: string;
  bio: string;
  about: string;
  category: string;
  phone: string;
  email: string;
  businessHours: string;
  privacy: { showPhone: boolean; showEmail: boolean };
  location: {
    country: string;
    state: string;
    city: string;
    suburb: string;
    addressLine: string;
  };
  socialLinks: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    website: string;
  };
  policies: {
    returns: string;
    shipping: string;
  };
};

const initialForm: StoreProfileForm = {
  storeName: '',
  usernameSlug: '',
  bio: '',
  about: '',
  category: 'other',
  phone: '',
  email: '',
  businessHours: '',
  privacy: { showPhone: true, showEmail: true },
  location: {
    country: '',
    state: '',
    city: '',
    suburb: '',
    addressLine: ''
  },
  socialLinks: {
    whatsapp: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    website: ''
  },
  policies: {
    returns: '',
    shipping: ''
  }
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function VendorStoreProfile() {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string>('');
  const [form, setForm] = useState<StoreProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await vendorsAPI.getMyProfile();
        const vendor = me.data?.data;
        if (!vendor?._id) {
          toast.error('No vendor profile found. Complete vendor registration first.');
          navigate('/vendor/setup');
          return;
        }

        setVendorId(vendor._id);
        setForm({
          storeName: vendor.storeName || '',
          usernameSlug: vendor.usernameSlug || vendor.slug || '',
          bio: vendor.bio || vendor.description || '',
          about: vendor.about || vendor.description || '',
          category: vendor.category || 'other',
          phone: vendor.phone || '',
          email: vendor.email || '',
          businessHours: vendor.businessHours || '',
          privacy: {
            showPhone: vendor.privacy?.showPhone ?? true,
            showEmail: vendor.privacy?.showEmail ?? true
          },
          location: {
            country: vendor.location?.country || vendor.address?.country || '',
            state: vendor.location?.state || vendor.address?.state || '',
            city: vendor.location?.city || vendor.address?.city || '',
            suburb: vendor.location?.suburb || '',
            addressLine: vendor.location?.addressLine || vendor.address?.street || ''
          },
          socialLinks: {
            whatsapp: vendor.socialLinks?.whatsapp || '',
            facebook: vendor.socialLinks?.facebook || vendor.socialMedia?.facebook || '',
            instagram: vendor.socialLinks?.instagram || vendor.socialMedia?.instagram || '',
            tiktok: vendor.socialLinks?.tiktok || '',
            website: vendor.socialLinks?.website || vendor.website || ''
          },
          policies: {
            returns: vendor.policies?.returns || vendor.settings?.returnPolicy || '',
            shipping: vendor.policies?.shipping || vendor.settings?.shippingPolicy || ''
          }
        });
        setProfileImagePreview(vendor.profileImage?.url || vendor.logo?.url || '');
        setCoverImagePreview(vendor.coverImage?.url || vendor.banner?.url || '');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load store profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const publicUrl = useMemo(() => {
    if (!form.usernameSlug) return '';
    return `${window.location.origin}/vendors/${form.usernameSlug}`;
  }, [form.usernameSlug]);

  const setField = (field: keyof StoreProfileForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setNested = (parent: keyof StoreProfileForm, key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [key]: value
      }
    }));
  };

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or less');
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'profile') {
      setProfileImageFile(file);
      setProfileImagePreview(preview);
    } else {
      setCoverImageFile(file);
      setCoverImagePreview(preview);
    }
  };

  const handleSave = async () => {
    if (!vendorId) return;
    if (!form.storeName.trim()) {
      toast.error('Store name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        usernameSlug: slugify(form.usernameSlug || form.storeName),
        description: form.bio || form.about
      };

      await vendorsAPI.upsertProfile(vendorId, payload);

      if (profileImageFile || coverImageFile) {
        const imageForm = new FormData();
        if (profileImageFile) imageForm.append('profileImage', profileImageFile);
        if (coverImageFile) imageForm.append('coverImage', coverImageFile);
        await vendorsAPI.uploadProfileImages(vendorId, imageForm);
      }

      setForm((prev) => ({
        ...prev,
        usernameSlug: slugify(prev.usernameSlug || prev.storeName)
      }));
      setProfileImageFile(null);
      setCoverImageFile(null);
      toast.success('Store profile saved');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">Loading store profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nvm-dark-900">My Store Profile</h1>
          <p className="text-gray-600">Set up your public storefront details and branding.</p>
          {publicUrl && (
            <p className="text-sm mt-2">
              Public URL: <a className="text-nvm-green-primary underline" href={publicUrl}>{publicUrl}</a>
            </p>
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => onSelectImage(e, 'profile')} />
                {profileImagePreview && (
                  <img src={profileImagePreview} alt="Profile preview" className="mt-3 h-32 w-32 rounded-lg object-cover border" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => onSelectImage(e, 'cover')} />
                {coverImagePreview && (
                  <img src={coverImagePreview} alt="Cover preview" className="mt-3 h-32 w-full rounded-lg object-cover border" />
                )}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Store Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name *</label>
                <input className="w-full border rounded-lg p-2" value={form.storeName} onChange={(e) => {
                  setField('storeName', e.target.value);
                  if (!form.usernameSlug) setField('usernameSlug', slugify(e.target.value));
                }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store URL Slug *</label>
                <input className="w-full border rounded-lg p-2" value={form.usernameSlug} onChange={(e) => setField('usernameSlug', slugify(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input className="w-full border rounded-lg p-2" value={form.category} onChange={(e) => setField('category', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Hours</label>
                <input className="w-full border rounded-lg p-2" value={form.businessHours} onChange={(e) => setField('businessHours', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea className="w-full border rounded-lg p-2" rows={3} value={form.bio} onChange={(e) => setField('bio', e.target.value)} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">About</label>
              <textarea className="w-full border rounded-lg p-2" rows={4} value={form.about} onChange={(e) => setField('about', e.target.value)} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Contact and Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded-lg p-2" placeholder="Phone Number" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="Email Address" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="Country" value={form.location.country} onChange={(e) => setNested('location', 'country', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="State / Province" value={form.location.state} onChange={(e) => setNested('location', 'state', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="City" value={form.location.city} onChange={(e) => setNested('location', 'city', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="Suburb / Township" value={form.location.suburb} onChange={(e) => setNested('location', 'suburb', e.target.value)} />
            </div>
            <input className="border rounded-lg p-2 w-full mt-4" placeholder="Address Line" value={form.location.addressLine} onChange={(e) => setNested('location', 'addressLine', e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.privacy.showPhone} onChange={(e) => setNested('privacy', 'showPhone', e.target.checked)} />
                Show phone publicly
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.privacy.showEmail} onChange={(e) => setNested('privacy', 'showEmail', e.target.checked)} />
                Show email publicly
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Social Links and Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded-lg p-2" placeholder="WhatsApp" value={form.socialLinks.whatsapp} onChange={(e) => setNested('socialLinks', 'whatsapp', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="Facebook" value={form.socialLinks.facebook} onChange={(e) => setNested('socialLinks', 'facebook', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="Instagram" value={form.socialLinks.instagram} onChange={(e) => setNested('socialLinks', 'instagram', e.target.value)} />
              <input className="border rounded-lg p-2" placeholder="TikTok" value={form.socialLinks.tiktok} onChange={(e) => setNested('socialLinks', 'tiktok', e.target.value)} />
              <input className="border rounded-lg p-2 md:col-span-2" placeholder="Website" value={form.socialLinks.website} onChange={(e) => setNested('socialLinks', 'website', e.target.value)} />
            </div>
            <textarea className="w-full border rounded-lg p-2 mt-4" rows={3} placeholder="Returns Policy" value={form.policies.returns} onChange={(e) => setNested('policies', 'returns', e.target.value)} />
            <textarea className="w-full border rounded-lg p-2 mt-4" rows={3} placeholder="Shipping Policy" value={form.policies.shipping} onChange={(e) => setNested('policies', 'shipping', e.target.value)} />
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-nvm-green-primary text-white rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Store Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
