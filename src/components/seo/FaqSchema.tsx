import React from 'react';

export interface FaqItem {
  question?: string;
  answer?: string;
  [key: string]: any;
}

interface FaqSchemaProps {
  faqs?: FaqItem[];
}

/**
 * Injects Google-compliant FAQPage JSON-LD structured data into the document <head>.
 * Follows schema.org/FAQPage specifications.
 */
export default function FaqSchema({ faqs }: FaqSchemaProps) {
  // Head injection is handled centrally in RootLayout's <head> via DynamicFaqHeadSchema
  return null;
}
