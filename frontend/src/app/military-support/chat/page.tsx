// src/app/military-support/chat/page.tsx

import { Metadata } from 'next';
import AnonymousChatSelector from '../../../components/MilitarySupport/AnonymousChatSelector';

export const metadata: Metadata = {
  title: 'Anonymous Military Chat Rooms | Military Support',
  description: 'Connect anonymously with fellow service members in peer support chat rooms.',
  openGraph: {
    title: 'Anonymous Military Chat Rooms | Military Support',
    description: 'Connect anonymously with fellow service members in peer support chat rooms.',
  },
};

export default function MilitaryChatPage() {
  return <AnonymousChatSelector />;
}
