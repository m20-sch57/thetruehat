from urllib.parse import urlparse

URL = input("URL for use: ")
if len(URL) != 0 and URL[-1] == "/":
    URL = URL[:-1]
URL = urlparse(URL)

robotsTxt = open("static/robots.txt", "w", encoding="utf-8")

robotsTxt.write("user-agent: * # All bots\n")
robotsTxt.write("disallow: " + URL.path + "/\n")
robotsTxt.write("allow: " + URL.path + "/hat2\n")
robotsTxt.write("allow: " + URL.path + "/index.html\n")
robotsTxt.write("# allow: " + URL.path + "/about.ru.html\n")

robotsTxt.close()

indexHTML = open("static/index.html", "r", encoding="utf-8")

allIndexHTML = indexHTML.readlines()

indexHTML.close()

tempAll = list(map(lambda line: line.strip(), allIndexHTML))

if "<!-- Social Media tag Starts -->" in tempAll:
    start = tempAll.index("<!-- Social Media tag Starts -->")
    end = tempAll.index("<!-- Social Media tag Ends -->") + 1

    allIndexHTML[start:end] = list(map(lambda line: line + "\n",
                                       f"""    <!-- Social Media tag Starts -->
    <!-- Common Data -->
    <meta name="description"
          content="Известная игра Шляпа теперь онлайн в удобном интерфейсе. Играй уже сейчас!">
    <!-- Open Graph data -->
    <meta property="og:title" content="TheTrueHat" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="{URL.geturl()}/hat2-SM.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Цилиндр - символ игры и TheTrueHat" />
    <meta property="og:url" content="{URL.geturl()}/" />
    <meta property="og:description"
          content="Известная игра Шляпа теперь онлайн в удобном интерфейсе. Играй уже сейчас!" />
    <meta property="og:determiner" content="" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:locale:alternate" content="en_US" />
    <!-- Twitter Card data -->
    <!-- Social Media tag Ends -->""".split("\n")))

    indexHTML = open("static/index.html", "w", encoding="utf-8")

    print(*allIndexHTML, sep="", end="", file=indexHTML)

    indexHTML.close()
