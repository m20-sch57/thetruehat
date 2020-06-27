'''
get nouns from ruscorpora.ru
dependencies: bs4, urllib, lxml
'''

import urllib.request
from bs4 import BeautifulSoup

def get_online_data(url):
    response = urllib.request.urlopen(url)
    return response.read().decode()


def get_word_list_from_page(URL_param):
    contents = get_online_data(URL_param)
    data = BeautifulSoup(contents, 'lxml')

    result = []
    spans = data.find_all('span', {'class': 'page-stat-table-title'})
    tt = spans[1].find_parent('table')
    for row in tt.findAll('tr')[1:]:
        cells = row.findAll('td')
        # print(cells)
        if len(cells) > 1:
            result.append(cells[1].text.lower())
        else:
            result.append(cells[0].text.lower())
    return result


def get_all_words_list(URL_param):
    try:
        ans = []
        page = 34
        print('Processing page', page, end = ' | ')
        lemmas = get_word_list_from_page(URL_param + str(page))
        ans.extend(lemmas)
        hash1 = lemmas[0] + lemmas[1] + lemmas[-2] + lemmas[-1]
        print(f'"hash" = {lemmas[0] + lemmas[1] + lemmas[-2] + lemmas[-1]}')
        while True:
            page += 1
            print('Processing page', page, end = ' | ')
            lemmas = get_word_list_from_page(URL_param + str(page))
            print(f'"hash" = {lemmas[0] + lemmas[1] + lemmas[-2] + lemmas[-1]}')
            if hash1 == lemmas[0] + lemmas[1] + lemmas[-2] + lemmas[-1]:
                print(f'"hash" = {hash1}')
                return ans
            else:
                hash1 == lemmas[0] + lemmas[1] + lemmas[-2] + lemmas[-1]
            ans.extend(lemmas)
    except Exception as e:
        print('Exception, page', page)
        print(str(e))
        return ans


def clean_file(filename):
    with open(filename) as f, open(filename[:filename.find('.')] + '_clean.txt', 'w') as f_out:
        print('\n'.join(sorted(set(f.read().split('\n')))), file = f_out)

# # clean_file('tech_terms_1_125.txt')

URL = "http://processing.ruscorpora.ru/search.xml?sort=i_grtagging&lang=ru&parent1=0&startyear=1991&max2=1&text=lexgramm&sem-mod2=sem&sem-mod2=sem2&gramm1=S&sem-mod1=sem&sem-mod1=sem2&level1=0&level2=0&api=1.0&mode=main&env=alpha&min2=1&endyear=2011&nodia=1&sem1=r:concr%20t:plant&parent2=0&p="

filename = 'plants_terms_2.txt'

with open(filename, 'w') as f:
    print('\n'.join(set(get_all_words_list(URL))), file = f)

clean_file(filename)