<template>
  <div class="page" id="news">
    <article class="scrollable-wrapper">
      <div class="scrollable">
        <div class="content">
          <news-post
              :id="2"
              :date="new Date('2020-08-26')"
              version="1.2">
            <template #title>
              <ru tag="h2">
                Новый режим, регулировка сложности и не только
              </ru>
              <en tag="h2">
                The new game mode, difficulty adjustment and more
              </en>
            </template>
            <template #content>
              <ru tag="p">
                Играть стало ещё удобнее и интереснее!
              </ru>
              <en tag="p">
                The game has become more user-friendly and exciting!
              </en>
              <ul>
                <ru tag="li">Добавили режим игры со словами игроков: каждый участник пишет слова, из которых формируется
                  набор слов в шляпе
                </ru>
                <en tag="li">A new game mode with words from players: each participant writes their words that form the
                  global set
                </en>

                <ru tag="li">Появились словари разных уровней сложности на русском языке</ru>
                <en tag="li">We added russian dictionaries of varying complexity</en>

                <ru tag="li">Теперь вы можете загрузить собственный словарь и играть со словами из него</ru>
                <en tag="li">If you have your own dictionary, you can upload it for the game</en>

                <ru tag="li">Появилась возможность ограничить количество кругов в игре</ru>
                <en tag="li">Now you can limit the number of rounds to play</en>

                <ru tag="li">Отображение количества ходов до вашего следующего участия. Захотели налить чайку́? Теперь
                  всё можно спланировать!
                </ru>
                <en tag="li">Now you can see how many turns are left until your next turn. Want a cuppa tea? You can
                  plan everything!
                </en>

                <ru tag="li">По окончании старой игры новая комната создастся автоматически. Нажмите "играть ещё раз",
                  чтобы снова сыграть всем вместе!
                </ru>
                <en tag="li">Once your game is over, we will automatically create a room for a new one. Click "play
                  again" in order to continue playing with your friends!
                </en>
              </ul>
            </template>
          </news-post>
          <news-post
              :id="1"
              :date="new Date('2020-06-25')"
              version="1.1">
            <template #title>
              <ru tag="h2">
                Настройки в студию, вы все этого просили
              </ru>
              <en tag="h2">
                By popular demand, we introduce the game settings
              </en>
            </template>
            <template #content>
              <ru tag="p">
                Теперь вы не ограничены заводскими настройками. Подберите параметры под себя, чтобы играть с
                максимальным комфортом.
              </ru>
              <en tag="p">
                Now you are not limited by default settings. Choose parameters yourself to play the way that suits you
                best.
              </en>
              <ul>
                <ru tag="li">Наконец можно выбирать время объяснения и количество слов</ru>
                <en tag="li">You can change the round time and the number of words in the hat</en>

                <ru tag="li">Добавлена возможность выбора словаря: доступны словарь русских слов и словарь английских
                  слов
                </ru>
                <en tag="li">You can choose the dictionary: both Russian and English dictionaries are now available</en>

                <ru tag="li">Строгий режим. Уже нельзя будет так просто продолжать объяснять слова, когда кончилось
                  время
                </ru>
                <en tag="li">We've added a “strict” mode. In this case, editing phase starts immediately after time
                  expiration
                </en>

                <ru tag="li">Возможность выключить звук</ru>
                <en tag="li">You can now turn the sound off</en>

                <ru tag="li">Ду ю спик инглишь? Вот и перевод подъехал</ru>
                <en tag="li">The English interface you are using is part of the update</en>

                <ru tag="li">Что бы ни случилось, можно закончить партию досрочно и узнать результаты</ru>
                <en tag="li">Whatever happens, you can always finish the game and see the results</en>
              </ul>
            </template>
          </news-post>
          <news-post
              :id="0"
              :date="new Date('2020-05-24')"
              version="1.0">
            <template #title>
              <ru tag="h2">
                Мы строили, строили и наконец достроили
              </ru>
              <en tag="h2">
                The first release
              </en>
            </template>
            <template #content>
              <ru tag="p">
                Всеми любимая игра шляпа теперь онлайн.
              </ru>
              <en tag="p">
                Everyone's favourite game is now online!
              </en>
              <ul>
                <ru tag="li">Доступен режим игры "каждый с каждым"</ru>
                <en tag="li">"Personal game" mode is available</en>

                <ru tag="li">Есть возможность отредактировать прошедший раунд в случае ошибки</ru>
                <en tag="li">You can edit the results of the round in case of a mistake</en>

                <ru tag="li">Более 10 тыс. слов в словаре</ru>
                <en tag="li">More than 10k words in the dictionary</en>
              </ul>
            </template>
          </news-post>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import newsPost from "cmp/newsPost.vue";

export default {
  name: "newsPage",
  components: {newsPost}
};
</script>
