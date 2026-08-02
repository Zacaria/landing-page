from __future__ import annotations

import json
import re
import struct
import unittest
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
CLIENT = ROOT / 'client'
HTML_PATH = CLIENT / 'index.html'
CSS_PATH = CLIENT / 'assets' / 'styles.css'
JS_PATH = CLIENT / 'assets' / 'site.js'
VERCEL_CONFIG = ROOT / 'vercel.json'
VERCEL_IGNORE = ROOT / '.vercelignore'
DEPLOY_WORKFLOW = ROOT / '.github' / 'workflows' / 'deploy-prod.yml'
MAKEFILE = ROOT / 'Makefile'


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ''
        self._in_title = False
        self.headings: list[tuple[str, str]] = []
        self._heading_tag: Optional[str] = None
        self._heading_parts: list[str] = []
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, Any]] = []
        self._anchor: Optional[dict[str, Any]] = None
        self.ids: set[str] = set()
        self.images: list[dict[str, str]] = []
        self.scripts: list[dict[str, str]] = []
        self.json_ld: list[str] = []
        self._json_ld_parts: Optional[list[str]] = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]) -> None:
        data = {key: value or '' for key, value in attrs}
        if data.get('id'):
            self.ids.add(data['id'])
        if tag == 'title':
            self._in_title = True
        elif tag in {'h1', 'h2', 'h3'}:
            self._heading_tag = tag
            self._heading_parts = []
        elif tag == 'meta':
            self.meta.append(data)
        elif tag == 'a':
            self._anchor = {'attrs': data, 'text_parts': []}
        elif tag == 'img':
            self.images.append(data)
        elif tag == 'script':
            self.scripts.append(data)
            if data.get('type') == 'application/ld+json':
                self._json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == 'title':
            self._in_title = False
        elif tag == self._heading_tag:
            text = ' '.join(''.join(self._heading_parts).split())
            self.headings.append((tag, text))
            self._heading_tag = None
        elif tag == 'a' and self._anchor is not None:
            self._anchor['text'] = ' '.join(''.join(self._anchor['text_parts']).split())
            self.links.append(self._anchor)
            self._anchor = None
        elif tag == 'script' and self._json_ld_parts is not None:
            self.json_ld.append(''.join(self._json_ld_parts))
            self._json_ld_parts = None

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._heading_tag:
            self._heading_parts.append(data)
        if self._anchor is not None:
            self._anchor['text_parts'].append(data)
        if self._json_ld_parts is not None:
            self._json_ld_parts.append(data)


def parse_site() -> tuple[str, SiteParser]:
    source = HTML_PATH.read_text(encoding='utf-8')
    parser = SiteParser()
    parser.feed(source)
    parser.close()
    return source, parser


def meta_content(parser: SiteParser, key: str, value: str) -> Optional[str]:
    for item in parser.meta:
        if item.get(key) == value:
            return item.get('content')
    return None


