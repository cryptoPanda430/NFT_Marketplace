//const fetch = require("node-fetch");
const KalaoSignature = artifacts.require("KalaoSignature");
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

contract("KalaoSignature", (accounts) => {

    beforeEach(async function(){
        this.signature = await KalaoSignature.new();
    });

	it("Find signer", async function() {
		let owner = accounts[0];

		const hash = web3.utils.soliditySha3(owner, 100, 120, 200, 1);
		var prefixedHash = EthUtil.hashPersonalMessage(EthUtil.toBuffer(hash));
        let pk = Buffer.from(pk_0, "hex");
		var signature = EthUtil.ecsign(prefixedHash, pk);	
		var sig = EthUtil.toRpcSig(signature.v, signature.r, signature.s)

		const sig_encoded = web3.eth.abi.encodeParameters(
			["address", "uint256", "uint256", "uint256", "uint256", "bytes"],
			[owner,'100', '120', '200', '1', sig]);

		let resp = await this.signature.parseCheck.call(sig_encoded);
		assert.equal(resp[0], owner);
        assert.equal(resp[1], 100);
        assert.equal(resp[2], 120);
        assert.equal(resp[3], 200);
        assert.equal(resp[4], 1);

        //, [owner,BN(100),BN(120), BN(200)]);
	});

    it ("Reject invalid signer", async function() {
		let owner = accounts[1];

		const hash = web3.utils.soliditySha3(owner, 100, 120, 200, 1);
		var prefixedHash = EthUtil.hashPersonalMessage(EthUtil.toBuffer(hash));
        let pk = Buffer.from(pk_1, "hex");
		var signature = EthUtil.ecsign(prefixedHash, pk);	
		var sig = EthUtil.toRpcSig(signature.v, signature.r, signature.s)

		const sig_encoded = web3.eth.abi.encodeParameters(
			["address", "uint256", "uint256", "uint256", "uint256", "bytes"],
			[owner,'100', '120', '200', '1', sig]);

		await truffleAssert.reverts(this.signature.parseCheck.call(sig_encoded));
    });
})
