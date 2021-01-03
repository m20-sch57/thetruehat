<template>
  <div class="popup" id="rules">
    <article>
      <header>
        <h1 v-translate:ru>Правила</h1>
        <h1 v-translate:en>Rules</h1>
        <button
            class="btn-icon btn-transparent"
            @click="$emit('close')">
          <span class="fas fa-times"></span>
        </button>
      </header>
      <main v-if="$language.current === 'ru'">
        <h2>Общее</h2>
        <p>
          Ваша главная задача в игре в шляпу &ndash; это объяснение как можно большего количества слов. Традиционно в
          этой игре используют шляпу, куда сначала складывают слова, а потом вытаскивают для объяснения. В условиях
          пандемии стало сложно собираться вместе, чтобы сыграть в эту игру. Поэтому мы и сделали онлайн шляпу, чтобы вы
          могли играть, не выходя из дома.
        </p>

        <h2>Как начать</h2>
        <p>
          Сначала вам нужно собрать компанию. Шляпа &ndash; это игра, где вам понадобится много общаться с вашими
          товарищами. Вы можете использовать любые средства связи для этого, либо собраться вживую (но только если у вас
          уже закончился карантин ;) Выберите кодовое слово (ключ), по которому все участники смогут зайти в комнату.
          Также кто-то из вас может создать комнату самостоятельно и разослать всем остальным ключ или ссылку на игру.
          Первому из зашедших будет поручена важная роль &ndash; начать игру, когда все войдут.
        </p>

        <h2>Ход игры</h2>
        <p>
          Основную часть хода составляет этап объяснения.
          <br>
          Два игрока будут выбраны в качестве <b>текущей пары</b>, о чём все узнают заранее.
          Когда игроки будут готовы, один из них сможет увидеть <b>слово</b>, которое ему необходимо <b>объяснить</b>
          второму игроку в паре.
          <br>
          Если слово было объяснено успешно, нужно нажать на кнопку <b>угадал</b>. Слово будет вынуто из шляпы, а
          текущей паре будет засчитано объяснение слова.
          <br>
          Если во время объяснения была допущена ошибка, следует нажать на кнопку <b>ошибка</b>. В таком случае слово
          тоже будет вынуто из шляпы, а объяснение слов немедленно прекратится.
          <br>
          Если слово оказалось сложным, и понятно, что не получится объяснить его за оставшееся время, можно нажать на
          кнопку <b>не угадал</b>, чего делать мы не советуем. Хороший игрок в шляпу будет объяснять слово до победного
          конца.
          <br>
          Помните про <b>время</b>. Оно ограничено, и по его истечении объяснение слова должно быть прекращено.
          Отгадывающий при этом имеет одну попытку, чтобы угадать последнее слово.
        </p>
        <h2>Редактирование раунда</h2>
        <p>
          Когда последнее слово будет либо угадано, либо нет, объясняющему будет предоставлена возможность
          отредактировать прошедший раунд в случае каких-либо ошибок, допущенных во время объяснения.
          <br>
          Когда редактирование раунда завершено, начинается следующий ход.
        </p>

        <h2>Как объяснять слово</h2>
        <p>
          Вы сами можете договориться о правилах объяснения слов, например, что слово нужно объяснять жестами, но вот
          правила, которые мы <b>рекомендуем</b>:
        <ul>
          <li>При объяснении слова нельзя использовать однокоренные слова</li>
          <li>При объяснении нельзя использовать несуществующие слова</li>
          <li>Нельзя объяснять слово по буквам</li>
        </ul>

        <h2>Подведение итогов</h2>
        <p>
          Когда слова закончатся, закончится и игра. Результат игрока &ndash; это <b>сумма</b> количеств объяснённых и
          угаданных слов.
        </p>

        <p>
          Подробнее читайте тут: <a href="http://thehat.ru/rules/rulesPopup.vue">http://thehat.ru/rules/</a>
        </p>
      </main>
      <main v-else-if="$language.current === 'en'">
        <p>The game is also known as "Alias" among English-speakers, but the name "Hat" will be used here.</p>

        <h2>General</h2>
        <p>
        Your goal in the Hat game is to explain and guess as many words as you can. In a normal offline game, players use a real hat as a word container. They pull out the words and try to explain them. In the context of the pandemic, it's difficult to meet each other and play Hat. So, we've created this web app to allow you to play remotely.
        </p>

        <h2>How to start?</h2>
        <p>
        At first you have to assemble a team of Hat players. The Hat is a game where you have to communicate a lot. You can use any means of communication or even meet in real life (but only if the quarantine has ended ;). Choose a key which will be used to enter the game. Also, if you feel like being the leader of your team, you can create a room and send its key or link to the others. In this case, you will become the room holder and you will be able to do special things: edit the game settings and start the game.
        </p>

        <h2>Game round</h2>
        <p>
        The main part of the game round is an explanation stage.
        <br>
        At this stage, two players are chosen as the <b>current pair</b> (speaker and listener) and everyone can see it in advance. As soon as both of them are ready, the speaker will see a <b>word</b>, which they will have to explain to the listener.
        <br>
        If the word has been explained successfully, the speaker presses the <b>Explained</b> button. The word will be removed from the hat and the current pair gets one point.
        <br>
        If you have broken a rule while explaining, press the <b>Mistake</b> button. The word will be removed, and the explanation will stop immediately.
        <br>
        If a word seems too difficult and you don't want to explain it, you can press the <b>Not explained</b> button. The explanation will stop. We don't recommend this, because a good Hat player should fight to the end!!!
        <br>
        Keep track of <b>time</b>! It is limited, and once it expires, the explanation has to be finished. The listener has only one attempt to guess the last word.
        </p>
        <h2>Round editing</h2>
        <p>
        After the last word has been either guessed or not, the speaker gets an opportunity to edit the results of the round in case they are wrong.
        <br>
        The next round starts only after the editing stage has been completed.
        </p>

        <h2>How to explain a word?</h2>
        <p>
          You can use your own rules (even pantomime), but there are the rules which we highly <b>recommend</b>:
          <ul>
            <li>You can't use cognate words</li>
            <li>You can't use non-existent words</li>
            <li>You can't talk about the letters of the word (however, you can use terms such as "beginning of the word", suffix, prefix)</li>
          </ul>
          <br>
          You can find detailed rules there <a href="http://thehat.ru/rules/">http://thehat.ru/rules/</a>
        </p>

        <h2>Summing up</h2>
        <p>
        The game ends as soon as there are no words in the hat. The result of a player is the <b>sum</b> of all the words they have explained and guessed during the game.
        </p>
      </main>
      <footer>
      </footer>
    </article>
  </div>
</template>

<script>
export default {
  name: "rulesPopup"
};
</script>
