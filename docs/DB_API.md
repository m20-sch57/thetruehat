## Tables
### Players
Used to contain players' information.

#### Content
- **UserID** (?) : *?* - user's ID. Only for the server.
    - UNIQUE 
    - NOT NULL
    - PRIMARY KEY UserID_PK
    - INDEX UserID_UIndex
- **Login** : *TEXT* - user's login to log in the site.
    - UNIQUE
    - NOT NULL
- **Password** : *TEXT* - user's password to log in the site.
    - NOT NULL
- **Username** : *TEXT* - user's name to display in games.
    - NOT NULL
    - DEFAULT "Шляпник" (?)

### Words
Used to contain words for the game.

#### Content
- **Word** : *TEXT* - contains the word itself.
    - UNIQUE
    - NOT NULL
    - PRIMARY KEY Words_PK
    - INDEX Word_UIndex
- **Difficult** : *INTEGER* - contains "difficulty" value of the word. Could be only the integer from 0 to 100.
    - NOT NULL
- **Used** : *INTEGER* - contains the number of the word uses.
    - NOT NULL
- **Tags** : *TEXT* - contains the tags of the word. Now the only tag is "-deleted" (means not to use the word).
    - NOT NULL

### Games
#### Content
- **GameID** : *?*
- **Settings** : *TEXT* - JSON
- **WordsList** : *TEXT* - JSON
- **Sate** : *TEXT*
- **Players** : *TEXT* - JSON
- **Host** : *TEXT*
- **StartTime** : *INTEGER*
- **EndTime** : *INTEGER*
- **TimeZoneOffSet** (! Заменить на / добавить пользовательские)
- **Results** : *TEXT*

### ExplanationRecords
#### Content
- **GameID** : *?*
- **ExplNo** : *INTEGER* - from 0 to ...
- **Speaker** : *TEXT*
- **SpeakerID** : *?*
- **Listener** : *TEXT*
- **ListenerID** : *?*
- **Word** : *TEXT*
- **Time** : *INTEGER*
- **ExtraTime** : *INTEGER*
- **Outcome** : *TEXT*

### Participating
#### Content
- **GameID** : *?*
- **PlayerID** : *?*