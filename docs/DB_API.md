## Tables
### Players
Used to contain players' information.

#### Columns
- **UserID** : *INTEGER* - user's ID. Only for the server.
    - PRIMARY KEY Players_PK
    - AUTOINCREMENT
- **Login** : *TEXT* - user's login to log in the site.
    - NOT NULL
    - UNIQUE INDEX Login_UIndex
- **Password** : *TEXT* - user's password to log in the site.
    - NOT NULL
- **Username** : *TEXT* - user's name to display in games.
    - NOT NULL

#### Keys
- PRIMARY KEY Players_PK:
    - UserID

#### Indices
- UNIQUE INDEX Login_UIndex:
    - Login

### Words
Used to contain words for the game.

#### Columns
- **Word** : *TEXT* - contains the word itself.
    - PRIMARY KEY Words_PK
- **Difficult** : *INTEGER* - contains "difficulty" value of the word. Could be only the integer from 0 to 100.
    - NOT NULL
    - INDEX Difficult_Index
- **Used** : *INTEGER* - contains the number of the word uses.
    - NOT NULL
- **Tags** : *TEXT* - contains the tags of the word. Now the only tag is "-deleted" (means not to use the word).
    - NOT NULL

#### Keys
- PRIMARY KEY Words_PK:
    - Word

#### Indices
- INDEX Difficult_Index:
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
    - DEFAULT "{}"
    - NOT NULL
- **State** : *TEXT* - state of the room: "wait", "play", or "end".
    - DEFAULT "wait"
    - NOT NULL
- **Players** : *TEXT* - JSON with list of players' usernames.
    - DEFAULT "{}"
    - NOT NULL
- **Host** : *TEXT* - username of the room host. NULL if it's undefined.
- **StartTime** : *INTEGER* - UNIX timestamp in milliseconds of the game start.
- **EndTime** : *INTEGER* - UNIX timestamp in milliseconds of the game end.
- **TimeZoneOffSet** (! Заменить на / добавить пользовательские) : *TEXT* - JSON with ???
- **Results** : *TEXT* - JSON with the results. See ???.md

#### Keys
- PRIMARY KEY Games_PK:
    - GameID

#### Indices

### ExplanationRecords
Used to contain explanation records.

#### Columns
- **GameID** : *INTEGER* - ID of the game
    - FOREIGN KEY GameID REFERENCES Games
    - UNIQUE INDEX GameID_ExplNo_UIndex
- **ExplNo** : *INTEGER* - Number of explanation in the game. Start at 0 (?).
    - UNIQUE INDEX GameID_ExplNo_UIndex
- **Speaker** : *TEXT* - Speaker's name.
    - NOT NULL
- **SpeakerID** : *INTEGER* - Speaker's ID. NULL if speaker is not authorized.
- **Listener** : *TEXT* - Listener's name.
    - NOT NULL
- **ListenerID** : *INTEGER* - Listener's ID. NULL if speaker is not authorized.
- **Word** : *TEXT* - Word to explain.
    - FOREIGN KEY Word REFERENCES Words
    - NOT NULL
- **Time** : *INTEGER* - explanation time. Without extra time when speaker keeps silent.
    - NOT NULL
- **ExtraTime** : *INTEGER* - extra time when speaker keeps silent.
    - NOT NULL
- **Outcome** : *TEXT* - result of the explanation: ??? (? what specification to use).
    - NOT NULL
- **Sent** (?) : *INTEGER* - 1 if it was sent to Sombrero else 0.

#### Keys
- FOREIGN KEY GameID REFERENCES Games:
    - GameID
- FOREIGN KEY Word REFERENCES Words:
    - Word

#### Indices
- UNIQUE INDEX GameID_ExplNo_UIndex:
    - GameID
    - ExplNo

### Participating
Used to match games and their participants.

#### Columns
- **GameID** : *INTEGER* - ID of the game.
    - NOT NULL
- **UserID** : *INTEGER* - user's ID. Only for the server.
    - NOT NULL

#### Keys
- FOREIGN KEY GameID REFERENCES Games:
    - GameID
- FOREIGN KEY UserID REFERENCES Players:
    - UserID

#### Indices
