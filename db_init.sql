BEGIN;
CREATE TABLE Players
(
    UserID INTEGER not null auto_increment unique,
    constraint Players_PK primary key (UserID),
    Login CHAR(32) not null unique,
    Password TEXT not null,
    Username TEXT not null
);
CREATE TABLE Games
(
    GameID INTEGER not null auto_increment unique,
    constraint Games_PK primary key (GameID),
    Settings JSON not null,
    WordsList JSON not null,
    State TEXT not null,
    Players JSON not null,
    Host TEXT not null,
    StartTime INTEGER,
    EndTime INTEGER,
    TimeZoneOffset TEXT,
    Results TEXT,
    Sent INTEGER default 0 not null
);
CREATE TABLE Participating
(
    GameID INTEGER not null unique,
    Participating_Games_GameID_FK INTEGER not null,
    foreign key (Participating_Games_GameID_FK) references Games(GameID),
    UserID INTEGER not null,
    Participating_Players_UserID_FK INTEGER not null,
    foreign key (Participating_Players_UserID_FK) references Players(UserID)
);
CREATE TABLE Words
(
    Word CHAR(32) not null unique,
    constraint Words_PK primary key (Word),
    Difficult INTEGER not null,
    Used INTEGER not null,
    Tags TEXT not null
);
CREATE TABLE Rooms
(
    RoomKey CHAR(32) not null unique,
    constraint Rooms_PK primary key(RoomKey),
    GameID INTEGER unique,
    Rooms_Games_GameID_FK INTEGER not null,
    foreign key (Rooms_Games_GameID_FK) references Games(GameID)
);
CREATE TABLE ExplanationRecords
(
    GameID INTEGER,
    ExplanationRecords_Games_GameID_FK INTEGER not null,
    foreign key (ExplanationRecords_Games_GameID_FK) references Games(GameID),
    ExplNo INTEGER,
    Speaker TEXT not null,
    SpeakerID INTEGER,
    Listener TEXT not null,
    ListenerID INTEGER,
    Word TEXT not null,
    Time INTEGER not null,
    ExtraTime INTEGER not null,
    Outcome TEXT not null,
    constraint ER_PK primary key (GameID, ExplNo)
);
CREATE INDEX Participating_GameID_Index
    on Participating (GameID);
CREATE INDEX Participating_UserID_Index
    on Participating (UserID);
CREATE UNIQUE INDEX Players_Login_UIndex
    on Players (Login);
CREATE INDEX Words_Difficult_Index
    on Words (Difficult);
CREATE INDEX ER_GameID_Index
    on ExplanationRecords (GameID);
COMMIT;
