## Agreements about common objects
TODO

## Tables
### Players
Used to contain players' information.

#### Columns
- **UserID** : *INTEGER* - user's ID. Only for the server.
    - PRIMARY KEY Players_PK
    - AUTOINCREMENT
- **Login** : *TEXT* - user's login to log in the site.
    - NOT NULL
    - UNIQUE INDEX Players_Login_UIndex
- **Password** : *TEXT* - user's password to log in the site.
    - NOT NULL
- **Username** : *TEXT* - user's name to display in games.
    - NOT NULL

#### Keys
- PRIMARY KEY Players_PK:
    - UserID

#### Indices
- UNIQUE INDEX Players_Login_UIndex:
    - Login

### Words
Used to contain words for the game.

#### Columns
- **Word** : *TEXT* - contains the word itself.
    - PRIMARY KEY Words_PK
- **Difficult** : *INTEGER* - contains "difficulty" value of the word. Could be only the integer from 0 to 100.
    - NOT NULL
    - INDEX Words_Difficult_Index
- **Used** : *INTEGER* - contains the number of the word uses.
    - NOT NULL
- **Tags** : *TEXT* - contains the tags of the word. Now the only tag is "-deleted" (means not to use the word).
    - NOT NULL

#### Keys
- PRIMARY KEY Words_PK:
    - Word

#### Indices
- INDEX Words_Difficult_Index:
    - Difficult ASC

### Games
Used to contain games' infos.

#### Columns
- **GameID** : *INTEGER* - ID of the game.
    - PRIMARY KEY Games_PK
    - AUTOINCREMENT
- **Settings** : *TEXT* - JSON with settings of the room. TODO: settings specification
    - DEFAULT "{}"
    - NOT NULL
- **WordsList** : *TEXT* - JSON with list of words.
    - DEFAULT "[]"
    - NOT NULL
- **State** : *TEXT* - state of the room: "wait", "play", or "end".
    - DEFAULT "wait"
    - INDEX Games_State_Index (?)
    - NOT NULL
- **Players** : *TEXT* - JSON with list of players with `username` and `online`.
    - DEFAULT "[]"
    - NOT NULL
- **Host** : *TEXT* - username of the room host.
    - DEFAULT ""
    - NOT NULL
- **StartTime** : *INTEGER* - UNIX timestamp in milliseconds of the game start. NULL if it's undefined.
- **EndTime** : *INTEGER* - UNIX timestamp in milliseconds of the game end. NULL if it's undefined.
- **TimeZoneOffSet** (! Заменить на / добавить пользовательские) : *TEXT* - JSON with ??? NULL if it's undefined.
- **Results** : *TEXT* - JSON with the results. See ???.md NULL if it's undefined.
- **Sent** : *INTEGER* - 1 if it was sent to Sombrero else 0.
    - DEFAULT 0
    - NOT NULL

#### Keys
- PRIMARY KEY Games_PK:
    - GameID

#### Indices
- INDEX Games_State_Index (?):
    - State
    
### Rooms
Used to find game ID by room key.

#### Columns
- **RoomKey** : *TEXT* - key of the room.
    - PRIMARY KEY Rooms_PK
- **GameID** : *INTEGER* - ID of the game
    - FOREIGN KEY GameID REFERENCES Games
    - NOT NULL (?)

#### Keys
- PRIMARY KEY Rooms_PK:
    - RoomKey
- FOREIGN KEY GameID REFERENCES Games:
    - GameID

### Indices

### ExplanationRecords
Used to contain explanation records.

#### Columns
- **GameID** : *INTEGER* - ID of the game
    - FOREIGN KEY GameID REFERENCES Games
    - INDEX ER_GameID_Index
    - UNIQUE INDEX ER_GameID_ExplNo_UIndex
- **ExplNo** : *INTEGER* - Number of explanation in the game. Start at 0 (?).
    - UNIQUE INDEX ER_GameID_ExplNo_UIndex
- **Speaker** : *TEXT* - Speaker's name.
    - NOT NULL
- **SpeakerID** : *INTEGER* - Speaker's ID. NULL if speaker is not authorized.
    - INDEX ER_SpeakerID_Index (?)
- **Listener** : *TEXT* - Listener's name.
    - NOT NULL
- **ListenerID** : *INTEGER* - Listener's ID. NULL if speaker is not authorized.
    - INDEX ER_ListenerID_Index (?)
- **Word** : *TEXT* - Word to explain.
    - FOREIGN KEY Word REFERENCES Words
    - INDEX ER_Word_Index (?)
    - NOT NULL
- **Time** : *INTEGER* - explanation time. Without extra time when speaker keeps silent.
    - NOT NULL
- **ExtraTime** : *INTEGER* - extra time when speaker keeps silent.
    - NOT NULL
- **Outcome** : *TEXT* - result of the explanation: ??? (? what specification to use).
    - NOT NULL

#### Keys
- FOREIGN KEY GameID REFERENCES Games:
    - GameID
- FOREIGN KEY Word REFERENCES Words:
    - Word

#### Indices
- INDEX ER_GameID_Index:
    - GameID ASC
- UNIQUE INDEX ER_GameID_ExplNo_UIndex:
    - GameID
    - ExplNo
- INDEX ER_SpeakerID_Index (?):
    - SpeakerID
- INDEX ER_ListenerID_Index (?):
    - ListenerID
- INDEX ER_Word_Index (?):
    Word

### Participating
Used to match games and their participants.

#### Columns
- **GameID** : *INTEGER* - ID of the game.
    - FOREIGN KEY GameID REFERENCES Games
    - INDEX Participating_GameID_Index
    - NOT NULL
- **UserID** : *INTEGER* - user's ID. Only for the server.
    - FOREIGN KEY UserID REFERENCES Players
    - INDEX Participating_UserID_Index
    - NOT NULL

#### Keys
- FOREIGN KEY GameID REFERENCES Games:
    - GameID
- FOREIGN KEY UserID REFERENCES Players:
    - UserID

#### Indices
- INDEX Participating_GameID_Index:
    GameID ASC
- INDEX Participating_UserID_Index:
    UserID ASC
