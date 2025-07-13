// 1. UPDATED: src/components/MilitarySupport/AnonymousChatSelector.tsx - Dark Theme

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, MessageCircle, Loader2 } from 'lucide-react';
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#28a745', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ color: '#ccc' }}>Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{
          backgroundColor: '#222',
          borderBottom: '2px solid #28a745',
          padding: '1.5rem 0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            <Link
              href="/military-support"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#17a2b8',
                textDecoration: 'none',
                marginBottom: '1rem'
              }}
            >
              <ArrowLeft style={{ marginRight: '8px', width: '16px', height: '16px' }} />
              Back to Military Support
            </Link>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#28a745',
              marginBottom: '0.5rem'
            }}>
              Chat Rooms Unavailable
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{
            backgroundColor: '#dc2626',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={loadRooms}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#222',
        borderBottom: '2px solid #28a745',
        padding: '1.5rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <Link
            href="/military-support"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#17a2b8',
              textDecoration: 'none',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeft style={{ marginRight: '8px', width: '16px', height: '16px' }} />
            Back to Military Support
          </Link>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#28a745',
            marginBottom: '0.5rem'
          }}>
            Anonymous Military Chat Rooms
          </h1>
          <p style={{ color: '#ccc' }}>
            Connect with fellow service members in a safe, anonymous environment
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Privacy Notice */}
        <div style={{
          backgroundColor: '#1e3a8a',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Shield style={{
              width: '24px',
              height: '24px',
              color: '#3b82f6',
              marginRight: '12px',
              marginTop: '4px',
              flexShrink: 0
            }} />
            <div>
              <h3 style={{ color: '#93c5fd', marginBottom: '8px', fontWeight: '600' }}>
                Your Privacy & Safety
              </h3>
              <ul style={{ color: '#dbeafe', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <li>• You'll be assigned a random anonymous name</li>
                <li>• No registration or personal information required</li>
                <li>• Messages are automatically deleted after 24 hours</li>
                <li>• This is peer support, not professional counseling</li>
                <li>• Inappropriate content will be moderated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Rooms */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/military-support/chat/${room.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                backgroundColor: '#333',
                border: '2px solid #444',
                borderRadius: '8px',
                padding: '1.5rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#28a745';
                e.currentTarget.style.backgroundColor = '#404040';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#444';
                e.currentTarget.style.backgroundColor = '#333';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{room.icon}</div>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#28a745',
                        marginBottom: '4px'
                      }}>
                        {room.name}
                      </h3>
                      <p style={{ color: '#ccc', marginBottom: '8px' }}>{room.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#999' }}>
                        <Users style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        {room.memberCount}
                      </div>
                    </div>
                  </div>
                  <MessageCircle style={{ width: '24px', height: '24px', color: '#666' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Crisis Resources Reminder */}
        <div style={{
          backgroundColor: '#7f1d1d',
          border: '2px solid #dc2626',
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: '#fca5a5', marginBottom: '8px', fontWeight: '600' }}>
            In Crisis? Get Immediate Help
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            fontSize: '0.9rem'
          }}>
            <div>
              <strong style={{ color: '#fee2e2' }}>Veterans Crisis Line:</strong>
              <br />
              <span style={{ color: '#fca5a5' }}>988 (Press 1) • Text 838255</span>
            </div>
            <div>
              <strong style={{ color: '#fee2e2' }}>National Suicide Prevention:</strong>
              <br />
              <span style={{ color: '#fca5a5' }}>988 • Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

