const StarNotary = artifacts.require("../contracts/StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.lookUptokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});


it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    // 2. Call the name and symbol properties in your Smart Contract
    // and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starid = '12345';
    await instance.createStar('great star', starid, {from: user1});
    let star = await instance.tokenIdToStarInfo(starid);
    let name = "StarLite Token";
    let symbol = "SLT";
    let token_name = await instance.name.call();
    let token_symbol = await instance.symbol.call();
    assert.equal(star.token_name, name);
    assert.equal(star.token_symbol, symbol);
    assert.equal(star.token_name, token_name);
    assert.equal(star.token_symbol, token_symbol);
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let instance = await StarNotary.deployed();
    let Alice = accounts[1];
    let Bob = accounts[2];
    let AliceStarId = '1111';
    let BobStarId = '2222';
    await instance.createStar('A Star', AliceStarId, {from: Alice});
    await instance.createStar('B Star', BobStarId, {from: Bob});
    await instance.exchangeStars(AliceStarId, BobStarId, {from: Alice});
    assert.equal(await instance.ownerOf.call(AliceStarId), Bob);
    assert.equal(await instance.ownerOf.call(BobStarId), Alice);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let instance = await StarNotary.deployed();
    let Alice = accounts[1];
    let Charlie = accounts[3];
    let CharlieStarId = '3333';
    await instance.createStar('C Star', CharlieStarId, {from: Charlie});
    await instance.transferStar(Alice, CharlieStarId, {from: Charlie});
    assert.equal(await instance.ownerOf.call(CharlieStarId), Alice);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let Alice = accounts[1];
    let AliceStarId = '8888';
    await instance.createStar('Wonderful Star', AliceStarId, {from: Alice});
    assert.equal(await instance.lookUptokenIdToStarInfo.call(AliceStarId), 'Wonderful Star');
});

