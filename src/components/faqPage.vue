<template>
  <div class="page" id="faq">
    <article class="scrollable-wrapper">
      <div class="scrollable">
        <div class="content">
          <h3 class="question">
            <ru>Мой друг создал игру, как мне к ней присоединиться?</ru>
            <en>My friend has created a game, how do I join it?</en>
          </h3>
          <p class="answer">
            <ru>Для этого он должен прислать вам ключ комнаты, который необходимо вставить в соответствующее поле.</ru>
            <en>They should send you the game key, so you can paste it into the corresponding field.</en>
          </p>

          <h3 class="question">
            <ru>Что обозначают слова, которые используются как ключи комнат?</ru>
            <en>What is the meaning of the words which are used as room keys?</en>
          </h3>
          <p class="answer">
            <ru>Это не слова, а случайные последовательности букв. Нет, они не попадутся в шляпе.</ru>
            <en>These "words" are just random letter sequences, they don't mean anything. You won't find any of them in
              the game.
            </en>
          </p>

          <h3 class="question">
            <ru>Как включить голосовую связь?</ru>
            <en>How do I enable a voice chat?</en>
          </h3>
          <p class="answer">
            <ru>Пока никак. Предполагается использование сторонних сервисов для видео и голосового общения, таких как
              Zoom, Skype или Discord.
            </ru>
            <en>This feature is not available yet. We assume that you are using some third-party service for audio/video
              communication, such as Zoom, Skype, or Discord.
            </en>
          </p>

          <h3 class="question">
            <ru>Как поменять начальное количество слов в шляпе?</ru>
            <en>How do I change the number of words in the hat?</en>
          </h3>

          <p class="answer">
            <ru>Владелец комнаты может сделать это в настройках комнаты перед началом игры.</ru>
            <en>The room holder can do this on the game settings page.</en>
          </p>

          <h3 class="question">
            <ru>Можно ли играть по парам?</ru>
            <en>Is it possible to play in pairs?</en>
          </h3>
          <p class="answer">
            <ru>Да, владелец комнаты может указать режим игры в настройках комнаты.</ru>
            <en>Yes, the room holder can specify the game mode on the game settings page.</en>
          </p>

          <h3 class="question">
            <ru>Когда заканчивается игра?</ru>
            <en>When does the game end?</en>
          </h3>
          <p class="answer">
            <ru>Когда все слова в шляпе будут объяснены или будет сыграно необходимое число кругов. Владелец комнаты
              также может досрочно закончить игру, нажав на кнопку с флажком.
            </ru>
            <en>When all the words in the hat are explained or the adjusted number of rounds has been played. The room
              host can also finish the game by pressing the button with a flag.
            </en>
          </p>

          <h3 class="question">
            <ru>Откуда берутся слова в шляпе?</ru>
            <en>Where do the words come from?</en>
          </h3>
          <p class="answer">
            <ru>Из словаря Sombrero API.</ru>
            <en>Russian words are taken from Sombrero API.</en>
          </p>

          <h3 class="question">
            <ru>Я случайно закрыл вкладку с игрой, что мне делать?</ru>
            <en>I accidentally closed the game tab. What should I do?</en>
          </h3>
          <p class="answer">
            <ru>Нужно зайти в комнату по её ключу под своим именем.</ru>
            <en>Just enter the game room by typing in its key and your name.</en>
          </p>

          <h3 class="question">
            <ru>Можно ли отрегулировать громкость звука?</ru>
            <en>How can I adjust the sound volume?</en>
          </h3>
          <p class="answer">
            <ru>Регулировать громкость пока нельзя, но скоро это будет реализовано. Звук можно полностью отключить на
              странице игры, нажав на кнопку в правом верхем углу.
            </ru>
            <en>You can't, but it will be implemented soon. To turn the sound off, press the button in the right corner
              on the game page.
            </en>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: "faqPage"
};
</script>
