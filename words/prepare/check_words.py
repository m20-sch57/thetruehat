from random import shuffle

'''
Different tools for word's processing:
    - process words from online hat application
    - get word's list with given words complexity
    - try to refine word's list (strange words, etc)
'''

import urllib.request

def get_online_data(url):
    response = urllib.request.urlopen(url)
    return eval(response.read().decode())


def get_plurals_like(t):
    ans = []
    for item in t:
        if item['word'].endswith('ый'):
            ans.append(item['word'])
    return ans

def get_words(x):
    return [item['word'] for item in x]

# returns count words with given complexity
# если count = 0, возвращаются все слова
# если count больше истинного количества слов, возвращаются все
def get_comp_data(x, L, R, count):
    x = [item['word'] for item in filter(lambda t: L <= t['diff'] <= R, x)]
    shuffle(x)
    return x[:count]

'''
saves correct json-file for thehat server
'''
def save_file_list(words, filename):
    d = {}
    d['words'] = words
    with open(filename, 'w', encoding='utf-8') as f:
        print(repr(d), file = f)


def clean_words(filename):
    with open(filename, encoding = 'utf-8') as f:
        x = f.read().lower().split('\n')
    shuffle(x)
    x = set(x)
    with open(filename, 'w', encoding = 'utf-8') as f:
        print('\n'.join(x), file = f)


words = get_online_data('http://the-hat.appspot.com/api/v2/dictionary/ru')
words = get_comp_data(words, 40, 60, 100)
save_file_list(words, 'test1.json')

# with open('all_words.txt', encoding='utf-8') as f, open('processed_words.txt', 'w', encoding='utf-8') as fout:
#     t = f.read().split('\n')
#     for k in range(len(t)):
#         t[k] = t[k].lower()
#     print('\n'.join(set(t)), file = fout)

# with open('mobile_hat_words.txt') as f:
#     t = eval(f.read())

# print(words[:10])
# print('\n'.join(get_plurals_like(words)))
# print(words[-100:])

# print('\n'.join(get_words(hardest[:10])))

# clean_words('words_tmp.txt')