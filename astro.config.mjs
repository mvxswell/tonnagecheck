import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://tonnagechecker.com';

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
        const noindex = [];
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
          if (/<meta name="robots" content="[^"]*noindex/.test(html)) noindex.push(`${SITE}${path}`);
          if (
            (path.startsWith('/states/') && path !== '/states/') ||
            path.startsWith('/systems/') ||
            path.startsWith('/tonnage/') ||
            path.startsWith('/brands/') ||
            path.startsWith('/guides/') ||
            path.startsWith('/compare/') ||
            path.startsWith('/parts/') ||
            path.startsWith('/calculator/')
          ) {
            if (title && title.length >= 60) errors.push(`${path}: title is ${title.length} chars (must be < 60): "${title}"`);
            if (desc && desc.length >= 160) errors.push(`${path}: description is ${desc.length} chars (must be < 160): "${desc}"`);
            if (!/\$[\d,]+(–| vs )\$[\d,]+/.test(title || '')) errors.push(`${path}: title does not include a dollar range or comparison: "${title}"`);
          }
          for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            try { JSON.parse(m[1]); } catch { errors.push(`${path}: JSON-LD does not parse`); }
          }
          if ((path.startsWith('/systems/') && path !== '/systems/') || path.startsWith('/parts/')) {
            if (!/hvacdirect\.com|alpinehomeair\.com/.test(html)) errors.push(`${path}: equipment/parts page without a retailer source link`);
          }
        }
        // Keep noindex pages (e.g. states with incomplete data) out of the sitemap, then confirm it.
        const sm = join(root, 'sitemap-0.xml');
        let kept = 0;
        if (existsSync(sm)) {
          const drop = new Set(noindex);
          const xml = readFileSync(sm, 'utf8').replace(/<url><loc>([^<]*)<\/loc><\/url>/g, (m, loc) => (drop.has(loc) ? '' : (kept++, m)));
          writeFileSync(sm, xml);
          for (const u of noindex) if (xml.includes(`<loc>${u}</loc>`)) errors.push(`noindex page still in sitemap: ${u}`);
        }
        console.log(`[tc] checked ${files.length} pages; sitemap URLs: ${kept}; noindex pages excluded: ${noindex.length}`);
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
