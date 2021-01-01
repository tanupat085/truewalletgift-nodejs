require("dotenv").config();
const express = require('express');
const axios = require("axios");
const path = require('path');
const { exit } = require("process");
const app = express();
app.use(express.json());
function payloaddata(code){
    return {
			'accept': 'application/json',
			'accept-encoding': 'gzip, deflate, br',
			'accept-language': 'en-US,en;q=0.9',
			'content-length': '59',
			'content-type': 'application/json',
			'origin': 'https://gift.truemoney.com',
			'referer': 'https://gift.truemoney.com/campaign/?v='+code,
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-origin',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
};
}
app.get('/', (req, res) => {
	if (req.query.key != "pieapple" | req.query.code == undefined | req.query.code == ''| req.query.mobile == undefined | req.query.mobile == ''){
		res.status(400).send({"status": {"message": "Wrong key (pieapple), giftcode , mobile"},"detail": {'example':'http://127.0.0.1:1234/?key=pieapple&code=ID1Fm1CHZSoemlnfof&mobile=0989193177'},'หมายเหตุ':'code คือ ข้อความหลัง v= ตัวอย่างข้อความ https://gift.truemoney.com/campaign/?v=ID1Fm1CHZSoemlnfof , mobile= คือเบอร์ที่จะรับเงิน'})
	}else{
		var giftcode = req.query.code,
			phonenumber = req.query.mobile;
		getpaymentstatus(giftcode,phonenumber)
		async function getpaymentstatus(code,phonenumber){
		  await axios({
			  method: 'get',
			  url: 'https://gift.truemoney.com/campaign/vouchers/'+ code +'/verify',
			}).then(function (response) {
			  getpayment(response.data.data.voucher.link,phonenumber)
			  console.log(response.data)
			}).catch(function (error) {
				console.log(error.response.data)
				res.status(400).send(error.response.data);
			});
		}
		async function getpayment(code,phonenumber){
		  await axios({
			  method: 'get',
			  url: 'https://gift.truemoney.com/campaign/vouchers/'+code+'/verify?mobile='+ phonenumber,
			}).then(function (response) {
			  console.log(response.data)	
			  redeempayment(code,phonenumber)	  
			}).catch(function (error) {
				console.log(error.response.data)
				res.status(400).send(error.response.data);
			});
		}
		async function redeempayment(code,phonenumber){
			var payloadheaders = payloaddata(code);
			var payload = {mobile: phonenumber , voucher_hash: code};
		  await axios({
			  method: 'post',
			  url: 'https://gift.truemoney.com/campaign/vouchers/'+code+'/redeem',
			  headers: payloadheaders,
			  data: payload
			}).then(function (response) {
			  res.status(200).send(response.data)	  
			}).catch(function (error) {
				console.log(error.response.data)
				res.status(400).send(error.response.data);
			});
		}
	}	
})
const port = 1234;
app.listen(port, () => console.log(`Listening on port: ${port} `));