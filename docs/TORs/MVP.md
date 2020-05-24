# TheTrueHat - Minimum Viable Product

Итак, мы хотим сделать онлайн-сервер для распределённой игры в шляпу. 
В минимально возможной комплектации он должен обеспечивать поддержку 
одновременно нескольких независимых партий. 

Для каждой партии:
   1. Сформировать команду и поддерживать её от начала до конца игры
   1. Сформировать набор слов и поддерживать его от начала до конца игры
   1. Перед началом игры должно поддерживаться формирование команды для этой игры 
      с занесением идентификаторов (имён) игроков в партию. После начала игры 
      изменение списка игроков не допускается
   1. Игра состоит из ходов
   1. Сервер должен определять очередность ходов в каждой партии, а также слово 
      для объяснения и кто кому его объясняет
   1. В начале хода объясняющему предъявляется сообщение о том, кому он будет 
      объяснять, и возможность начать объяснение
   1. Тому, кому объясняют, предъявляется сообщение о том, кто ему будет объяснять
   1. Остальным игрокам предъявляется сообщение о том, кто кому объясняет, а также 
      состояние хода - подготовка/объяснение/последний ответ/окончание
   1. Объяснение начинается после того, как и объясняющий, и угадывающий просигнализируют о готовности
   1. Вначале перед объяснением идёт обратный отсчёт, затем начинается отсчет таймера 
      объяснения, течение таймера предъявляется всем синхронизированно
   1. Объясняющему предъявляется слово для объяснения
   1. Само объяснение происходит помимо сервера напрямую (очно или по онлайн-видео/аудио/текстом)
   1. У объясняющего имеется возможность зачесть слово, ошибку, досрочно окончить объяснение
   1. Если слово зачтено, появляется следующее слово (если не все слова объяснены)
   1. Если зачтена ошибка, объяснение заканчивается 
   1. В противном случае, когда время истекло, объясняющему, угадывающему и всем остальным игрокам 
      предъявляется сообщение о последнем ответе. Объясняющему предоставляется возможность зачесть его
   1. По окончании времени для последнего ответа всем предъявляется сообщение об этом, 
      а отвечающему даётся некоторое время на зачёт слова или окончание без зачета
   1. По окончании объяснения всем предъявляется информация об отгаданных словах, даётся 
      возможность исправления и зачета ошибок. Желательно показать, сколько слов было угадано и какие. 
      Если всё закончилось ошибкой, то какие слова исключены
   1. После этого начинается следующий ход
   1. Партия продолжается до исчерпания всех слов. После окончания партии демонстрируется 
      статистика по данной партии - по каждому игроку количество объяснённых им и ему слов, места

Пояснения:
  * Должна поддерживаться идентификация разных партий
  * Должна поддерживаться идентификация разных игроков внутри партии. Аутентификация 
    (соотнесение игроков с их идентификаторами) возлагается на самих игроков (без защиты от имперсонификации)
  * Кто идентифицировал себя в партии, тот и играет. Отдельных списков людей, не участвующих к партии, не поддерживается
  * Должно поддерживаться восстановление игрока (перезаход) в случае обрыва связи и/или перегрузки страницы
  * Предусматривается один определённый словарь с возможностью выбора из нескольких словарей
    в будущем (вариант - предусмотреть на будущее возможность ввода слов пользователями)
  * Задаётся одно определённое время отгадывания 3+20+3 с (вариант - предусмотреть настройку времени таймера)
  * MVP-next: у одного из других игроков имеется возможность начать объяснение заново в случае форс-мажора
    (таймер сбрасывается в ноль, слова выбираются заново, если были отгаданные - они не зачитываются и выкидываются)
