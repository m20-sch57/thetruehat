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
              <h2>
                <ru>Новый режим, регулировка сложности и не только</ru>
                <en>The new game mode, difficulty adjustment and more</en>
              </h2>
            </template>
            <template #content>
              <p>
                <ru>Играть стало ещё удобнее и интереснее!</ru>
                <en>The game has become more user-friendly and exciting!</en>
              </p>
              <ul>
                <li>
                  <ru>Добавили режим игры со словами игроков: каждый участник пишет слова, из которых формируется набор
                    слов в шляпе
                  </ru>
                  <en>A new game mode with words from players: each participant writes their words that form the global
                    set
                  </en>
                </li>
                <li>
                  <ru>Появились словари разных уровней сложности на русском языке</ru>
                  <en>We added russian dictionaries of varying complexity</en>
                </li>
                <li>
                  <ru>Теперь вы можете загрузить собственный словарь и играть со словами из него</ru>
                  <en>If you have your own dictionary, you can upload it for the game</en>
                </li>
                <li>
                  <ru>Появилась возможность ограничить количество кругов в игре</ru>
                  <en>Now you can limit the number of rounds to play</en>
                </li>
                <li>
                  <ru>Отображение количества ходов до вашего следующего участия. Захотели налить чайку́? Теперь всё
                    можно спланировать!
                  </ru>
                  <en>Now you can see how many turns are left until your next turn. Want a cuppa tea? You can plan
                    everything!
                  </en>
                </li>
                <li>
                  <ru>По окончании старой игры новая комната создастся автоматически. Нажмите "играть ещё раз", чтобы
                    снова сыграть всем вместе!
                  </ru>
                  <en>Once your game is over, we will automatically create a room for a new one. Click "play again" in
                    order to continue playing with your friends!
                  </en>
                </li>
              </ul>
            </template>
          </news-post>
          <news-post
              :id="1"
              :date="new Date('2020-06-25')"
              version="1.1">
            <template #title>
              <h2>
                <ru>Настройки в студию, вы все этого просили</ru>
                <en>By popular demand, we introduce the game settings</en>
              </h2>
            </template>
            <template #content>
              <p>
                <ru>Теперь вы не ограничены заводскими настройками. Подберите параметры под себя, чтобы играть с
                  максимальным комфортом.
                </ru>
                <en>Now you are not limited by default settings. Choose parameters yourself to play the way that suits
                  you best.
                </en>
              </p>
              <ul>
                <li>
                  <ru>Наконец можно выбирать время объяснения и количество слов</ru>
                  <en>You can change the round time and the number of words in the hat</en>
                </li>
                <li>
                  <ru>Добавлена возможность выбора словаря: доступны словарь русских слов и словарь английских слов</ru>
                  <en>You can choose the dictionary: both Russian and English dictionaries are now available</en>
                </li>
                <li>
                  <ru>Строгий режим. Уже нельзя будет так просто продолжать объяснять слова, когда кончилось время</ru>
                  <en>We've added a “strict” mode. In this case, editing phase starts immediately after time
                    expiration
                  </en>
                </li>
                <li>
                  <ru>Возможность выключить звук</ru>
                  <en>You can now turn the sound off</en>
                </li>
                <li>
                  <ru>Ду ю спик инглишь? Вот и перевод подъехал</ru>
                  <en>The English interface you are using is part of the update</en>
                </li>
                <li>
                  <ru>Что бы ни случилось, можно закончить партию досрочно и узнать результаты</ru>
                  <en>Whatever happens, you can always finish the game and see the results</en>
                </li>
              </ul>
            </template>
          </news-post>
          <news-post
              :id="0"
              :date="new Date('2020-05-24')"
              version="1.0">
            <template #title>
              <h2>
                <ru>Мы строили, строили и наконец достроили</ru>
                <en>The first release</en>
              </h2>
            </template>
            <template #content>
              <p>
                <ru>Всеми любимая игра шляпа теперь онлайн.</ru>
                <en>Everyone's favourite game is now online!</en>
              </p>
              <ul>
                <li>
                  <ru>Доступен режим игры "каждый с каждым"</ru>
                  <en>"Personal game" mode is available</en>
                </li>
                <li>
                  <ru>Есть возможность отредактировать прошедший раунд в случае ошибки</ru>
                  <en>You can edit the results of the round in case of a mistake</en>
                </li>
                <li>
                  <ru>Более 10 тыс. слов в словаре</ru>
                  <en>More than 10k words in the dictionary</en>
                </li>
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
