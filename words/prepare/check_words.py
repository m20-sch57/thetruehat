'''
Different tools for word's processing:
    - process words from online hat application
    - get 
'''

import urllib.request

def get_online_words(url):
    response = urllib.request.urlopen(url)
    return eval(response.read().decode())


def get_plurals_like(t):
    ans = []
    for item in t:
        if item['word'].endswith('ый'):
            ans.append(item['word'])
    return ans

# with open('all_words.txt', encoding='utf-8') as f, open('processed_words.txt', 'w', encoding='utf-8') as fout:
#     t = f.read().split('\n')
#     for k in range(len(t)):
#         t[k] = t[k].lower()
#     print('\n'.join(set(t)), file = fout)

# with open('mobile_hat_words.txt') as f:
#     t = eval(f.read())

words = get_online_words('http://the-hat.appspot.com/api/v2/dictionary/ru')
# print(words[:10])
print('\n'.join(get_plurals_like(words)))