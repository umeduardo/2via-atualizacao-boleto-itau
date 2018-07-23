const puppeteer = require('puppeteer');
const http = require('http')
const port = 3000
const ip = 'localhost'

var browser;
var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/atualiza', async function(req, res) {
  if( req.query.b ){
		const result = await pup1('atualizar',req.query.b);
		
		if( result.success == false ){
			res.contentType("application/json");
			res.status(400).send(result);
            res.end();
            return;	
		}

		let resp = await request.post(
			{
				url: result.action, 
				form: result.formData
		});

		res.writeHead(200, {
		  'Content-Type': 'application/pdf',
		  'Content-Disposition': 'inline; filename=boleto.pdf'
		});
		resp.pipe(res);

		/*
		let file = fs.createWriteStream(req.query.b+".pdf");
		resp.pipe(file);

		file.on('finish', () => {
			fs.readFile(req.query.b+".pdf" , function (err,data){
	            res.contentType("application/pdf");
	            res.status(200).send(data);
	            res.end();

	            fs.unlink(req.query.b+".pdf");
	        });
		})
		*/
  } else {
  	res.send("Not found");
  }
});

app.get('/2via', async function(req, res) {
  
  if( req.query.b ){
		const result = await pup1('2via',req.query.b);
		
		if( result.success == false ){
			res.contentType("application/json");
			res.status(400).send(result.error);
            res.end();
            return;	
		}

		let resp = await request.post(
			{
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
	 browser = await puppeteer.launch({headless:true});
});

function pup1( type, linhaDigitavel ){
	return new Promise(function(resolve, reject){
		let a = (async () => {
			try{
				console.log(linhaDigitavel);

				const page = await browser.newPage();
				await page.setRequestInterception(true);
				let block_ressources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
				page.on('request', requestInterception => {
					if (
						block_ressources.indexOf(requestInterception.resourceType) > 0
						|| requestInterception.url().includes('.jpg')
						|| requestInterception.url().includes('.jpeg')
						|| requestInterception.url().includes('.png')
						|| requestInterception.url().includes('.gif')
						|| requestInterception.url().includes('.css')
					)
						requestInterception.abort();
					else
						requestInterception.continue();
				});

				if(type == "atualizar")
					await page.goto('https://www.itau.com.br/servicos/boletos/atualizar/');
				else
					await page.goto('https://www.itau.com.br/servicos/boletos/segunda-via/');

				await page.$eval('#formResultado', e => e.setAttribute("target", "_self"));
				await page.type('#representacaoNumerica', linhaDigitavel);

				await page.click('#btnProximo a');

				console.log("3");
				await page.waitForNavigation()

				console.log("4");

				const result = await page.evaluate(async () => {
					const form = document.querySelector("form[name='frmPDF']");

					if( form == null ){
						let error = document.querySelector("font[color='#2A69AA'] b");

						return {
							success:false,
							error:error.innerHTML
						}

					} else {
						let str = "";
						str = "id="+form.id.value;
						str += "&op="+form.op.value;

						return {
							success:true,
							action: form.action,
							formData: {
								id:encodeURI(form.id.value),
								op:encodeURI(form.op.value),
							},
							formString: str
						}
					}

				});

				return result;
			} catch(err) {
				return {success: false}
			}
		})();

		resolve(a);
	});

	
}