class LandingPageAcceptanceTests(unittest.TestCase):
    def test_brand_positioning_is_visible_in_title_and_hero(self) -> None:
        _, page = parse_site()
        h1 = [text for tag, text in page.headings if tag == 'h1']

        self.assertEqual(page.title.strip(), 'Zacaria Chtatar — Software, side projects & curiosity')
        self.assertEqual(h1, ['I like finding out how things really work.'])

    def test_metadata_describes_technical_leadership(self) -> None:
        _, page = parse_site()

        description = meta_content(page, 'name', 'description')
        og_title = meta_content(page, 'property', 'og:title')
        twitter_card = meta_content(page, 'name', 'twitter:card')

        self.assertIsNotNone(description)
        self.assertIn('corner of the web', description or '')
        self.assertEqual(og_title, 'HaveSomeCode — Zacaria’s corner of the web')
        self.assertEqual(twitter_card, 'summary_large_image')

    def test_fonts_are_self_hosted_without_a_third_party_render_chain(self) -> None:
        source, _ = parse_site()
        error_page = (CLIENT / '404.html').read_text(encoding='utf-8')
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertNotIn('fonts.googleapis.com', source)
        self.assertNotIn('fonts.gstatic.com', source)
        self.assertNotIn('fonts.googleapis.com', error_page)
        self.assertNotIn('fonts.gstatic.com', error_page)
        self.assertGreaterEqual(css.count('@font-face'), 4)
        for filename in ('newsreader.woff2', 'manrope.woff2', 'dm-mono-regular.woff2', 'dm-mono-medium.woff2'):
            self.assertTrue((CLIENT / 'assets' / 'fonts' / filename).is_file(), filename)

    def test_social_metadata_uses_a_branded_large_image(self) -> None:
        _, page = parse_site()
        social_image = meta_content(page, 'property', 'og:image')
        social_source = (ROOT / 'sketches' / 'social-card-source.html').read_text(encoding='utf-8')

        self.assertEqual(social_image, 'https://www.havesomecode.io/assets/social-card.png')
        image_path = CLIENT / 'assets' / 'social-card.png'
        self.assertTrue(image_path.exists())
        with image_path.open('rb') as image:
            image.seek(16)
            dimensions = struct.unpack('>II', image.read(8))
        self.assertEqual(dimensions, (1200, 630))
        self.assertIn('Software, side projects &amp; questions worth following.', social_source)
        for resume_proof in ('10M', '25M', '7 pages', '30+'):
            self.assertNotIn(resume_proof, social_source)

    def test_world_sections_are_present_and_resume_metrics_stay_out(self) -> None:
        source, page = parse_site()

        self.assertTrue({'top', 'projects', 'thinking', 'speaking', 'about', 'contact'} <= page.ids)
        for resume_proof in ('10M → 25M', 'Days → minutes', '7 pages in 2 days', '30+ consumers'):
            self.assertNotIn(resume_proof, source)
        for doorway in ('Make', 'Learn', 'Share', 'Lead'):
            self.assertIn(f'<strong>{doorway}</strong>', source)

    def test_navigation_and_social_links_have_visible_names(self) -> None:
        _, page = parse_site()
        expected_hosts = {
            'cv.havesomecode.io',
            'www.linkedin.com',
            'github.com',
            'www.youtube.com',
        }
        seen_hosts: set[str] = set()

        for link in page.links:
            attrs = link['attrs']
            text = str(link['text'])
            href = str(attrs.get('href', ''))
            host = urlparse(href).hostname
            if host in expected_hosts:
                seen_hosts.add(host)
                self.assertTrue(text or attrs.get('aria-label'), f'Link {href} has no accessible name')

        self.assertEqual(seen_hosts, expected_hosts)

    def test_cv_is_prominently_linked_from_the_header_and_footer(self) -> None:
        source, page = parse_site()
        cv_url = 'https://cv.havesomecode.io/'
        cv_links = [link for link in page.links if link['attrs'].get('href') == cv_url]

        self.assertEqual([link['text'] for link in cv_links], ['Read my CV ↗', 'CV'])
        self.assertIn('button', str(cv_links[0]['attrs'].get('class', '')))
        self.assertLess(source.index('Read my CV'), source.index('</header>'))

    def test_portrait_has_responsive_sources_and_descriptive_alt_text(self) -> None:
        _, page = parse_site()
        portrait = next(image for image in page.images if 'portrait' in image.get('src', ''))

        self.assertIn('Zacaria Chtatar', portrait.get('alt', ''))
        self.assertIn('portrait-w_200.jpg', portrait.get('srcset', ''))
        self.assertIn('portrait-w_600.jpg', portrait.get('srcset', ''))
        self.assertEqual(portrait.get('loading'), 'eager')
        self.assertEqual(portrait.get('fetchpriority'), 'high')

    def test_json_ld_identifies_zacaria_and_public_profiles(self) -> None:
        _, page = parse_site()
        self.assertEqual(len(page.json_ld), 1)
        data = json.loads(page.json_ld[0])

        self.assertEqual(data['@type'], 'Person')
        self.assertEqual(data['name'], 'Zacaria Chtatar')
        self.assertIn('https://github.com/Zacaria', data['sameAs'])
        self.assertIn('https://www.linkedin.com/in/zacariachtatar/', data['sameAs'])

    def test_mobile_navigation_uses_external_script_and_accessible_state(self) -> None:
        source, page = parse_site()
        scripts = [script.get('src') for script in page.scripts]

        self.assertIn('assets/site.js', scripts)
        self.assertRegex(source, r'<button[^>]+class="menu"[^>]+aria-expanded="false"')
        self.assertTrue(JS_PATH.exists())
        script = JS_PATH.read_text(encoding='utf-8')
        self.assertIn("setAttribute('aria-expanded'", script)
        self.assertIn("textContent = open ? 'Close' : 'Menu'", script)
        self.assertIn('currentYear', script)

    def test_mobile_navigation_keeps_links_available_without_javascript(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')
        mobile = css.split('@media (max-width: 800px)', 1)[1].split('@media (max-width: 480px)', 1)[0]

        self.assertRegex(mobile, r'\.nav-links\s*\{[^}]*display:\s*flex')
        self.assertRegex(mobile, r'\.js \.menu\s*\{[^}]*display:\s*block')
        self.assertRegex(mobile, r'\.js \.nav-links\s*\{[^}]*display:\s*none')
        self.assertRegex(
            mobile,
            r'\.case-study,\s*\.case-study:nth-of-type\(even\)\s*\{[^}]*grid-template-columns:\s*1fr',
        )
        self.assertRegex(css, r'\.diagram-path path\s*\{[^}]*stroke-dashoffset:\s*0')
        self.assertRegex(
            css,
            r'\.js\.motion-ready \.diagram-path path\s*\{[^}]*stroke-dashoffset:\s*600',
        )

    def test_contact_focus_is_visible_and_visual_system_uses_no_gradients(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertRegex(
            css,
            r'\.contact-button:focus-visible\s*\{[^}]*outline-color:\s*white',
        )
        self.assertNotIn('gradient(', css)

    def test_every_css_custom_property_reference_has_a_definition(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')
        definitions = set(re.findall(r'(--[a-z0-9-]+)\s*:', css))
        references = set(re.findall(r'var\((--[a-z0-9-]+)', css))

        self.assertEqual(references - definitions, set())

    def test_contact_invitation_is_direct_instead_of_rhetorical(self) -> None:
        source, page = parse_site()
        headings = [text for _, text in page.headings]

        self.assertIn('I’m looking for Tech Lead challenges.', headings)
        self.assertGreaterEqual(source.count('href="mailto:havesomecode@gmail.com"'), 2)
        self.assertIn('havesomecode@gmail.com', source)

    def test_mid_page_conversation_prompt_precedes_projects_and_emails_directly(self) -> None:
        source, page = parse_site()
        css = CSS_PATH.read_text(encoding='utf-8')
        mobile_css = css[
            css.index('@media (max-width: 800px)'):css.index('@media (max-width: 480px)')
        ]
        headings = [text for _, text in page.headings]

        self.assertIn('conversation-title', page.ids)
        self.assertIn('Building something that needs technical depth and a wider view?', headings)
        self.assertLess(source.index('class="conversation-prompt"'), source.index('id="projects"'))
        self.assertGreater(source.index('class="conversation-prompt"'), source.index('class="shell outcomes"'))
        self.assertIn(
            'class="conversation-prompt__link" href="mailto:havesomecode@gmail.com"',
            source,
        )
        self.assertGreaterEqual(source.count('href="mailto:havesomecode@gmail.com"'), 3)
        self.assertRegex(css, r'\.conversation-prompt\s*\{[^}]*display:\s*grid')
        self.assertRegex(css, r'\.conversation-prompt__link:focus-visible\s*\{[^}]*outline-color:\s*var\(--ink\)')
        self.assertRegex(css, r':focus-visible\s*\{[^}]*outline:\s*3px\s+solid[^}]*outline-offset:\s*4px')
        self.assertRegex(mobile_css, r'\.conversation-prompt\s*\{[^}]*grid-template-columns:\s*1fr')
        self.assertRegex(mobile_css, r'\.conversation-prompt__link\s*\{[^}]*grid-column:\s*auto')
        self.assertIn('<section class="conversation-prompt" aria-labelledby="conversation-title" data-reveal>', source)
        self.assertNotRegex(css, r'(?m)^\s*\[data-reveal\]\s*\{[^}]*opacity:\s*0')

    def test_reduced_motion_never_transitions_the_keyboard_focus_outline(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')
        reduced_motion = css[css.index('@media (prefers-reduced-motion: reduce)'):]

        self.assertIn('transition: none !important', reduced_motion)
        self.assertIn('animation: none !important', reduced_motion)
        self.assertNotIn('transition-duration:', reduced_motion)

    def test_award_concept_uses_a_decision_map_and_real_showable_projects(self) -> None:
        source, _ = parse_site()

        self.assertIn('class="decision-map"', source)
        for node in ('context', 'systems', 'people', 'operations'):
            self.assertIn(f'data-system-node="{node}"', source)
        self.assertEqual(source.count('<article class="project-entry"'), 3)
        for project in ('float', 'pathfinding', 'worktrees'):
            self.assertIn(f'data-project="{project}"', source)

    def test_showable_projects_have_local_images_and_live_source_links(self) -> None:
        source, page = parse_site()

        self.assertNotIn('class="case-diagram', source)
        for project in ('float', 'pathfinding', 'worktrees'):
            asset = CLIENT / 'assets' / 'projects' / f'{project}.webp'
            self.assertTrue(asset.is_file(), asset)
            image = next(item for item in page.images if item.get('src') == f'assets/projects/{project}.webp')
            self.assertTrue(image.get('alt'))
        for href in (
            'https://zacaria.github.io/float/',
            'https://pathfinding-client.vercel.app/',
            'https://zacaria.github.io/havesome-worktrees/',
            'https://github.com/Zacaria/float',
            'https://github.com/Zacaria/pathfinding-client',
            'https://github.com/Zacaria/havesome-worktrees',
        ):
            self.assertIn(f'href="{href}"', source)
        for accessible_name in (
            'Open project: Float',
            'Open experiment: Pathfinding',
            'Open the deck: Worktrees with AI agents',
        ):
            self.assertIn(f'aria-label="{accessible_name}"', source)

    def test_mobile_decision_map_keeps_all_system_labels_visible(self) -> None:
        source, _ = parse_site()
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertIn('data-system-node="operations" transform="translate(354 536)"', source)
        self.assertRegex(
            css,
            r"\[data-system-node='operations'\][^{]*\{[^}]*transform:\s*translate\(344px,\s*536px\)",
        )

    def test_alternating_projects_preserve_media_scale(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertRegex(
            css,
            r'\.project-entry:nth-of-type\(even\)\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.1fr\)',
        )

    def test_thinking_matrix_is_native_and_progressively_enhanced(self) -> None:
        source, _ = parse_site()
        script = JS_PATH.read_text(encoding='utf-8')
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertIn('data-principles', source)
        self.assertEqual(source.count('<details class="principle" open'), 4)
        self.assertEqual(source.count('<summary>'), 4)
        self.assertIn('aria-live="polite"', source)
        self.assertIn('data-principle-statement', source)
        self.assertIn("addEventListener('toggle'", script)
        self.assertRegex(css, r'\.principle\s*\{[^}]*flex:\s*1')
        self.assertRegex(css, r'\.principles-layout\s*\{[^}]*gap:\s*0')

    def test_progressive_motion_never_hides_content_without_javascript(self) -> None:
        source, _ = parse_site()
        css = CSS_PATH.read_text(encoding='utf-8')
        script = JS_PATH.read_text(encoding='utf-8')

        self.assertIn("document.documentElement.classList.add('js')", source)
        self.assertIn('data-reveal', source)
        self.assertRegex(css, r'\.js\.motion-ready\s+\[data-reveal\][^{]*\{[^}]*opacity:\s*0')
        self.assertRegex(css, r'\.js\.motion-ready\s+\[data-reveal\]\.is-visible[^{]*\{[^}]*opacity:\s*1')
        self.assertIn('IntersectionObserver', script)
        self.assertIn("matchMedia('(prefers-reduced-motion: reduce)')", script)
        self.assertIn("classList.add('motion-ready')", script)

    def test_lcp_headline_is_never_delayed_by_motion(self) -> None:
        source, _ = parse_site()
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertIn('<h1>I like finding out how things really work.</h1>', source)
        self.assertRegex(
            css,
            r'\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.3fr\)\s+minmax\(390px,\s*0\.7fr\)',
        )

    def test_primary_navigation_tracks_the_current_section(self) -> None:
        source, _ = parse_site()
        script = JS_PATH.read_text(encoding='utf-8')
        css = CSS_PATH.read_text(encoding='utf-8')

        self.assertEqual(source.count('data-section-link'), 4)
        self.assertIn("setAttribute('aria-current', 'location')", script)
        self.assertIn("[aria-current='location']", css)

    def test_css_encodes_identity_focus_and_responsive_behavior(self) -> None:
        css = CSS_PATH.read_text(encoding='utf-8')

        for token in ('--paper:', '--ink:', '--green:', '--orange:'):
            self.assertIn(token, css)
        self.assertNotIn('#fff1ec', css)
        self.assertNotIn('#ffe5dc', css)
        self.assertIn(':focus-visible', css)
        self.assertIn('@media (max-width: 800px)', css)
        self.assertIn('@media (prefers-reduced-motion: reduce)', css)

    def test_local_assets_referenced_by_the_page_exist(self) -> None:
        _, page = parse_site()
        referenced: set[str] = set()

        for image in page.images:
            referenced.add(image.get('src', ''))
            for candidate in image.get('srcset', '').split(','):
                path = candidate.strip().split(' ')[0]
                if path:
                    referenced.add(path)
        for script in page.scripts:
            if script.get('src'):
                referenced.add(script['src'])

        for path in referenced:
            if not path or urlparse(path).scheme:
                continue
            self.assertTrue((CLIENT / path).exists(), f'Missing local asset: {path}')

    def test_legacy_pages_are_useful_instead_of_empty(self) -> None:
        not_found = (CLIENT / '404.html').read_text(encoding='utf-8')
        about = (CLIENT / 'about.html').read_text(encoding='utf-8')

        self.assertIn('Page not found', not_found)
        self.assertIn('href="/"', not_found)
        self.assertIn('href="/assets/styles.css"', not_found)
        self.assertIn('href="/assets/favicon.ico"', not_found)
        self.assertIn('url=/#about', about)
        self.assertIn('Continue to the about section', about)

    def test_sitemap_records_the_current_rework(self) -> None:
        sitemap = (CLIENT / 'sitemap.xml').read_text(encoding='utf-8')

        self.assertIn('<loc>https://www.havesomecode.io/</loc>', sitemap)
        self.assertIn('<lastmod>2026-08-01</lastmod>', sitemap)

    def test_vercel_release_contract_is_explicit(self) -> None:
        self.assertTrue(VERCEL_CONFIG.is_file(), 'vercel.json must define the production release')
        self.assertTrue(VERCEL_IGNORE.is_file(), '.vercelignore must keep review artifacts out of uploads')

        config = json.loads(VERCEL_CONFIG.read_text(encoding='utf-8'))
        self.assertEqual(config['buildCommand'], 'make build')
        self.assertEqual(config['outputDirectory'], 'dist')
        self.assertTrue(config['cleanUrls'])

        redirects = {(item['source'], item['destination'], item['permanent']) for item in config['redirects']}
        self.assertIn(('/about', '/#about', True), redirects)

        catch_all = next(item for item in config['headers'] if item['source'] == '/(.*)')
        headers = {item['key']: item['value'] for item in catch_all['headers']}
        self.assertEqual(headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload')
        self.assertEqual(headers['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(headers['X-Frame-Options'], 'DENY')
        self.assertEqual(headers['Referrer-Policy'], 'same-origin')
        self.assertEqual(headers['Permissions-Policy'], 'camera=(), microphone=(), geolocation=()')

        ignored = set(VERCEL_IGNORE.read_text(encoding='utf-8').splitlines())
        self.assertTrue(
            {'submission', 'sketches', 'tests', 'licenses', '.history', 'gatsby-starter-minimal-blog'} <= ignored
        )

    def test_delivery_path_uses_vercel_without_legacy_aws_credentials(self) -> None:
        workflow = DEPLOY_WORKFLOW.read_text(encoding='utf-8')
        makefile = MAKEFILE.read_text(encoding='utf-8')
        delivery = workflow + makefile

        self.assertNotIn('AWS_ACCESS_KEY', delivery)
        self.assertNotIn('aws s3', delivery)
        self.assertIn('permissions:\n  contents: read', workflow)
        self.assertIn('deploy-prod: build', makefile)
        self.assertIn('vercel@latest deploy --prod --yes', makefile)


if __name__ == '__main__':
    unittest.main()
