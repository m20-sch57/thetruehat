# with open('all_words.txt', encoding='utf-8') as f, open('processed_words.txt', 'w', encoding='utf-8') as fout:
#     t = f.read().split('\n')
#     for k in range(len(t)):
#         t[k] = t[k].lower()
#     print('\n'.join(set(t)), file = fout)

# # with open('mobile_hat_words.txt') as f:
# #     t = eval(f.read())

# # with open('processed_mobile_hat_words.txt', 'w', encoding='utf-8') as fout:
# #     for item in t:
# #         print(item['word'], file = fout)

st = input()
massiv = st[:3].split()
st = st[3:]
for i in range(0, len(st) - 2, 3):
    massiv.append(st[i:i + 3])
print(massiv)