import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('self-contained offline release',()=>{
  const html=readFileSync('dist/Liars-Deck.html','utf8');
  it('bundles local code and style rather than runtime modules or downloads',()=>{
    expect(html).not.toMatch(/<script[^>]+src\s*=/i);
    expect(html).not.toMatch(/<(?:img|link|audio|video)[^>]+(?:src|href)\s*=\s*["']https?:/i);
    expect(html).not.toMatch(/@import\b/);
    expect(html).not.toMatch(/url\(\s*["']?https?:/i);
    expect(html).not.toContain('/* INLINE_JS */');expect(html).not.toContain('/* INLINE_CSS */');
    expect(html).toContain('getRandomValues');expect(html).toContain('createOscillator');
  });
  it('preserves GSAP license notices and ships identical static-host entry',()=>{
    expect(html).toContain('@license Copyright 2008-2026, GreenSock.');
    expect(readFileSync('dist/index.html','utf8')).toBe(html);
    expect(readFileSync('dist/PLAY.cmd','utf8')).toContain('%~dp0Liars-Deck.html');
  });
});
