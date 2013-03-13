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
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
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
class MapData(ndb.Model):
    created = ndb.DateTimeProperty(auto_now_add=True, indexed=True)
    content = ndb.JsonProperty(compressed=True)
    content_hash = ndb.StringProperty()

    @classmethod
    def head(cls):
        return cls.query().order(-cls.created).get()

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
    head = MapData.head()

    if not head:
        refresh()
        head = MapData.head()

    return jsonify(data=head.content)

@app.route('/')
def main():
    return send_file("index.html")

@app.route('/refresh')
def refresh():
    import hashlib
    result = urlfetch.fetch(url=DATA_URL)

    if result.status_code == 200:
        csv_data = StringIO.StringIO(result.content)
        content_hash = hashlib.md5(result.content).hexdigest()
    else:
        logging.error("Unable to get DATA URL.")
        abort(500)

    head = MapData.head()
    if head and head.content_hash == content_hash:
        return jsonify(status="unchanged")

    content = [row for row in csv.DictReader(csv_data)] 

    c = MapData(content_hash=content_hash, content=content)
    c.put()

    return jsonify(status='ok')

if __name__ == "__main__":
    app.run()

