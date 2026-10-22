"""Static production acceptance checks; generated pages are authoritative."""
from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import unittest
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist'


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.links = []
        self.assets = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        if tag == 'a' and 'href' in values:
            self.links.append(values['href'])
        if tag in ('img', 'script') and 'src' in values:
            self.assets.append(values['src'])
        if tag == 'link' and values.get('rel') in ('stylesheet', 'preload', 'icon'):
            self.assets.append(values['href'])


class PublicSiteAcceptance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(['node', 'scripts/build.mjs'], cwd=ROOT, check=True, capture_output=True)
        cls.source = (OUTPUT / 'index.html').read_text()
        cls.page = Page(cls.source)

    def test_production_is_honestly_empty(self):
        snapshot = json.loads((ROOT / 'content/published.json').read_text())
        self.assertEqual(snapshot['articles'], [])
        self.assertNotIn('No notes published yet.', self.source)
        self.assertNotIn('Synthetic renderer fixture', self.source)
        self.assertNotIn('datetime=', self.source)

    def test_reference_identity_and_theme_are_explicit(self):
        self.assertIn('HAVESOMECODE', self.source)
        for choice in ('Light', 'Dark', 'Auto'):
            self.assertIn('>' + choice + '</button>', self.source)
        css = (OUTPUT / 'assets/styles.css').read_text()
        self.assertIn('Geist Mono', css)
        self.assertIn('prefers-reduced-motion', css)
        self.assertNotIn('Newsreader', css)
        self.assertNotIn('Manrope', css)

    def test_approved_about_sentence_stays_without_a_metrics_dashboard(self):
        self.assertIn('At Club Med, I helped scale a public API platform from 10M to 25M requests/day in production so it could support more traffic.', self.source)
        for excluded in ('Days → minutes', '7 pages in 2 days', '30+ consumers', 'tested capacity'):
            self.assertNotIn(excluded, self.source)

    def test_required_public_destinations_are_preserved(self):
        for href in ('https://zacaria.github.io/float/', 'https://pathfinding-client.vercel.app/',
                     'https://havesomecode.github.io/kibana-mcp-server/', 'https://github.com/Zacaria/float',
                     'https://github.com/Zacaria/pathfinding-client', 'https://github.com/Havesomecode/kibana-mcp-server',
                     'https://www.youtube.com/watch?v=eSo3e3ugn5g', 'https://cv.havesomecode.io/',
                     'https://www.linkedin.com/in/zacariachtatar/', 'mailto:havesomecode@gmail.com',
                     '/linkedin-editorial-scout-privacy'):
            self.assertIn(href, self.page.links)

    def test_all_local_links_assets_and_anchors_resolve(self):
        self.assertEqual(len(self.page.ids), len(set(self.page.ids)))
        for href in self.page.links:
            url = urlsplit(href)
            if url.netloc or url.scheme:
                continue
            if url.path in ('', '/') and url.fragment:
                self.assertIn(url.fragment, self.page.ids, href)
            elif url.path:
                local = OUTPUT / unquote(url.path).lstrip('/')
                self.assertTrue(local.exists() or local.with_suffix('.html').exists(), href)
        for href in self.page.assets:
            self.assertTrue((OUTPUT / href.lstrip('/')).is_file(), href)

    def test_legacy_about_redirect_privacy_and_404_remain(self):
        about = (OUTPUT / 'about.html').read_text()
        self.assertIn('url=/#about', about)
        config = json.loads((ROOT / 'vercel.json').read_text())
        self.assertIn({'source': '/about', 'destination': '/#about', 'permanent': True}, config['redirects'])
        self.assertTrue(config['cleanUrls'])
        privacy = (OUTPUT / 'linkedin-editorial-scout-privacy.html').read_bytes()
        self.assertEqual(privacy, (ROOT / 'client/linkedin-editorial-scout-privacy.html').read_bytes())
        self.assertIn('noindex', (OUTPUT / '404.html').read_text())

    def test_no_private_projection_or_fixture_is_packaged(self):
        paths = [str(p.relative_to(OUTPUT)) for p in OUTPUT.rglob('*') if p.is_file()]
        for value in paths:
            self.assertNotIn('published.json', value)
            self.assertNotIn('fixture', value)
            self.assertNotIn('preview', value)
            self.assertNotIn('.env', value)
        for private in ('notionPageId', 'sourceVersion', 'Evidence and context', 'NOTION_TOKEN', 'api/admin', 'Draft/Blog'):
            self.assertNotIn(private, self.source)
        js = (OUTPUT / 'assets/site.js').read_text()
        self.assertNotIn('fetch(', js)

    def test_security_headers_and_verification_only_workflow_remain(self):
        config = json.loads((ROOT / 'vercel.json').read_text())
        headers = {h['key']: h['value'] for group in config['headers'] for h in group['headers']}
        self.assertEqual(headers['X-Frame-Options'], 'DENY')
        self.assertEqual(headers['X-Content-Type-Options'], 'nosniff')
        self.assertIn('includeSubDomains', headers['Strict-Transport-Security'])
        workflow = (ROOT / '.github/workflows/deploy-prod.yml').read_text()
        for unsafe in ('AWS_ACCESS_KEY', 'aws s3', 'deploy --prod'):
            self.assertNotIn(unsafe, workflow)

    def test_font_is_local_and_licensed(self):
        self.assertEqual((OUTPUT / 'assets/fonts/geist-mono.woff2').read_bytes()[:4], b'wOF2')
        for name in ('geist-regular.woff2', 'geist-bold.woff2'):
            self.assertEqual((OUTPUT / 'assets/fonts' / name).read_bytes()[:4], b'wOF2')
        for name in ('instrument-serif-regular.woff2', 'instrument-serif-italic.woff2'):
            self.assertEqual((OUTPUT / 'assets/fonts' / name).read_bytes()[:4], b'wOF2')
        self.assertIn('SIL OPEN FONT LICENSE', (ROOT / 'licenses/instrument-serif-OFL.txt').read_text())
        self.assertIn('SIL OPEN FONT LICENSE', (ROOT / 'licenses/geist-mono-OFL.txt').read_text())
        self.assertEqual((OUTPUT / 'assets/fonts/licenses/geist-mono-OFL.txt').read_bytes(), (ROOT / 'licenses/geist-mono-OFL.txt').read_bytes())


if __name__ == '__main__':
    unittest.main()
