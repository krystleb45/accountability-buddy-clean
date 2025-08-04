import React from "react"

import styles from "./DataExportSettings.module.css"

const DataExportSettings: React.FC = () => {
  const exportData = () => {
    // alert('Data export started');
    // TODO: call API and download file
  }
  const deleteData = () => {
    // if (window.confirm('This will permanently delete all your data. Continue?')) {
    //   alert('Data deleted');
    // TODO: call API
    // }
  }

  return (
    <div className={styles.container}>
      <h2>Data & Export</h2>
      <button
        type="button"
        onClick={exportData}
        className={styles.exportButton}
      >
        Download My Data
      </button>
      <button
        type="button"
        onClick={deleteData}
        className={styles.deleteButton}
      >
        Delete All My Data
      </button>
    </div>
  )
}

export default DataExportSettings
