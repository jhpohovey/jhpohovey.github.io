import os
from datetime import datetime

BASE_URL = "https://jhpohovey.github.io/"
lastmod = datetime.now().strftime("%Y-%m-%d")

urls = [
    BASE_URL,
]

sitemap_content = f'<?xml version="1.0" encoding="UTF-8"?>\n'
sitemap_content += f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

for url in urls:
    sitemap_content += f'  <url>\n'
    sitemap_content += f'    <loc>{url}</loc>\n'
    sitemap_content += f'    <lastmod>{lastmod}</lastmod>\n' # globally across all pages should be fine
    # part of the spec, but google ignores in crawl https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
    sitemap_content += f'    <changefreq>monthly</changefreq>\n' 
    sitemap_content += f'    <priority>1.0</priority>\n'
    sitemap_content += f'  </url>'

sitemap_content += f'</urlset>\n'

with open("sitemap.xml", "w") as f:
    f.write(sitemap_content)
