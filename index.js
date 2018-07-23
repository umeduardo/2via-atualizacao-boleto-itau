
const puppeteer = require('puppeteer');
const http = require('http')
const port = 3000
const ip = 'localhost'

var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var puppeteer_call = require('./puppeteer-call.js');

let browserWSEndpoint = null;

app.get('/atualiza', async function(req, res) {

  if (!browserWSEndpoint) {
  	const browser = await puppeteer.launch({headless: false});
  	browserWSEndpoint = await browser.wsEndpoint();
  }

  if( req.query.b ){
		const result = await puppeteer_call.pup1('atualizar',req.query.b, browserWSEndpoint);
		if( result.success == false ){
			res.contentType("application/json");
			res.status(400).send(result);
            res.end();
            return;	
		}
		let resp = await request.post({
				url: result.action, 
				form: result.formData
		});
		res.writeHead(200, {
		  'Content-Type': 'application/pdf',
		  'Content-Disposition': 'inline; filename=boleto.pdf'
		});
		resp.pipe(res);
  } else {
  	res.send("Not found");
  }
});

app.get('/2via', async function(req, res) {

  if (!browserWSEndpoint) {
  	const browser = await puppeteer.launch({headless: true});
  	browserWSEndpoint = await browser.wsEndpoint();
  }
  
  if( req.query.b ){
		const result = await puppeteer_call.pup1('2via',req.query.b, browserWSEndpoint);		
		if( result.success == false ){
			res.contentType("application/json");
			res.status(400).send(result);
            res.end();
            return;	
		}
		let resp = await request.post({
				url: result.action, 
				form: result.formData
		});
		res.writeHead(200, {
		  'Content-Type': 'application/pdf',
		  'Content-Disposition': 'inline; filename=boleto.pdf'
		});
		resp.pipe(res);
  } else {
  		res.send("Not found");
  }

});

app.listen(3000, async function(){
});