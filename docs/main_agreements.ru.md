## Соглашения по игре.
1. В каждой игре участвуют только игроки, вошедшие в комнату и находящиеся онлайн в момент старта игры.
1. Время всегда мерится и определяется в мс (миллисекундах). Моменты времени определяются по стандарту UTC+0, с начала Эпохи.
1. Характеристики каждого слова:
    - `word (string)` - само слово.
    - `difficult (int)` - сложность слова от 0 до 100.
    - `used (int)` - кол-во "использований".
    - `tags (string?)` - JSON с тегами:
        - `"-deleted"` - "слово удалено из словаря общего пользования".
1. Характеристики каждой попытки объяснения:
    - `gameID (int)` - ID игры в системе.
    - `explNo (int)` - порядковый номер объяснения в игре.
    - `speaker` - объясняющий.
    - `listener` - угадывающий.
    - `word (string)` - слово, которое объясняли.
    - `time (int)` - время объяснения.
    - `extraTime (int)` - дополнительные время угадывания.
    - `wordState (string)` - результат объяснения.
        - `explained` - слово было объяснено.
        - `mistake` - слово было объяснено с ошибкой.
        - `notExplained` - слово не было объяснено.
1. Характеристики каждого игрока:
    - `username (string)` - его имя в игре. Может меняться. Не может содержать в "#".
    - `ID (int, null)` - ID зарегистрированного игрока в системе. `null`, если игрок не зарегистрирован.
    - `login (string, null)` - логин зарегистрированного игрока. `null`, если игрок не зарегистрирован.
    Используется для входа. Уникален. Дописывается после имени игрока после разделителя "#". Не может содержать "#".
1. Характеристики каждой игры:
    - `ID (string)` - ID игры в системе.
    - `settings (string)` - JSON с описанием всех настроек.
    - `wordsList` - список слов в игре.
    - `state (string)` - состояние комнаты. Оно может принимать такие значения:
        - `wait` - идёт набор игроков либо комната не создана.
        - `play` - идёт игра. Подключиться можно только по имени из списка, за которым никто не стоит.
        - `end` - игра закончена.
    - `substate (string)` - Если `state = play`. Состояние комнаты во время игры. Оно может принимать такие значения:
        - `wait` - ожидаем готовности объясняющего и слушающего.
        - `explanation` - идёт объяснение слова.
        - `edit` - вносятся правки в прошедший раунд.
    - `playerList` - список игроков. Игроки описаны так:
        - `username (string)` - имя игрока. Не может содержать в "#".
        - `online (bool)` - находится ли пользователь в данной игре.
    - `wordsCount (int)` - кол-во оставшихся слов.
1. Настройки каждой игры:
    - `delayTime` - время для реакции человека.
    - `explanationTime` - время для объяснения.
    - `aftermathTime` - дополнительное время угадывания.
    - `wordNumber` - количество слов в игре.
    - `strictMode` - является ли дополнительное время строгим ограничением или его никто не замечает.
1. Характеристики каждого игрока в игре:
    - `scoreExplained (int)` - количество объяснённых слов.
    - `scoreGuessed (int)` - количество угаданных слов.
    - `online (boolean)` - находится ли игрок в игре.
    - `timeZoneOffset (int)` - временной сдвиг локального времени от UTC в мс.
1. Игроки в каждый момент раунда делятся на четыре категории:
    - `speaker` - объясняющий слова.
    - `listener` - отгадывающий слова.
    - `waiter` - ожидающий своего раунда.
    - `observer` - пользователь, следящий за игрой объяснения.