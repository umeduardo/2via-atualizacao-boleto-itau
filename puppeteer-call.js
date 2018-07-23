const puppeteer = require('puppeteer');
module.exports = {
	pup1: function( type, linhaDigitavel, browserWSEndpoint){
		return new Promise(function(resolve, reject){
			let a = (async () => {
				try{
					const browser = await puppeteer.connect({browserWSEndpoint});	
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
	
					await page.waitForNavigation()
	
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
					await page.close();
					return result;				
				} catch(err) {
					await page.close();
					return {success: false}				
				}
			})();
	
			resolve(a);
		});
	
		
	}

};