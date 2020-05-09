## Tables
### Words
Used to contain words for the game.

#### Content
- **Word** (*TEXT*) - contains the word itself.
    - Primary key
    - Unique
    - Not NULL
- **Difficult** (*INTEGER*) - contains "difficulty" value of the word. Could be only the integer from 0 to 100.
    - Not NULL
- **Used** (*INTEGER*) - contains the number of the word uses.
    - Not NULL
- **Tags** (*TEXT*) - contains the tags of the word. Now the only tag is "-deleted" (means not to use the word).
    - Not NULL

### GamesInfos
- GameID
- Sate
- StartTime
- EndTime
- TimeZoneOffSet

