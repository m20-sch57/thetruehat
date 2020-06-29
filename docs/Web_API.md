## API

Это список функций и сигналов, с помощью которых клиент может взаимодействовать с сервером.

Вот несколько правил, по которым устроено API.

- Пометка `io` обозначает, что данные передаются по протоколу `socketio`.
  - Если сигнал начинается с `c`, значит его отправляет клиент.
  - Если сигнал начинается с `s`, значит его отправляет сервер.
- Пометка `GET`/`POST` обозначает, что данные передаются по протоколу `HTTP` методом `GET`/`POST`.

Все данные по протоколу `HTTP` передаются в теле запроса в формате `JSON` по адресу `http://<document.domain>/function`, где `function` — название функции.<br>
Все `socketio` запросы происходят по socket.io-адресу по умолчанию.

#### Организационное

__1.__ `GET` <a name="getRoomInfo">`getRoomInfo`</a> - функция получения информации о комнате по ключу

Query string:

- `key` - ключ комнаты, информация о которой нужна.

Ответ:

- `success (bool)` - успешен ли запрос. Если ключ комнаты не валидный, то `success = false`, иначе `success = true`.
- `state (string)` - состояние комнаты. Возможные значения:
    - `wait` - идёт набор игроков либо комната не создана.
    - `play` - идёт игра. Подключиться можно только по имени из списка.
    - `end` - игра закончена.
- `playerList` - Если `state = wait, play`. Список игроков. Описание игрока состоит из:
  - `username (string)` - имя игрока.
  - `online (bool)` - подключен ли игрок к серверу.
- `host` - Если `state = wait, play`. Хост комнаты.
- `settings` - Если `state = wait, play`. Словарь с настройками комнаты.
- `results (array)` - Если `state = end`. Список результатов по убыванию. (MVP-next) Каждый результат хранит:
    - `username (string)` - имя игрока.
    - `scoreExplained (int)` - количество объяснённых слов.
    - `scoreGuessed (int)` - количество отгаданных слов.

---

__2.__ `GET` <a name="getFreeKey">`getFreeKey`</a> - функция получения свободного ключа комнаты.

Ответ:

- `key (string)` - ключ комнаты

---

__3.__ `GET` <a name="getDictionaryList">`getDictionaryList`</a> - функция получения информации о доступных словарях.

- `dictionaries (array)` - Список словарей.
    - `name (LanguageDictionary)` - название словаря
    - `wordNumber (int)` - количество слов, содержащихся в словаре

Словарь по умолчанию должен иметь идентификатор `0`.

---

__4.__ `io` <a name="cJoinRoom">`cJoinRoom`</a> - функция, присоединяющая игрока к комнате.

- `key (string)` - ключ комнаты, в которую добавляется игрок.
- `username (string)` - имя игрока.
- `time_zone_offset` - Сдвиг часового пояса относительно UTC в миллисекундах.

---

__5.__ `io` <a name="cLeaveRoom">`cLeaveRoom`</a> - функция, удаляющая игрока из текущей игровой комнаты.

---

__6.__ `io` <a name="sPlayerJoined">`sPlayerJoined`</a> - сигнал, посылаемый сервером всем клиентам в комнате при присоединении нового игрока.

- `username (string)` - имя вошедшего игрока.
- `playerList (array)` - список игроков.
  - `username (string)` - имя игрока.
  - `online (bool)` - подключен ли игрок к серверу.
- `host` - хост комнаты.

---

__7.__ `io` <a name="sPlayerLeft">`sPlayerLeft`</a> - сигнал, посылаемый сервером всем клиентам в комнате при уходе игрока.

- `username (string)` - имя ушедшего игрока.
- `playerList (array)` - список игроков.
  - `username (string)` - имя игрока.
  - `online (bool)` - подключен ли игрок к серверу.
- `host` - хост комнаты.

---

__8.__ `io` <a name="sYouJoined">`sYouJoined`</a> - сигнал, посылаемый пользователю сервером при удачном подключении.

- `key (string)` - ключ комнаты.
- `state (string)` - состояние комнаты. Оно может принимать такие значения:
    - `wait` - идёт набор игроков либо комната не создана.
    - `play` - идёт игра. Подключиться можно только по имени из списка, за которым никто не стоит.
    - `end` - игра закончена.

Если `state = wait, play`:
- `playerList` - Cписок игроков. Игроки описаны так:
    - `username (string)` - имя игрока.
    - `online (bool)` - подключен ли игрок к серверу.
- `host` - Хост комнаты.
- `settings` - Словарь с настройками комнаты.

Если `state = play`:
- `timetable (array)` - следующие N пар. Состоит из:
  + `speaker (string)` - Кто будет объяснять.
  + `listener (string)` - Кому будут объяснять.
- `wordsLeft (int)` - Если `settings.termCondition = words`. Кол-во оставшихся слов.
- `turnsLeft (int)` - Если `settings.termCondition = turns`. Кол-во оставшихся кругов.
- `substate (string)` - Состояние комнаты во время игры. Оно может принимать такие значения:
    - `wait` - ожидаем готовности объясняющего и слушающего.
    - `explanation` - идёт объяснение слова.
    - `edit` - вносятся правки в прошедший раунд.

Если `substate = explanation`:

  + `word (string)` - Если пользователь есть `speaker`. Слово для объяснения.
  + `endTime` - Время окончания объяснения.

Если `substate = edit`:

- `editWords (array)` - список слов для правки. Состоит из:
  + `word (string)` - само слово, которые объясняли.
  + `wordState (string)` - состояние слова (угадано/не угадано/etc.).
    * `notExplained` - слово не было объяснено.
    * `explained` - слово было объяснено.
    * `mistake` - слово было объяснено с ошибкой.

