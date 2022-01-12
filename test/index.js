const axios = require("axios");
(async () => {
	const blockchain = await axios.get("https://blockchain-staging.plutonus.dev/fetch/all").catch(err=>{throw new Error(err)});
	if(!blockchain.data) throw new Error("Connection to blockchain failed.");

	for(let i=0; i < blockchain.data.length; i++) {
		console.log(`Got hash: ${blockchain.data[i].hash}`);
		const block = await axios.get(`https://blockchain-staging.plutonus.dev/fetch/${blockchain.data[i].hash}`).catch(err=>{throw new Error(err)});
		console.log(block.data);
		console.log();
	}
})();
