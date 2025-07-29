// src/components/MilitarySupport/AnonymousChatSelector.tsx - COMPACT VERSION

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Loader2 } from 'lucide-react';
import { anonymousMilitaryChatApi, type AnonymousChatRoom } from '@/api/military-support/anonymousMilitaryChatApi';

export default function AnonymousChatSelector() {
  const [rooms, setRooms] = useState<AnonymousChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await anonymousMilitaryChatApi.getAnonymousRooms();
      setRooms(roomsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Failed to load chat rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/military-support"
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Military Support
          </Link>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Chat Rooms Unavailable</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadRooms}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/military-support"
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Military Support
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Anonymous Military Chat Rooms
            </h1>
            <p className="text-slate-600">
              Connect with fellow service members in a safe, anonymous environment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - COMPACT WITH PROPER SPACING */}
      <div className="max-w-6xl mx-auto px-4 py-6 pb-8">

        {/* Two Column Layout: Privacy + Crisis Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Privacy Notice - Compact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Your Privacy & Safety</h3>
            </div>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Anonymous names assigned automatically</li>
              <li>• No registration required</li>
              <li>• Messages deleted after 24 hours</li>
              <li>• Peer support, not professional counseling</li>
            </ul>
          </div>

          {/* Crisis Resources - Compact */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-900 mb-3">Crisis? Get Help Now</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-red-800">Veterans Crisis</div>
                <div className="text-red-700 font-mono">988 (Press 1)</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-800">Text Support</div>
                <div className="text-red-700 font-mono">838255</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Rooms - HORIZONTAL GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/military-support/chat/${room.id}`}
              className="group block"
            >
              <div className="bg-white rounded-lg border border-slate-200 p-6 h-full hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

                {/* Compact Room Content */}
                <div className="text-center space-y-3">
                  {/* Icon */}
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {room.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {room.name}
                  </h3>

                  {/* Description - Shorter */}
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {room.description}
                  </p>

                  {/* Online Count - Compact */}
                  <div className="flex items-center justify-center text-slate-500 text-sm">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{room.memberCount} online</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <div className="bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                      Join Chat
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
