# -*- coding: utf-8 -*-
"""
Builds a fully static copy of the site from the knowledge graph (database/resume.ttl).

Output (default: ../dist):
    index.html              - page rendered for the default profile, data embedded
    data/<slug>.json        - one JSON file per person in the graph (used by "Change Profile")
    static/...              - css, js and assets

The result can be hosted on any free static host (GitHub Pages, Netlify, Cloudflare Pages...).

Run:  python backend2/build_static.py [output_dir]
"""
import json
import os
import shutil
import sys

from app import app, getDictionary, slugify
from pyscript.grapher import graphData

DEFAULT_USER = 'Nwiwu Uzoma'
HERE = os.path.dirname(os.path.abspath(__file__))


def build(out_dir):
    if os.path.isdir(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(os.path.join(out_dir, 'data'))

    # 1. One JSON file per person in the graph
    names = graphData('').name_list
    for name in names:
        with open(os.path.join(out_dir, 'data', f'{slugify(name)}.json'), 'w', encoding='utf-8') as f:
            json.dump(getDictionary(name), f, ensure_ascii=False)

    # 2. Render index.html exactly as Flask serves it, then make asset URLs relative
    #    so the site also works under a sub-path (e.g. https://<user>.github.io/<repo>/)
    with app.test_client() as client:
        html = client.get('/').get_data(as_text=True)
    html = html.replace('"/static/', '"static/')
    with open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)

    # 3. Static files
    shutil.copytree(os.path.join(HERE, 'static'), os.path.join(out_dir, 'static'))

    # 4. Tell GitHub Pages not to run Jekyll over the output
    open(os.path.join(out_dir, '.nojekyll'), 'w').close()

    print(f'Built static site for {len(names)} profile(s) in {os.path.abspath(out_dir)}')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist'))
