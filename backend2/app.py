# -*- coding: utf-8 -*-
__author__ = 'Nwiwu Uzoma'

from flask import Flask, render_template, jsonify, request
from pyscript.grapher import graphData
import hashlib
import json
import os
import re

app = Flask(__name__)


@app.context_processor
def inject_asset_version():
    """Short hash of the static css/js files, appended to their URLs so browsers
    (and GitHub Pages' cache) load the new files as soon as they change."""
    digest = hashlib.md5()
    for name in ('style.css', 'script.js', 'jsHTMLs.js'):
        with open(os.path.join(app.static_folder, name), 'rb') as f:
            digest.update(f.read())
    return {'asset_version': digest.hexdigest()[:10]}

# --- Flask Route ---
@app.route('/', methods=['GET', 'POST'])
def index():
    """
        Calls all the query results and organize them in as nested dictionary in json format

        Args:
            all the query results

        Returns:
            a json readable nested dictionary.
        """
    
    if request.method == 'POST':
        # 1. Read the JSON body sent from the JavaScript fetch request
        data = request.get_json()

        # 2. Extract the data you need (profile_uri)
        profileUser = data.get('profile_user')
        
        if not profileUser:
            # Handle missing data error
            return jsonify({'error': 'Missing profile URI in request'}), 400
        
        # initialize the knowledge graph with a profile user
        basicUser = profileUser
        jsonReqData = getDictionary(basicUser)

        return jsonify(jsonReqData)
    
    else: # request.method == 'GET' (Initial page load)
        
        basicUser = 'Nwiwu Uzoma'
        jsonIniData = getDictionary(basicUser)

        return render_template('index.html', json_data=jsonIniData)

def slugify(name):
    """Turns a profile name into a file-safe slug, e.g. 'Nwiwu Uzoma' -> 'nwiwu-uzoma'.
    Must match slugify() in static/script.js."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


@app.route('/data/<slug>.json')
def profile_data(slug):
    """Same JSON as the POST route, served as a static-style URL so the
    frontend works identically on Flask and on a static host (GitHub Pages)."""
    for name in graphData('').name_list:
        if slugify(name) == slug:
            return jsonify(getDictionary(name))
    return jsonify({'error': 'Unknown profile'}), 404


def getDictionary(UserData):
    # initialize the knowledge graph
    graf = graphData(UserData)         
    graf.get_name()  #get the first and last name of user. use this to get the personURI

        # initialize data container
    jsonData = {}
        
    jsonData["NameList"] = graf.name_list
    jsonData["Name"] = graf.name
    jsonData["Details"] = graf.get_personDetails()
    jsonData["Category"] = graf.get_categories()
    jsonData["Education"] = graf.get_Education()
    jsonData["WorkExperience"] = graf.get_workExperience()
    jsonData["Skills"] = graf.get_skill()
    jsonData["Certificate"] = graf.get_certifications()
    jsonData["SkillType"] = graf.get_skill_types()
    jsonData["Project"] = graf.get_projects()
    jsonData["ProjectClass"] = graf.get_project_class()
    jsonData["Service"] = graf.get_services()
    jsonData["Social"] = graf.get_socials()

    return jsonData


if __name__ == '__main__':
    # To run: pip install -r requirements.txt
    # Run: python app.py
    print("Running Flask app. Access http://127.0.0.1:5000/")
    app.run(debug=os.environ.get('FLASK_DEBUG', '1') == '1')