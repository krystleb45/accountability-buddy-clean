// src/components/MilitarySupport/MoodCheckInModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: number, note?: string) => Promise<void>;
  sessionId: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😞', label: 'Really struggling', color: 'text-red-500' },
  { value: 2, emoji: '😕', label: 'Having a tough day', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Getting by', color: 'text-yellow-500' },
  { value: 4, emoji: '😊', label: 'Doing well', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Feeling great', color: 'text-emerald-500' }
];

export default function MoodCheckInModal({ isOpen, onClose, onSubmit }: Props) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedMood(null);
      setNote('');
      setShowNote(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    try {
      setIsSubmitting(true);
      await onSubmit(selectedMood, note.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to submit mood check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const selectedMoodOption = MOOD_OPTIONS.find(option => option.value === selectedMood);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Daily Check-In</h2>
              <p className="text-blue-100 text-sm">How are you feeling today?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* Mood Selection */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 font-medium">Select how you're feeling:</p>

            <div className="space-y-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    selectedMood === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <div className={`font-medium ${option.color}`}>{option.label}</div>
                      <div className="text-sm text-gray-500">Mood level {option.value}/5</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Mood Feedback */}
          {selectedMoodOption && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{selectedMoodOption.emoji}</span>
                <span className={`font-medium ${selectedMoodOption.color}`}>
                  {selectedMoodOption.label}
                </span>
              </div>

              {selectedMoodOption.value <= 2 && (
                <div className="text-sm text-gray-600 bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-medium text-red-800 mb-1">Remember, you're not alone.</p>
                  <p>If you're in crisis, please reach out: <strong>Veterans Crisis Line: 988 (Press 1)</strong></p>
                </div>
              )}

              {selectedMoodOption.value === 3 && (
                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p>Some days are harder than others. Consider connecting with others in our chat rooms.</p>
                </div>
              )}

              {selectedMoodOption.value >= 4 && (
                <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded p-3">
                  <p>Great to hear you're doing well! Consider sharing your positivity with others in our community.</p>
                </div>
              )}
            </div>
          )}

          {/* Optional Note Section */}
          <div className="mb-6">
            {!showNote ? (
              <button
                onClick={() => setShowNote(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Add an anonymous note (optional)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Anything you'd like to share anonymously?
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="This helps us understand how our community is doing..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500">
                  {note.length}/500 characters • This is completely anonymous
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedMood === null || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your check-in is completely anonymous and helps us support our community better.
          </p>
        </div>
      </div>
    </div>
  );
}
