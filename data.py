#
# Data caching mechanism
# ~~~~~~~~~~~~~~~~~~~~~~
# Copyright (C) 2011 Brian M Hunt.
# All Rights Reserved.
# 
import csv
import json
import logging
import StringIO
from google.appengine.api import memcache, urlfetch
from flask import Flask, jsonify, abort, send_file

#
# Google Docs spreadsheet, CSV format
# year, country, amount, comment, source
#
DATA_URL = "https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=0Ana9axt3-wi9dHctSUJXQ0J3VUFPVHhnQUxyUEk5b2c&single=true&gid=0&output=csv"

# 
# Data content
# ~~~~~~~~~~~~
# 
_dc = None

#
# Flask app
# ~~~~~~~~~
#
app = Flask(__name__)


#
# Route to /data
# ~~~~~~~~~~~~~~
# Reading & caching mechanism
#
@app.route("/data")
def hello():
    global _dc

    if _dc is not None:
        return jsonify(data=_dc)

    _dc = memcache.get('dc')

    if _dc is not None:
        return jsonify(data=_dc)

    result = urlfetch.fetch(url=DATA_URL)

    if result.status_code == 200:
        csv_data = StringIO.StringIO(result.content)
    else:
        logging.error("Unable to get DATA URL.")
        abort(500)

    _dc = [row for row in csv.DictReader(csv_data)]
    memcache.set("dc", _dc)

    return jsonify(data=_dc)

@app.route('/')
def main():
    return send_file("index.html")

if __name__ == "__main__":
    app.run()
