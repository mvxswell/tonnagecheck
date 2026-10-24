import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://tonnagecheck.com';

// After the build, fail on anything that would quietly hurt trust or SEO: duplicate titles/descriptions,
// a missing or non-self canonical, JSON-LD that does not parse, or a dollar figure on an equipment page
// that is not next to a source link.
function siteChecks() {
  return {
    name: 'tc-site-checks',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const files = [];
        (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f === 'index.html' && files.push(p); } })(root);
        const errors = [];
        const seenT = new Map();
        const seenD = new Map();
        for (const f of files) {
          const html = readFileSync(f, 'utf8');
          const path = '/' + relative(root, f).replace(/\\/g, '/').replace(/index\.html$/, '');
          if (path === '/404/') continue;
          const get = (re) => (html.match(re) || [])[1];
          const title = get(/<title>([^<]*)<\/title>/);
          const desc = get(/<meta name="description" content="([^"]*)"/);
          const canonical = get(/<link rel="canonical" href="([^"]*)"/);
          if (!title) errors.push(`${path}: no <title>`);
          else if (seenT.has(title)) errors.push(`duplicate title "${title}": ${seenT.get(title)} and ${path}`);
          else seenT.set(title, path);
          if (!desc) errors.push(`${path}: no meta description`);
          else if (seenD.has(desc)) errors.push(`duplicate description: ${seenD.get(desc)} and ${path}`);
          else seenD.set(desc, path);
          if (canonical !== `${SITE}${path}`) errors.push(`${path}: canonical ${canonical}`);
          for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            try { JSON.parse(m[1]); } catch { errors.push(`${path}: JSON-LD does not parse`); }
          }
          if (path.startsWith('/systems/') && path !== '/systems/' && !/hvacdirect\.com|alpinehomeair\.com/.test(html)) errors.push(`${path}: equipment page without a retailer source link`);
        }
        console.log(`[tc] checked ${files.length} pages`);
        if (errors.length) throw new Error(`[tc] ${errors.length} build check(s) failed:\n - ${errors.join('\n - ')}`);
        console.log('[tc] build checks passed (titles, descriptions, canonicals, JSON-LD, source links)');
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') }), siteChecks()],
  build: { inlineStylesheets: 'always' },
});
