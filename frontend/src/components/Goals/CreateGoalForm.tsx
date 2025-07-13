'use client';

import React, { useState } from 'react';
import { sanitizeInput } from '@/utils/FormsUtils';
import styles from './CreateGoalForm.module.css';

export interface GoalData {
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
}

interface CreateGoalFormProps {
  onSubmit: (data: GoalData) => void;
  defaultValues?: Partial<GoalData>;
}

const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ onSubmit, defaultValues = {} }) => {
  const [formData, setFormData] = useState<GoalData>({
    title: defaultValues.title ?? '',
    description: defaultValues.description ?? '',
    dueDate: defaultValues.dueDate ?? '',
    category: defaultValues.category ?? '',
  });
  const [error, setError] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h2 className={styles.heading}>Create a Goal</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Enter goal title"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={styles.textarea}
          placeholder="Optional description"
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="dueDate" className={styles.label}>
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Fitness"
            className={styles.input}
          />
        </div>
      </div>

      <button type="submit" className={styles.button}>
        Create Goal
      </button>
    </form>
  );
};

export default CreateGoalForm;
