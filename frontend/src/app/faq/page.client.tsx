// src/app/faq/page.client.tsx
'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import Card, { CardContent } from '@/components/cards/Card';
import Input from '@/components/UtilityComponents/Input';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQItem } from '@/types/faq';
import { fetchFaqs } from '@/api/faq/faqApi';

export default function FaqClient(): JSX.Element {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFaqs();
        setFaqs(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return <p className="text-center p-4">Loading FAQs…</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 p-4">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-center text-4xl font-extrabold text-black">
        Frequently Asked Questions
      </h1>
      <div className="mx-auto mb-8 max-w-2xl">
        <Input
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="bg-white"
        />
      </div>
      <div className="mx-auto max-w-3xl space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <Card
              key={index}
              className="cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <CardContent>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleFaq(index);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-kelly-green">
                      {faq.question}
                    </h2>
                    <motion.span
                      animate={{ rotate: activeIndex === index ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xl text-gray-500"
                    >
                      +
                    </motion.span>
                  </div>
                  <AnimatePresence initial={false}>
                    {activeIndex === index && (
                      <motion.p
                        className="mt-3 text-gray-700"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500">No FAQs match your search.</p>
        )}
      </div>
    </div>
  );
}
