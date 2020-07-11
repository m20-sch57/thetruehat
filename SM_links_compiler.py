import sys
import time
from urllib.parse import urlparse, urlunparse
from tempfile import TemporaryFile

URL = input("URL for use: ")
URL = urlparse(URL)
URL = urlunparse((URL.scheme,
                  URL.netloc,
                  URL.path if (len(URL.path) == 0 or URL.path[-1] != "/") else URL.path[:-1],
                  URL.params,
                  URL.query,  # Maybe replace (and some other parameters) by empty string
                  URL.fragment))
URL = urlparse(URL)

with open("static/robots.compileme", "r", encoding="utf-8") as robotsPrecompile,\
        open("static/robots.txt", "w", encoding="utf-8") as robotsTxt:
    for line in robotsPrecompile:
        robotsTxt.write(line.replace("%", URL.path))

"""
Rules for index.html:
- "$P" will be replaced by URL 
- "$D" will be replaced by date
"""
with TemporaryFile() as tempIndex:
    with open("static/index.html", "r", encoding="utf-8") as indexHTML:
        for line in indexHTML:
            tempIndex.write(bytes(line, encoding="utf-8"))

    tempIndex.seek(0)

    with open("static/index.html", "w", encoding="utf-8") as indexHTML,\
            open("static/meta.html", "r", encoding="utf-8") as meta:
        prefix = ""
        for line in tempIndex:
            line = str(line, encoding="utf-8")
            indexHTML.write(line)
            if "<!-- Social Media tag Starts -->" in line:
                prefix = line[:-len(line.lstrip())]
                break
        else:
            sys.exit()

        for line in meta:
            indexHTML.write(prefix + line.replace("$P", URL.geturl()).replace("$R", "?rubbish=" +
                                                                              str(int(time.time() * 10_000_000))))

        for line in tempIndex:
            line = str(line, encoding="utf-8")
            if "<!-- Social Media tag Ends -->" in line:
                indexHTML.write(line)
                break
        else:
            indexHTML.write("<!-- Social Media tag Ends -->")

        indexHTML.write(str(tempIndex.read(), encoding="utf-8"))
