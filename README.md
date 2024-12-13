## Indexing morpho points

### Objective:

Distribute points on top of Morpho users depending on their market shares. Only compute points for borrowers.

Given a market, I want to retrieve the 10 biggest users, meaning the 10 biggest borrow market point holders.

### Requirements:

- Rebuild on-chain indexer for morpho users on ethereum instance <code>0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb</code>.
- Calculate borrowpoints for each user/marker.
- Efficent and scalable.
- Architecture justification.

### Challenges:

- Fast data access.
- Indexing past data.
- Accurate points distribution.
- Scalable when deployed on mainnet accross multiple instances.
- Accurate data and backfilling.

#### Steps that I've taken:

- First, setup a new nestjs project. I've used the classic nestjs project setup and split logic between modules. Default config manager is used to manage configurations.
- Then, I have picked and setup a new database. My choice was timescaleDB because it's a time series database and it's optimized for fast data access (I was thinking of using mongodb with timeseries but after some research I came to the conclusion that timescaleDB was a better fit for my needs).
- Create a docker compose file with timescaleDB and redis. Redis might be used later for caching data, synchronization of instances when deployed to kubernetes, deadlocks, etc.
- Create entities for markets, market states and position from events.
- Used this tool to get block number from date https://ethereum-block-date-picker.vercel.app/
- Created a blockchain module to process events and save them to the database.
- Created an indexer that queries the rpc and procces historical events.
- Index market from the past from block: 21374147 (found in repo sent)
- Created a points module to calculate points for each user/market. Details in code comments.

### TODO:

- Add swagger docs.
- Add tests.
- Add caching, we can use caching for the top users endpoint with an expiration time of around 1 block time.
- Add sync mechansim so that two instances(or more) of the the app do not write in the same time in the database.
- In the indexer, we can use a queue to process events and avoid blocking the main thread. Also we can have an 'isIndexing' flag.

### Tests:

#### DB Values

\*Values in DB are only partially indexed.

| ID          | Transaction Hash | User Address | Amount           | Action | Timestamp           | Block    | Value |
| ----------- | ---------------- | ------------ | ---------------- | ------ | ------------------- | -------- | ----- |
| 68123afd... | 0x3170feb...     | 0xa9eD0d...  | 274612050260891  | Borrow | 2024-12-11 10:33:59 | 21378106 | 3     |
| de0a025a... | 0x3170feb...     | 0xa9eD0d...  | 1045645229684238 | Borrow | 2024-12-11 10:36:11 | 21378117 | 59    |
| 3d99b0bb... | 0x3170feb...     | 0xa9eD0d...  | 891239726551144  | Borrow | 2024-12-11 10:56:59 | 21378219 | 6     |
| 3a0f586b... | 0x3170feb...     | 0xa9eD0d...  | 2031178877483124 | Borrow | 2024-12-12 06:03:47 | 21383913 | 20    |
| 085a5672... | 0x3170feb...     | 0xa9eD0d...  | 1724852248436833 | Borrow | 2024-12-12 06:14:59 | 21383969 | 30    |
| 0fed4aab... | 0x3170feb...     | 0xa9eD0d...  | 239972171766805  | Repay  | 2024-12-12 06:21:35 | 21384002 | 32    |
| ee452bf6... | 0x3170feb...     | 0xa9eD0d...  | 852233993910499  | Borrow | 2024-12-11 10:34:59 | 21378106 | 3     |

#### Endpoint results

```
[GET] api/points/top-users?marketId=0x3170feb9e3c0172beb9901f6035e4e005f42177c5c14e8c0538c27078864654e
```

```json
[
  {
    "userAddress": "0xa9eD0db00E5C29E7E18A55db159Ea33fb5feA60a",
    "points": "5872566",
    "intervals": [
      {
        "startTime": "2024-12-11T08:33:59.000Z",
        "endTime": "2024-12-11T08:34:59.000Z",
        "marketTotalShares": "10071579580282637",
        "marketSharePercentage": "2.72660358856226809872",
        "eventShares": "274612050260891",
        "totalShares": "274612050260891",
        "points": "164",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-11T08:34:59.000Z",
        "endTime": "2024-12-11T08:36:11.000Z",
        "marketTotalShares": "10071579580282637",
        "marketSharePercentage": "11.18837452644908271568",
        "eventShares": "852233993910499",
        "totalShares": "1126846044171390",
        "points": "806",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-11T08:36:11.000Z",
        "endTime": "2024-12-11T08:56:59.000Z",
        "marketTotalShares": "11117224809966875",
        "marketSharePercentage": "19.54166899555664538059",
        "eventShares": "1045645229684238",
        "totalShares": "2172491273855628",
        "points": "24388",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-11T08:56:59.000Z",
        "endTime": "2024-12-12T04:03:47.000Z",
        "marketTotalShares": "12008464536518019",
        "marketSharePercentage": "25.51309529282361632063",
        "eventShares": "891239726551144",
        "totalShares": "3063731000406772",
        "points": "1755505",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-12T04:03:47.000Z",
        "endTime": "2024-12-12T04:14:59.000Z",
        "marketTotalShares": "14039643414001143",
        "marketSharePercentage": "36.2894535683787930965",
        "eventShares": "2031178877483124",
        "totalShares": "5094909877889896",
        "points": "24387",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-12T04:14:59.000Z",
        "endTime": "2024-12-12T04:21:35.000Z",
        "marketTotalShares": "15764495662437976",
        "marketSharePercentage": "43.26026199858812479725",
        "eventShares": "1724852248436833",
        "totalShares": "6819762126326729",
        "points": "17131",
        "eventType": "Borrow"
      },
      {
        "startTime": "2024-12-12T04:21:35.000Z",
        "endTime": "2024-12-13T06:54:16.088Z",
        "marketTotalShares": "15524523490671171",
        "marketSharePercentage": "42.38320073729657674523",
        "eventShares": "239972171766805",
        "totalShares": "6579789954559924",
        "points": "4050185",
        "eventType": "Repay"
      }
    ]
  }
]
```
