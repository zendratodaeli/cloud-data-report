"use client"

import Loader from '@/components/loader';
import React, { useState, useEffect } from 'react';

const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  return <>{loading ? <Loader /> : children}</>;
};

export default LoadingProvider;
