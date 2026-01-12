/**
 * @chunk 7.04 - Screenshot + DOM Capture Service
 *
 * Supabase Edge Function that captures webpage screenshots AND extracts DOM element bounds.
 * Uses Puppeteer to navigate, screenshot, and extract visible elements with their styles.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXTRACTION_SCRIPT = `
(() => {
  const elements = [];
  const seen = new Set();

  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    if (rect.top > window.innerHeight || rect.left > window.innerWidth) return;

    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const bg = styles.backgroundColor;

    // Skip if no visible color
    if (bg === 'rgba(0, 0, 0, 0)' && color === 'rgb(0, 0, 0)') return;

    const key = \`\${rect.x},\${rect.y},\${rect.width},\${rect.height}\`;
    if (seen.has(key)) return;
    seen.add(key);

    elements.push({
      selector: getSelector(el),
      bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      styles: {
        color,
        backgroundColor: bg,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      },
      textContent: el.textContent?.slice(0, 100) || '',
    });
  });

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') return '.' + el.className.split(' ')[0];
    return el.tagName.toLowerCase();
  }

  return elements;
})()
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    );
  }

  try {
    const { url, viewport = { width: 1440, height: 900 } } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Validate URL
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const browserWSEndpoint = Deno.env.get('BROWSER_WS_ENDPOINT');
    if (!browserWSEndpoint) {
      return new Response(
        JSON.stringify({ error: 'Browser service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503
        }
      );
    }

    // Dynamic import of puppeteer-core for Deno
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts');

    const browser = await puppeteer.default.connect({
      browserWSEndpoint,
    });

    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Take screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });

    // Extract DOM elements
    const elements = await page.evaluate(EXTRACTION_SCRIPT);

    await browser.close();

    return new Response(
      JSON.stringify({ screenshot, viewport, elements }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Capture error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to capture page',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
