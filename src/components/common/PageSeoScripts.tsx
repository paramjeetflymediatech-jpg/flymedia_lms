import React from 'react';
import { getSeoSetting, normalizePath } from '../../lib/seo';
import SeoScriptRenderer from './SeoScriptRenderer';

interface PageSeoScriptsProps {
  path: string;
}

/**
 * Server component that dynamically fetches and renders page-specific
 * headerScript and footerScript configured by the SEO team in the Admin Panel.
 */
export default async function PageSeoScripts({ path }: PageSeoScriptsProps) {
  try {
    const seo = await getSeoSetting(path);
    if (!seo) return null;

    const normalized = normalizePath(seo.pagePath);
    // GLOBAL scripts are already rendered once in RootLayout
    if (normalized === 'GLOBAL') {
      return null;
    }

    const { headerScript, footerScript } = seo;
    if (!headerScript && !footerScript) return null;

    return (
      <>
        {headerScript && (
          <SeoScriptRenderer code={headerScript} location="head" />
        )}
        {footerScript && (
          <SeoScriptRenderer code={footerScript} location="body" />
        )}
      </>
    );
  } catch (error) {
    console.error(`Failed to render page SEO scripts for path "${path}":`, error);
    return null;
  }
}
