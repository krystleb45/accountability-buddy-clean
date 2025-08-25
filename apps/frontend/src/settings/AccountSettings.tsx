// src/settings/AccountSettings.tsx
import React, { useState } from "react"

import styles from "./AccountSettings.module.css"

const AccountSettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handlePasswordChange = (): void => {
    if (newPassword !== confirmPassword) {
      // alert('New password and confirmation do not match.');
      return
    }
    // alert('Password changed successfully!');
    // TODO: Hook up real API call here
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleAccountDeletion = (): void => {
    // if (
    //   window.confirm('Are you sure you want to delete your account? This action is irreversible.')
    // ) {
    //   alert('Account deleted successfully!');
    // TODO: Hook up real API call here
    // }
    setShowDeleteConfirm(false)
  }

  return (
    <div className={styles.container}>
      <h2>Account Settings</h2>

      {/* === Change Password === */}
      <div className={styles.section}>
        <h3>Change Password</h3>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            handlePasswordChange()
          }}
        >
          <label>
            Current Password:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm New Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className={`
              ${styles.button}
              ${styles.saveButton}
            `}
          >
            Change Password
          </button>
        </form>
      </div>

      {/* === Delete Account === */}
      <div className={styles.section}>
        <h3>Delete Account</h3>
        <p>Warning: Deleting your account is permanent and cannot be undone.</p>
        <button
          className={`
            ${styles.button}
            ${styles.deleteButton}
          `}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Account
        </button>

        {showDeleteConfirm && (
          <div className={styles.confirmationBox}>
            <p>Are you sure? This action is irreversible.</p>
            <button
              className={`
                ${styles.button}
                ${styles.confirmButton}
              `}
              onClick={handleAccountDeletion}
            >
              Yes, Delete My Account
            </button>
            <button
              className={`
                ${styles.button}
                ${styles.cancelButton}
              `}
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSettings
