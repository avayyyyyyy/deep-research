"use client";

import React from 'react'
import { useChatStore } from '@/lib/store'

const Footer = () => {
  const hasMessages = useChatStore((state) => state.hasMessages);

  if (hasMessages) {
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AI Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer
