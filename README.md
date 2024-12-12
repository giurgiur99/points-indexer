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
