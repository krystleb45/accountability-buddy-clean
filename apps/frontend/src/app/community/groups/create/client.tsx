// src/app/community/groups/create/client.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaUsers,
  FaLock,
  FaGlobe,
  FaTag,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaPlus} from 'react-icons/fa';

interface CreateGroupForm {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  inviteOnly: boolean;
  tags: string[];
}

const CreateGroupClient: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [form, setForm] = useState<CreateGroupForm>({
    name: '',
    description: '',
    category: 'study',
    isPublic: true,
    inviteOnly: false,
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    { id: 'fitness', label: 'Fitness & Health', icon: '💪', description: 'Workout groups, nutrition, wellness' },
    { id: 'study', label: 'Learning & Education', icon: '📚', description: 'Study groups, skill development, courses' },
    { id: 'career', label: 'Career & Business', icon: '💼', description: 'Professional development, networking' },
    { id: 'lifestyle', label: 'Lifestyle & Hobbies', icon: '🌱', description: 'Personal interests, hobbies, lifestyle' },
    { id: 'creative', label: 'Creative & Arts', icon: '🎨', description: 'Art, music, writing, creative projects' },
    { id: 'tech', label: 'Technology', icon: '💻', description: 'Programming, tech discussions, projects' }
  ];

  const handleInputChange = (field: keyof CreateGroupForm, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && form.tags.length < 5 && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Replace the handleSubmit function in your client.tsx with this:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name.trim() || !userId) return;

  setLoading(true);
  setError(null);

  try {
    console.log('🚀 [CLIENT] Submitting form data:', {
      name: form.name,
      description: form.description,
      category: form.category,
      isPublic: form.isPublic,
      tags: form.tags
    });

    // Map category ID to display name to match backend validation
    const categoryMap: { [key: string]: string } = {
      'fitness': 'Fitness & Health',
      'study': 'Learning & Education',
      'career': 'Career & Business',
      'lifestyle': 'Lifestyle & Hobbies',
      'creative': 'Creative & Arts',
      'tech': 'Technology'
    };

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: categoryMap[form.category] || form.category, // Map to display name
      privacy: form.isPublic ? 'Public Group' : 'Private Group',
      isPublic: form.isPublic,
      inviteOnly: form.inviteOnly,
      tags: form.tags
    };

    console.log('🚀 [CLIENT] Final payload being sent:', payload);

    // REAL API CALL - Replace the mock code
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 [CLIENT] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [CLIENT] API Error:', errorData);
      throw new Error(errorData.message || 'Failed to create group');
    }

    const result = await response.json();
    console.log('✅ [CLIENT] Success response:', result);

    setSuccess('Group created successfully! 🎉');

    // Redirect to the new group after a brief delay
    setTimeout(() => {
      if (result.data?.id) {
        router.push(`/community/groups/${result.data.id}`);
      } else {
        router.push('/community/groups');
      }
    }, 2000);

  } catch (err: any) {
    console.error('💥 [CLIENT] Failed to create group:', err);
    setError(err.message || 'Failed to create group. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const isFormValid = form.name.trim().length >= 3 && form.description.trim().length >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/community/groups"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Groups
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white flex items-center mb-2">
              <FaUsers className="mr-3 text-green-400" />
              Create New Group
            </h1>
            <p className="text-xl text-gray-300">
              Build a community around your interests and goals
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-600 text-white p-4 rounded-lg flex items-center"
          >
            <FaCheck className="mr-2" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-600 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <FaTimes className="mr-2" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-white">
              <FaTimes />
            </button>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-lg p-8 border border-gray-700"
        >
          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.name.length}/50 characters</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your group is about..."
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none h-24 resize-none"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/200 characters</p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('category', category.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    form.category === category.id
                      ? 'bg-green-600 border-green-400 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-green-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-sm">{category.label}</h3>
                  <p className="text-xs opacity-80">{category.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Privacy Settings
            </label>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="public"
                    name="privacy"
                    checked={form.isPublic}
                    onChange={() => {
                      handleInputChange('isPublic', true);
                      handleInputChange('inviteOnly', false);
                    }}
                    className="text-green-500 focus:ring-green-400"
                  />
                  <label htmlFor="public" className="ml-3 cursor-pointer">
                    <div className="flex items-center">
                      <FaGlobe className="text-green-400 mr-2" />
                      <span className="font-medium">Public Group</span>
                    </div>
                    <p className="text-sm text-gray-400 ml-6">Anyone can find and join this group</p>
                  </label>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="private"
                    name="privacy"
                    checked={!form.isPublic}
                    onChange={() => {
                      handleInputChange('isPublic', false);
                      handleInputChange('inviteOnly', true);
                    }}
                    className="text-green-500 focus:ring-green-400"
                  />
                  <label htmlFor="private" className="ml-3 cursor-pointer">
                    <div className="flex items-center">
                      <FaLock className="text-yellow-400 mr-2" />
                      <span className="font-medium">Private Group</span>
                    </div>
                    <p className="text-sm text-gray-400 ml-6">Only invited members can join</p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || form.tags.length >= 5}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded transition"
              >
                <FaPlus />
              </button>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <FaTag className="mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-200 hover:text-white"
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {form.tags.length}/5 tags • Tags help people find your group
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-400">
              <FaInfoCircle className="mr-2" />
              {!isFormValid
                ? 'Please fill in all required fields'
                : 'Ready to create your group!'
              }
            </div>

            <div className="flex gap-3">
              <Link
                href="/community/groups"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`px-6 py-3 rounded-lg transition flex items-center ${
                  isFormValid && !loading
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUsers className="mr-2" />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateGroupClient;
