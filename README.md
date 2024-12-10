## Indexing morpho points 

### Objective: 
Distribute points on top of Morpho users depending on their market shares. Only compute points for borrowers.

Given a market, I want to retrieve the 10 biggest users, meaning the 10 biggest borrow market point holders. 

### Requirements:
- Rebuild on-chain indexer for morpho users on ethereum instance <code>0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb</code>.
- Accurate indexed values of LTV for all borrowers, at one given time.
- Efficent and scalable.
- Architecture justification.

### Challenges:
- Fast data access.
- Indexing past data.
- Scalable when deployed on mainnet accross multiple instances.
- Accurate data and backfilling.


