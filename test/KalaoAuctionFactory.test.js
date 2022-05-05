
const KalaoAuctionFactory = artifacts.require("KalaoAuctionFactory");
const KalaoNFT = artifacts.require("KalaoNFT")
const KalaoAuction = artifacts.require("KalaoAuction")
const truffleAssert = require('truffle-assertions');
const EthUtil = require('ethereumjs-util')

const { BN } = web3.utils;
const pk_0= "02a95666dc3d1dadcf23155aee87908ae65a6481ad10a1843062bdb6bd41728c";
const pk_1= "1efffa92a8c6de83d6c1cfc193827af76636d7bfbe177a241a45b4a10c0ee5f3";
const pk_2= "e820dd49ac6f3f650c1e91e3d897db624f91bc3dcdfa4f4c9a6b0249da3640ed";
const pk_3= "25c9a7ed778b6308512b00b114937a42e705f9c46512563d4bd9453212a3e152";
const pk_4= "67c434eea1a7c1d468270184441872d912c5606804db1605dca1608d645200e7";
const pk_5= "e14b5d752dad100b4eda5ff64ac495138f94a2ede4dcbbe51cc039c61e38226e";
const pk_6= "825b7c1720b5336c3b5a896e6be2f601f58eda8650c486e997029151ff2d7fe5";
const pk_7= "5e9c1939f8eebb1cae909d601e6cae9f343da1ac1df5ea7c8526dbf6f9bfbbe9";
const pk_8= "240e6d834a6c3370bcf070b72be947fe1159d20209ac0839815cf5e7cec36d08";
const pk_9= "32a5f0da3a08482f65d2e573cf9608e01a705abf62ee32d5805c2e166c2eadd3";

function buildSignedBytes(pkStr, addr, amount, duration, extra, nonce) {
    let hash = web3.utils.soliditySha3(addr, amount, duration, extra, nonce);
    var prefixedHash = EthUtil.hashPersonalMessage(EthUtil.toBuffer(hash));
    let pk = Buffer.from(pkStr, "hex");
	var signature = EthUtil.ecsign(prefixedHash, pk);	
	let sig =  EthUtil.toRpcSig(signature.v, signature.r, signature.s)

	let sig_encoded = web3.eth.abi.encodeParameters(
		["address", "uint256", "uint256", "uint256", "uint256", "bytes"],
		[addr, amount, duration, extra, nonce, sig]);
    return sig_encoded;
}

contract("KalaoAuctionFactory", (accounts) => {
    const signer = accounts[7];
    const kalao = accounts[6];

    beforeEach(async function(){
        this.factory = await KalaoAuctionFactory.new(kalao, signer);
        this.nft = await KalaoNFT.new(); // owned by accounts[0];
		await this.nft.mint(web3.utils.asciiToHex("toto"));
		await this.nft.mint(web3.utils.asciiToHex("tata"));
    });

	it("Only owner can interact with auction factory", async function() {
        // change kalao
		await truffleAssert.reverts(this.factory.changeKalao.call(accounts[1], {from:accounts[1]}));
		await truffleAssert.reverts(this.factory.setSigner.call(accounts[1], {from:accounts[2]}));
        let resp = await this.factory.setSigner(accounts[8]);
        truffleAssert.eventEmitted(resp, "SignerChanged");
	});

	it("Create auction on ERC721 transfer with signed informations", async function() {
        // change kalao
        let auctions = await this.factory.getAuctions.call();
        assert.equal(auctions.length, 0);

        let data = buildSignedBytes(pk_7, accounts[2], 100, 120, 1, 200);
        await this.nft.safeTransferFrom(accounts[0], this.factory.address, 1, data);

        auctions = await this.factory.getAuctions.call();
        assert.equal(auctions.length, 1);

        let instance = await KalaoAuction.at(auctions[0]);
        let started = await instance.started.call();
        assert.equal(started, true);
	});
})
