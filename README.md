# IRIS Homepage

Source of **https://iris-workspace.com** — the site that introduces IRIS and links the installer download.

- Static HTML · CSS · JS, no framework, no build step. Everything under `site/` is deployed as-is (Vercel, `vercel.json`).
- Visual system is IRIS-Face's: `site/style.css` tokens, `site/stars.js` is the web edition of the Face star engine (sphere / iris, no Electron metrics).
- The download button reads the latest release of [`Feynman520/d09-p03-iris-installer`](https://github.com/Feynman520/d09-p03-iris-installer) through the GitHub API; the repo and the fallback values live in `site/site.js` `CONFIG`. The zip is never stored here.
- Korean is the source text; English strings live in `site/site.js` `I18N.en` (`data-i18n` keys). Long blocks use `.lang-ko` / `.lang-en`.
- Pages: `/` · `/install` · `/privacy` · `/download` (redirects to `/#download`).

Run locally:

```
python -m http.server 8765 --bind 127.0.0.1 -d site
```

Fonts: Pretendard Variable and a subset of Nanum Pen Script, both SIL OFL (`site/fonts/OFL-*.txt`).

MIT · Sejun Ham
