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
- **Used** : *INTEGER* - contains the number of the word uses.
    - NOT NULL
- **Tags** : *TEXT* - contains the tags of the word. Now the only tag is "-deleted" (means not to use the word).
    - NOT NULL

#### Keys
- PRIMARY KEY Words_PK:
    - Word

#### Indices

### Games
#### Columns
- **GameID** : *INTEGER* - ID of the Game
    - PRIMARY KEY Games_PK
    - AUTOINCREMENT
- **Settings** : *TEXT* - JSON
    - DEFAULT "{}"
    - NOT NULL
- **WordsList** : *TEXT* - JSON
    - DEFAULT "{}"
    - NOT NULL
- **State** : *TEXT*
    - DEFAULT "wait"
    - NOT NULL
- **Players** : *TEXT* - JSON
    - DEFAULT "{}"
    - NOT NULL
- **Host** : *TEXT*
- **StartTime** : *INTEGER*
- **EndTime** : *INTEGER*
- **TimeZoneOffSet** (! Заменить на / добавить пользовательские) : *TEXT* - JSON
- **Results** : *TEXT* - JSON

#### Keys
- PRIMARY KEY Games_PK:
    - GameID

#### Indices

### ExplanationRecords
#### Columns
- **GameID** : *INTEGER*
    - FOREIGN KEY GameID REFERENCES Games
    - UNIQUE INDEX GameID_ExplNo_UIndex
- **ExplNo** : *INTEGER* - from 0 to ...
    - UNIQUE INDEX GameID_ExplNo_UIndex
- **Speaker** : *TEXT*
    - NOT NULL
- **SpeakerID** : *INTEGER*
- **Listener** : *TEXT*
    - NOT NULL
- **ListenerID** : *INTEGER*
- **Word** : *TEXT*
    - NOT NULL
- **Time** : *INTEGER*
    - NOT NULL
- **ExtraTime** : *INTEGER*
    - NOT NULL
- **Outcome** : *TEXT*
    - NOT NULL

#### Keys
- FOREIGN KEY GameID REFERENCES Games:
    - GameID

#### Indices
- UNIQUE INDEX GameID_ExplNo_UIndex:
    - GameID
    - ExplNo

### Participating
#### Columns
- **GameID** : *INTEGER*
- **PlayerID** : *INTEGER*

#### Keys
- FOREIGN KEY PlayerID REFERENCES Players:
    - PlayerID

#### Indices
