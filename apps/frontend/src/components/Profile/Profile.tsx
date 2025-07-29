// src/components/Profile/Profile.tsx
'use client';

import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
// Removed unused Link import
import styles from './Profile.module.css';

import ProfileService, { type ProfileData } from '@/services/profileService';
import FavoriteBadges from '../BadgeSystem/FavoriteBadges';

interface ProfileProps {
  initialProfile: ProfileData;
}

const Profile: React.FC<ProfileProps> = ({ initialProfile }) => {
  const [profile, setProfile]         = useState<ProfileData>(initialProfile);
  const [editingBio, setEditingBio]   = useState(false);
  const [draftBio, setDraftBio]       = useState(initialProfile.bio);
  const [newInterest, setNewInterest] = useState('');

  const handleBioSave = async () => {
    const updated = await ProfileService.updateBio(draftBio);
    if (updated) {
      setProfile(updated);
      setEditingBio(false);
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    const updated = await ProfileService.updateInterests([
      ...(profile.interests ?? []),
      newInterest.trim(),
    ]);
    if (updated) {
      setProfile(updated);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = async (i: string) => {
    const updated = await ProfileService.updateInterests(
      (profile.interests ?? []).filter(x => x !== i)
    );
    if (updated) setProfile(updated);
  };

  const onProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const updated = await ProfileService.updateProfileImage(e.target.files[0]);
    if (updated) setProfile(updated);
  };

  const onCoverImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const updated = await ProfileService.updateCoverImage(e.target.files[0]);
    if (updated) setProfile(updated);
  };

  return (
    <motion.div
      className={styles.profileContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >


      {/* Cover */}
      <div className={styles.coverContainer}>
        <img
          src={profile.coverImage || '/default-cover.png'}
          alt="Cover"
          className={styles.coverImage}
        />
        <label className={styles.coverUpload}>
          Change Cover
          <input
            type="file"
            accept="image/*"
            onChange={onCoverImageChange}
            className={styles.hiddenInput}
          />
        </label>
      </div>

      {/* Avatar */}
      <div className={styles.profilePictureContainer}>
        <img
          src={profile.profileImage || '/default-avatar.png'}
          alt={profile.name}
          className={styles.profilePicture}
        />
        <label className={styles.profileUpload}>
          Change Avatar
          <input
            type="file"
            accept="image/*"
            onChange={onProfileImageChange}
            className={styles.hiddenInput}
          />
        </label>
      </div>

      {/* Name & Email */}
      <div className={styles.profileHeader}>
        <h1>{profile.name}</h1>
        <p>{profile.email}</p>
      </div>

      {/* Bio */}
      <section className={styles.bioSection}>
        <h2 className={styles.sectionTitle}>Bio</h2>
        {editingBio ? (
          <>
            <textarea
              className={styles.bioInput}
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-center mt-2">
              <button
                className={styles.saveButton}
                onClick={handleBioSave}
              >
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setDraftBio(profile.bio);
                  setEditingBio(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.bioText}>
              {profile.bio || 'No bio yet.'}
            </p>
            <button
              className={styles.editButton}
              onClick={() => setEditingBio(true)}
            >
              {profile.bio ? 'Edit Bio' : 'Add Bio'}
            </button>
          </>
        )}
      </section>

      {/* Interests */}
      <section className={styles.interestsSection}>
        <h2 className={styles.sectionTitle}>Interests</h2>
        <div className={styles.interestTags}>
          {(profile.interests ?? []).map(i => (
            <span key={i} className={styles.interestTag}>
              {i}
              <button
                className={styles.removeTag}
                onClick={() => handleRemoveInterest(i)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <input
            type="text"
            className={styles.inputField}
            placeholder="Add interest…"
            value={newInterest}
            onChange={e => setNewInterest(e.target.value)}
          />
          <button
            className={styles.addButton}
            onClick={handleAddInterest}
          >
            Add
          </button>
        </div>
      </section>

      {/* Achievements & Badges */}
      <section className={styles.pinnedGoalsSection}>
        <h2 className={styles.sectionTitle}>
          Achievements & Badges
        </h2>
        <FavoriteBadges />
      </section>
    </motion.div>
  );
};

export default Profile;