---

__9.__ `io` <a name="sNewSettings">`sNewSettings`</a> - сигнал, посылаемый сервером всем клиентам в комнате при изменении настроек комнаты.

- `settings` - словарь с настройками комнаты.

---

__10.__ `io` <a name="cApplySettings">`cApplySettings`</a> - функция, устанавливающая настройки. Используется только хостом.

- `settings` - словарь с настройками комнаты.

---

__11.__ `io` <a name="sFailure">`sFailure`</a> - сообщение об ошибке.

- `request (string)` - какой запрос не получилось выполнить. (Например `cJoinRoom`).
- `msg (string)` - причина.

#### Игра

__12.__ `io` <a name="cStartGame">`cStartGame`</a> - функция, начинающая игру. Используется только хостом.

---

__13.__ `io` <a name="sGameStarted">`sGameStarted`</a> - сигнал, посылаемый сервером всем клиентам, когда игра началась.

- `timetable (array)` - следующие N пар. Состоит из
  + `speaker (string)` - имя следующего объясняющего.
  + `listener (string)` - имя того, кому будут объяснять.
- `wordsCount (int)` - Если `settings.termCondition = words`. Количество слов в шляпе.
- `turnsLeft (int)` - Если `settings.termCondition = turns`. Количество оставшихся кругов.

---

__14.__ `io` <a name="sNextTurn">`sNextTurn`</a> - сигнал, посылаемый сервером всем клиентам в начале хода.


- `timetable (array)` - следующие N пар. Состоит из
  + `speaker (string)` - имя следующего объясняющего.
  + `listener (string)` - имя того, кому будут объяснять.
- `wordsCount (int)` - Если `settings.termCondition = words`. Количество слов в шляпе.
- `turnsLeft (int)` - Если `settings.termCondition = turns`. Количество оставшихся кругов.
- `words (array)` - Список слов после правок.
  + `word (string)` - слово.
  + `wordState (string)` - состояние слова.
    * `explained` - слово было объяснено.
    * `mistake` - слово было объяснено с ошибкой.

---

__15.__ `io` <a name="cListenerReady">`cListenerReady`</a> - функция, обозначающая, что `listener` готов угадывать слова. Используется только `listener`-ом.

---

__16.__ `io` <a name="cSpeakerReady">`cSpeakerReady`</a> - функция, обозначающая, что `speaker` готов объяснять слова. Используется только `speaker`-ом.

---

__17.__ `io` <a name="sExplanationStarted">`sExplanationStarted`</a> - сигнал, посылаемый сервером всем клиентам перед началом объяснения.

- `startTime (int)` - время начала объяснения (в мс, в стандарте UTC+0 с начала Эпохи).

---

__18.__ `io` <a name="sNewWord">`sNewWord`</a> - сигнал, посылаемый сервером `speaker`-у, когда нужно сообщить слово для объяснения.

- `word` - слово для объяснения.

---

__19.__ `io` <a name="сEndWordExplanation">`сEndWordExplanation`</a> - функция, обозначающая, что `speaker` закончил объяснять текущее слово.

- `cause (string)` - причина окончания объяснения.
  - `explained` - слово было объяснено.
  - `mistake` - слово было объяснено с ошибкой.
  - `notExplained` - слово не было объяснено.

---

__20.__ `io` <a name="sWordExplanationEnded">`sWordExplanationEnded`</a> - сигнал, посылаемый всем клиентам, когда объяснение одного слова закончилось.

- `cause (string)` - причина окончания объяснения.
  - `explained` - слово было объяснено.
  - `mistake` - слово было объяснено с ошибкой.
  - `notExplained` - слово не было объяснено.
- `wordsCount (int)` - Если `settings.termCondition = words`. Количество слов в шляпе.
---

__21.__ `io` <a name="sExplanationEnded">`sExplanationEnded`</a> - сигнал, посылаемый всем клиентам в конце объяснения слов.

- `wordsCount (int)` - Если `settings.termCondition = words`. Количество слов в шляпе.
---

__22.__ `io` <a name="sWordsToEdit">`sWordsToEdit`</a> - сигнал, посылаемый `speaker`-у со списком слов для редактирования.

- `editWords (array)` - Список слов для внесения правок.
  + `word (string)` - слово.
  + `wordState (string)` - состояние слова.
    * `explained` - слово было объяснено.
    * `mistake` - слово было объяснено с ошибкой.
    * `notExplained` - слово не было объяснено.

---

__23.__ `io` <a name="cWordsEdited">`cWordsEdited`</a> - сигнал, посылаемый `speaker`-ом, когда все правки внесены.

- `editWords (array)` - Список слов с внесёнными правками.
  + `word (string)` - слово.
  + `wordState (string)` - состояние слова.
    * `explained` - слово было объяснено.
    * `mistake` - слово было объяснено с ошибкой.
    * `notExplained` - слово не было объяснено.

---

__24.__ `io` <a name="cEndGame">`cEndGame`</a> - сигнал, посылаемый `host`-ом, когда он хочет преждевременно закончить игру

---

__25.__ `io` <a name="sGameEnded">`sGameEnded`</a> - сигнал, посылаемый всем клиентам в конце игры.

- `nextKey (string)` - Ключ новой игры.
- `results (array)` - Список результатов по убыванию.
    - `username (string)` - имя игрока.
    - `scoreExplained (int)` - количество объяснённых слов.
    - `scoreGuessed (int)` - количество отгаданных слов.
