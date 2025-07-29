// src/app/military-support/page.client.tsx - WITH MOOD CHECK-IN

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, Users, Shield, Heart, MessageSquare, ExternalLink, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  fetchResources,
  fetchDisclaimer,
  type SupportResource,
  type Disclaimer,
} from '@/api/military-support/militarySupportApi';
import { DEFAULT_MILITARY_RESOURCES, DEFAULT_DISCLAIMER } from '@/data/defaultMilitaryResources';

// NEW IMPORTS
import MoodCheckInModal from '@/components/MilitarySupport/MoodCheckInModal';
import CommunityMoodWidget from '@/components/MilitarySupport/CommunityMoodWidget';
import { moodCheckInApi } from '@/api/military-support/moodCheckInApi';

// Emergency contacts with calming presentation
const CRISIS_RESOURCES = [
  {
    title: "Veterans Crisis Line",
    phone: "988 (Press 1)",
    text: "Text 838255",
    description: "24/7 free, confidential crisis support for veterans and their families",
    urgent: true
  },
  {
    title: "Military Crisis Line",
    phone: "1-800-273-8255",
    description: "24/7 support for active duty, National Guard, and Reserve",
    urgent: true
  },
  {
    title: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis counseling and suicide prevention",
    urgent: true
  }
];

export default function MilitarySupportPageClient() {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [disclaimer, setDisclaimer] = useState<Disclaimer | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed unused error state
  const [showAllResources, setShowAllResources] = useState(false);

  // NEW MOOD CHECK-IN STATE
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodSessionId, setMoodSessionId] = useState<string>('');
  const [hasCheckedMoodToday, setHasCheckedMoodToday] = useState(false);
  const [moodSubmissionTime, setMoodSubmissionTime] = useState(0); // NEW: To force widget refresh

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [disclaimerResult, resourcesResult] = await Promise.all([
          fetchDisclaimer(),
          fetchResources(),
        ]);

        if (disclaimerResult) {
          setDisclaimer(disclaimerResult);
        } else {
          setDisclaimer(DEFAULT_DISCLAIMER);
        }

        if (resourcesResult && resourcesResult.length > 0) {
          setResources(resourcesResult);
        } else {
          setResources(DEFAULT_MILITARY_RESOURCES);
        }

      } catch (err) {
        console.error('Error loading military support:', err);
        setDisclaimer(DEFAULT_DISCLAIMER);
        setResources(DEFAULT_MILITARY_RESOURCES);
        // Removed setError since error is not used
      } finally {
        setLoading(false);
      }
    })();

    // NEW: Initialize mood check-in system
    initializeMoodCheckIn();
  }, []);

  // NEW: Mood check-in initialization
  const initializeMoodCheckIn = async () => {
    try {
      // Get or create session ID for mood tracking (must start with "anon_" for middleware)
      let sessionId = localStorage.getItem('military-mood-session');
      if (!sessionId || !sessionId.startsWith('anon_')) {
        sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('military-mood-session', sessionId);
      }
      setMoodSessionId(sessionId);

      // Check if user has already submitted mood today
      try {
        const hasSubmitted = await moodCheckInApi.hasSubmittedToday(sessionId);
        setHasCheckedMoodToday(hasSubmitted);

        // Show modal if they haven't checked in today (after a brief delay)
        if (!hasSubmitted) {
          setTimeout(() => {
            setShowMoodModal(true);
          }, 2000); // 2 second delay so they can see the page first
        }
      } catch (apiError) {
        console.warn('Could not check daily mood status, assuming not submitted:', apiError);
        // If API fails, show the modal anyway (better to show than hide)
        setTimeout(() => {
          setShowMoodModal(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error initializing mood check-in:', error);
      // Still create session ID even if API fails (must start with "anon_")
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setMoodSessionId(sessionId);
    }
  };

  // NEW: Handle mood check-in submission
  const handleMoodSubmit = async (mood: number, note?: string) => {
    try {
      const result = await moodCheckInApi.submitMoodCheckIn(mood, note, moodSessionId);
      if (result.success) {
        setHasCheckedMoodToday(true);
        console.log('✅ Mood check-in submitted successfully');

        // Force refresh the community mood widget by updating its key
        setMoodSubmissionTime(Date.now());

      } else {
        console.error('Failed to submit mood check-in:', result.message);
      }
    } catch (error) {
      console.error('Error submitting mood check-in:', error);
    }
  };

  // Show only first 6 resources initially
  const displayedResources = showAllResources ? resources : resources.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Compact Hero Section */}
      <div className="text-center bg-white rounded-lg shadow-sm p-6 border-t-4 border-emerald-500">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Military Support Center</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          A safe space for service members, veterans, and families. You're not alone.
        </p>
      </div>

      {/* NEW: Community Mood Widget */}
      <CommunityMoodWidget
        key={`mood-${hasCheckedMoodToday}-${moodSubmissionTime}`}
        className="max-w-md mx-auto"
      />

      {/* Compact Crisis Resources */}
      <section className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-3">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-800">Need Someone to Talk To?</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {CRISIS_RESOURCES.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 text-center">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm">{resource.title}</h3>
              <p className="text-xl font-bold text-blue-700 mb-1">{resource.phone}</p>
              {resource.text && (
                <p className="text-sm font-semibold text-blue-600 mb-2">{resource.text}</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-blue-700 font-medium text-sm">Staffed by people who understand military life</p>
        </div>
      </section>

      {/* Disclaimer - Compact */}
      {disclaimer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Please note:</strong> {disclaimer.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Compact Additional Resources */}
      {!loading && (
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-800">Additional Resources</h2>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-2">No additional resources available at this time.</p>
              <p className="text-sm text-slate-400">Crisis support above is always available</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {displayedResources.map((resource) => (
                  <div key={resource._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-emerald-300">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center"
                    >
                      <h3 className="text-base font-semibold text-emerald-700 hover:text-emerald-800 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{resource.description}</p>
                      <div className="flex items-center justify-center text-emerald-600 text-sm font-medium">
                        <span>Learn more</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              {/* Show More/Less Button */}
              {resources.length > 6 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllResources(!showAllResources)}
                    className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {showAllResources ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less Resources
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show More Resources ({resources.length - 6} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Compact Anonymous Peer Support Section */}
      <section className="bg-emerald-50 rounded-lg shadow-sm p-6 border-t-4 border-emerald-500">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <Users className="w-5 h-5 mr-2 text-emerald-600" />
            <h2 className="text-xl font-bold text-emerald-800">Connect with Fellow Service Members</h2>
          </div>
          <p className="text-emerald-700 max-w-2xl mx-auto">
            Sometimes talking to someone who's been there helps. Connect anonymously in a safe, supportive environment.
          </p>
        </div>

        {/* Compact Feature highlights */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-emerald-200 text-center">
            <Shield className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800 mb-1 text-sm">Anonymous</h3>
            <p className="text-xs text-emerald-700">No registration required</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-emerald-200 text-center">
            <Heart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800 mb-1 text-sm">Peer Support</h3>
            <p className="text-xs text-emerald-700">Connect with others who understand</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-emerald-200 text-center">
            <MessageSquare className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800 mb-1 text-sm">Safe Space</h3>
            <p className="text-xs text-emerald-700">Moderated environment</p>
          </div>
        </div>

        {/* Chat Button */}
        <div className="text-center">
          <Link
            href="/military-support/chat"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Join Anonymous Chat Rooms
          </Link>

          <p className="text-xs text-emerald-600 mt-3 max-w-md mx-auto">
            By joining, you acknowledge this is peer support, not professional counseling.
            For crisis situations, please use the hotlines above.
          </p>
        </div>

        {/* NEW: Manual Mood Check-in Button */}
        {hasCheckedMoodToday && (
          <div className="text-center mt-4 pt-4 border-t border-emerald-200">
            <button
              onClick={() => setShowMoodModal(true)}
              className="text-emerald-600 hover:text-emerald-700 text-sm underline"
            >
              Update my daily mood check-in
            </button>
          </div>
        )}
      </section>

      {/* NEW: Mood Check-In Modal */}
      <MoodCheckInModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
        sessionId={moodSessionId}
      />
    </div>
  );
}
