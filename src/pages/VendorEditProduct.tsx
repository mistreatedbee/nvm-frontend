import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { categoriesAPI, productsAPI, vendorsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, DollarSign, Tag } from 'lucide-react';

function isMongoId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

interface ImageFile {
  // For existing images, `file` will be undefined and `url` will be set.
  file?: File;
  preview: string;
  url?: string;
}

export function VendorEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    productType: 'physical',
    stock: '',
    sku: '',
    tags: [] as string[],
    trackInventory: true,
    lowStockThreshold: '5'
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const productId = useMemo(() => id || '', [id]);

  useEffect(() => {
    if (!productId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchData = async () => {
    try {
      const [vendorRes, categoriesRes, productRes] = await Promise.all([
        vendorsAPI.getMyProfile(),
        categoriesAPI.getAll(),
        productsAPI.getById(productId)
      ]);

      setVendor(vendorRes.data.data);

      const categoriesData =
        (categoriesRes as any).data?.data ??
        (categoriesRes as any).data ??
        [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const product = productRes.data.data;

      setFormData({
        name: product?.name || '',
        description: product?.description || '',
        shortDescription: product?.shortDescription || '',
        price: product?.price != null ? String(product.price) : '',
        category: typeof product?.category === 'string' ? product.category : product?.category?._id || '',
        productType: product?.productType || 'physical',
        stock: product?.stock != null ? String(product.stock) : '',
        sku: product?.sku || '',
        tags: Array.isArray(product?.tags) ? product.tags : [],
        trackInventory: product?.trackInventory ?? true,
        lowStockThreshold: product?.lowStockThreshold != null ? String(product.lowStockThreshold) : '5'
      });

      const existingImages: ImageFile[] = (product?.images || [])
        .filter((img: any) => img?.url)
        .map((img: any) => ({ preview: img.url, url: img.url }));
      setImageFiles(existingImages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load product');
      navigate('/vendor/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFiles(prev => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const tag = e.currentTarget.value.trim();
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const convertFileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.description.trim()) return toast.error('Product description is required');
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error('Valid price is required');
    if (!formData.category) return toast.error('Category is required');
    if (imageFiles.length === 0) return toast.error('At least one product image is required');

    setSubmitting(true);
    try {
      // Ensure category is ObjectId if categories loaded
      const selectedCategory = formData.category;
      let categoryId = selectedCategory;
      if (!isMongoId(selectedCategory)) {
        const match = categories.find((c: any) => c?._id && (c.slug === selectedCategory || c.name === selectedCategory));
        if (!match?._id) {
          toast.error('Categories are not loaded yet. Please refresh and try again.');
          setSubmitting(false);
          return;
        }
        categoryId = match._id;
      }

      // Build final images array: keep existing URLs; convert newly added files to data URLs
      const imageUrls: string[] = [];
      for (const img of imageFiles) {
        if (img.file) imageUrls.push(await convertFileToDataUrl(img.file));
        else if (img.url) imageUrls.push(img.url);
        else if (img.preview) imageUrls.push(img.preview);
      }
      const images = imageUrls.map(url => ({ url }));

      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        price: parseFloat(formData.price),
        category: categoryId,
        productType: formData.productType,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        sku: formData.sku.trim() || undefined,
        images,
        tags: formData.tags,
        trackInventory: formData.trackInventory,
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      };

      await productsAPI.update(productId, productData);
      toast.success('Product updated successfully!');
      navigate('/vendor/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvm-green-primary"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">You need to create a vendor profile first</p>
          <Link
            to="/vendor/setup"
            className="inline-flex items-center px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600"
          >
            Create Vendor Profile
          </Link>
        </div>
      </div>
    );
  }

  if (vendor.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Pending Approval</h2>
            <p className="text-yellow-700 mb-4">Your vendor profile is pending admin approval. You'll be able to edit products once approved.</p>
            <Link
              to="/vendor/dashboard"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/vendor/products"
            className="inline-flex items-center text-nvm-green-primary hover:text-nvm-green-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">Edit Product</h1>
          <p className="text-gray-600">Update your product details and save changes</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (ZAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              >
                <option value="physical">Physical Product</option>
                <option value="digital">Digital Product</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Optional)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Keep at least one image. You can add new images or remove existing ones.</p>

            <div className="mb-4">
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-nvm-green-primary hover:bg-nvm-green-50/50 transition-all">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageFiles.map((imageFile, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageFile.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImageFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              onKeyDown={handleTagInput}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              placeholder="Press Enter to add a tag"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-nvm-green-100 text-nvm-green-800 rounded-full text-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

