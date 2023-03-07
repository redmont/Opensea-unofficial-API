/**
 * @todo: create & exec arb (you can do 1st via Blur app to understand each step)
 *
 * //preparation:
 * 1. ACC_0: Create Sell Order (for 0.01 ETH)
 * 2. ACC_1: Create Buy Order (for 0.02 ETH)
 *
 * //execution (in a single script, as fast as possible, this needs to emit target bot behavior):
 * 3. Get data from API about above Buy & Sell orders (using our endpoints)
 * 4. ACC_2: Buy from Sell order (for 0.01 ETH)
 * 5. ACC_2: Sell to Buy Order (for 0.02 ETH) (need to make approvals, deposits etc.)
 */