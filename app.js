tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();



let app = $('#webapp');
let guid = $("meta[name='guid']").attr("content");
let chat_id = tg.initDataUnsafe.user.id;

if(color_btn) {
	tg.MainButton.color = color_btn;
}

if(color_text_btn) {
	tg.MainButton.textColor = color_text_btn;
}



const Application = {

	getICatalog() {
		tg.BackButton.hide();
		tg.MainButton.text = 'РљРѕСЂР·РёРЅР° ';

		let dataAjax = {
			'route': 'iCart',
		};

		app.attr({
			'class': 'iCatalog',
			'data-back' : '',
			'data-btn': JSON.stringify(dataAjax),
		});

		let data = {
			guid: guid,
			chat_id: chat_id,
		};
 
		$.ajax({
			url: '/webapp/ajax/catalog',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html)

				text_main_btn = data.basketSum > 0 
						? 'РљРѕСЂР·РёРЅР° '+data.basketSum.toFixed(2)+' '+data.currency
						: 'РљРѕСЂР·РёРЅР°';
				tg.MainButton.text = text_main_btn;
				tg.MainButton.show(function() {});
				getNavICatalog();
				
				let _scroll = app.attr('data-scroll');
				$('html,body').stop().animate({ scrollTop: _scroll }, 1);
  				//e.preventDefault();

			},
			error: function(e) {
				console.log('error get iCatalog');
			}
		});
 
		

		function getNavICatalog() {
			flkty = new Flickity( '.main-gallery', {
			   cellAlign: 'center',
			   contain: true,
			   prevNextButtons: false,
			   pageDots: false,
			   dragThreshold: 10,
			   accessibility: false,
			});
		}

		function getCurrentICatalogNav() {
			$('.categoryElem').each(function(i, elem) {
				if(getActiveICatalogNav('#'+$(this).attr('id'))) {
					
					if(flkty.selectedIndex != i) {
						let current = $(this).attr('id');
						delActiveICatalogNav();
						$('.navigation a[href="#'+current+'"]').addClass('active');
						flkty.select(i);
					}
					//return false;
					
				}
 
			});
		}

		function delActiveICatalogNav() {
			$('.navigation a').each(function() {
				$(this).removeClass('active');
			})
		}


		function getActiveICatalogNav(target) {
			let w = $(window);
			let t = $(target);
			let wt = w.scrollTop(); 
			let wh = w.height()- tg.viewportHeight / 2; 
			let eh = t.outerHeight(); 
			let et = t.offset().top;
			if (wt + wh >= et && wt + wh - eh * 2 <= et + (wh - eh)){
				return true;
			} else {
				return false;    
			}
		}


		function addToCartICatalog(id_product, btnSpace) {
			let data = {
				chat_id: chat_id,
				id_product: id_product,
				guid: guid,
			};
			$.ajax({
				url: '/webapp/ajax/catalog-add-to-cart',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					console.log(data);
					btnSpace.html(data.html);
					tg.MainButton.text = 'РљРѕСЂР·РёРЅР° '+data.basketSum.toFixed(2)+' '+data.currency;
					tg.MainButton.hideProgress(function() {});
				},
				error: function() {
					console.log('error addToCartICatalog');
				}
			});
		}

		function editCartICatalog(id_cart, quantity, btnSpace) {
			let data = {
				id_cart: id_cart,
				quantity: quantity,
			};
			$.ajax({
				url: '/webapp/ajax/catalog-edit-cart',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					console.log(data);
					tg.MainButton.hideProgress(function() {});
					if(data.html != null) {
						btnSpace.html(data.html);
					}
					tg.MainButton.text = data.basketSum ? 'РљРѕСЂР·РёРЅР° '+data.basketSum.toFixed(2)+' '+data.currency : 'РљРѕСЂР·РёРЅР°';
				},
				error: function() {
					console.log('error editCartICatalog')
				}
			});
		}


		$('body').on('click', '.listAddToCart', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			let card = $(this).parents('.cardProduct');
			let id_product = $(this).attr('data-id');
			let btnSpace = $(this).parents('.btn-space');
			card.addClass('incart');

			

			
			
			addToCartICatalog(id_product, btnSpace);
		});


		$('body').on('click', '.groupBtn .listControl', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			let btn = $(this);
			let card = $(this).parents('.cardProduct');
			let action = btn.attr('data-action');
			let btnSpace = btn.parents('.btn-space');
			let id_cart = btn.parents('.groupBtn').attr('data-cart');
			var value = btn.parents('.groupBtn').find('input').val();
			
			if(action == 'plus') {
				value = Number(value) + 1;
			}
			else {
				if(Number(value) > 0) {
					value = Number(value) - 1;
				}
			}
			if(value == 0) {
				card.removeClass('incart');
			}
			else {
				btn.parents('.groupBtn').find('input').val(value);
			}


			
			editCartICatalog(id_cart, value, btnSpace);
		});


		//for getICatalogNav()
		$("body").on('click', '[href*="#"]', function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			let fixed_offset = 100;
			tg.HapticFeedback.selectionChanged(function() {});
			//$(this).addClass('active');
			$('html,body').stop().animate({ scrollTop: $(this.hash).offset().top - fixed_offset }, 100);
			//getCurrentICatalogNav();
			
		});


		$(window).scroll(function(){
			getCurrentICatalogNav();
		});



	},





	getIProuct(id) {
		tg.BackButton.show();
		tg.MainButton.hide(function() {});
		let dataAjax = {
			'route': 'iCatalog',
		}

		app.attr({
			'class' : 'iProduct',
			'data-back': JSON.stringify(dataAjax),
		})

		let data = {
			id: id,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/product',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
			},
			error: function(e) {
				console.log('error get iProduct');
			}
		});



		function addIProduct() {
			let id = $('.product').attr('data-id');
			let quantity = $('.quantity input').val();
			let price = $('#addToCart').attr('data-price');

			let variable = '';
			if($('#variable').length) {
				variable = {
					'id': $('#variable input[name="radio"]:checked').val(),
					'name': $('#variable input[name="radio"]:checked').attr('data-value'),
				};	
			}


			let attr = [];
			if($('#attr').length) {
				$('#attr input:checkbox:checked').each(function() {
					attr.push({
						'id': $(this).val(),
						'name': $(this).attr('data-value'),
					});
				});
			}


			

			let data = {
				id: id, 
				quantity: quantity, 
				price: price, 
				chat_id: chat_id, 
				variable: variable,
				attr: attr,
			};
 
			console.log(data);

			$.ajax({
				url: '/webapp/ajax/add-product',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					//console.log(data);
					route = {
						'route': 'iCatalog',
					};
					Application.route(route);
				},
				error: function(e) {
					console.log('error add product');
				}
			});

		}

		function calcPriceProduct() {
			var value = $('.quantity .input-group input').val();
			if($('#variable').length) {
				let price = $('#variable input[name="radio"]:checked').attr('data-price');
				$('.product').attr('data-price', price);
				let description = $('#variable input[name="radio"]:checked').attr('data-description');
				$('.variable_description').html(description);
			}

			price_attr = 0;
			if($('#attr').length) {
				$('#attr input:checkbox:checked').each(function() {
					price_attr = Number(price_attr) + Number($(this).attr('data-price'));
				});
				
			}
			let dataPrice = $('.product').attr('data-price');
			let currency = $('.product').attr('data-currency');

			let price = Number(dataPrice) * Number(value);
			price = Number(price_attr) * Number(value) + Number(price);
			$('#addToCart').text('Р”РѕР±Р°РІРёС‚СЊ '+price+' '+currency);
		}


		$('body').on('click', '#addToCart', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.notificationOccurred('success');
			let self = $(this);
			self.addClass("activeBtn");
			setTimeout(function(){
		  		self.removeClass("activeBtn");
			}, 200);
			addIProduct();
		})


		$('body').on('click', '.quantity .input-group button', function(e) {
			e.stopImmediatePropagation();
			let self = $(this);
			
			let action = $(this).attr('data-action');
			let value = $('.quantity .input-group input').val();
			if(action == 'plus') {
				tg.HapticFeedback.selectionChanged(function() {});
				value = Number(value) + 1;
			}
			else {
				if(Number(value) > 1) {
					tg.HapticFeedback.selectionChanged(function() {});
					value = Number(value) - 1;
				}
				else {
					tg.HapticFeedback.notificationOccurred('error');
				}
			}
			self.addClass("activeBtn");
			setTimeout(function(){
		  		self.removeClass("activeBtn");
			}, 200);
			$('.quantity .input-group input').val(value);
			calcPriceProduct();
		});
		calcPriceProduct();
		$('body').on('change', '#variable input', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			calcPriceProduct();
		});

		$('body').on('change', '#attr input', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			calcPriceProduct();
		});
	},



	repeatOrder(id) {
		let data = {
			guid: guid,
			chat_id: chat_id,
			id: id,
		};

		$.ajax({
			url: '/webapp/ajax/repeat',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});


	},


	getICart() {
		tg.BackButton.show();
		tg.MainButton.hide();
		tg.MainButton.text = 'РћС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р·';
		let dataAjax = {
			'route': 'iCatalog',
		}
		var dataAjaxBtn = {
			'route': 'iOrder',
		}

		app.attr({
			'class' : 'iCart',
			'data-back': JSON.stringify(dataAjax),
			'data-btn': JSON.stringify(dataAjaxBtn),
		})

		let data = {
			guid: guid,
			chat_id: chat_id,
		};


		$.ajax({
			url: '/webapp/ajax/cart',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				console.log(data.time);
				app.html(data.html);
				if(data.count != 0 && data.time) {
					tg.MainButton.show();
				}
				
				if(data.show_notofication) {
					$('.notification_cart').removeClass('d-none');
					tg.MainButton.hide();
				}


				
			},
			error: function(e) {
				console.log('error add product');
			}
		});


		function editCartICart(id_cart, value, card) {
			$.ajax({
				url: '/webapp/ajax/edit-cart',
				method: 'post',
				dataType: 'json',
				data: {
					id_cart: id_cart,
					value: value,
					chat_id: chat_id,
					guid: guid,
				},
				success: function(data){
					if(data.totalPrice == null) {
						app.html('<div class="alert-icon"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M27.2157 0.291034C21.0326 1.59672 16.3098 7.4918 15.8852 14.4338L15.7849 16.0741L13.1116 16.1276C10.6232 16.1775 10.3762 16.2104 9.53896 16.6038C8.40448 17.1368 7.52794 18.0092 7.02832 19.1026C6.54754 20.1549 6.58071 19.7454 5.58791 36.8682C4.82054 50.1031 4.81329 50.3151 5.08314 51.6285C5.91332 55.6696 9.07912 58.898 13.0352 59.7376C14.6868 60.0883 45.3148 60.087 46.9879 59.7363C50.8988 58.9164 54.0917 55.6572 54.9162 51.643C55.1814 50.3525 55.1725 50.0768 54.4944 38.4152C53.3858 19.352 53.4473 20.1381 52.9851 19.1266C52.475 18.0105 51.6053 17.1402 50.4635 16.6038C49.6262 16.2104 49.3792 16.1775 46.8908 16.1276L44.2175 16.0741L44.1172 14.4338C43.5474 5.1158 35.6522 -1.49069 27.2157 0.291034ZM32.1749 2.79125C32.7948 2.92095 33.9886 3.3665 34.828 3.78172C37.3979 5.05272 39.6079 7.57988 40.7012 10.4976C41.1749 11.7616 41.594 13.9854 41.594 15.2344V16.1005H30.0012H18.4084V15.2344C18.4084 11.707 20.0509 7.92719 22.619 5.54522C25.2363 3.11743 28.8092 2.08776 32.1749 2.79125ZM15.8322 20.5439C15.8322 22.3063 15.8535 22.4278 16.2275 22.8023C16.4766 23.0521 16.8067 23.1984 17.1203 23.1984C17.434 23.1984 17.7641 23.0521 18.0131 22.8023C18.3872 22.4278 18.4084 22.3063 18.4084 20.5439V18.6816H30.0012H41.594V20.5439C41.594 22.3063 41.6153 22.4278 41.9893 22.8023C42.2384 23.0521 42.5684 23.1984 42.8821 23.1984C43.1957 23.1984 43.5258 23.0521 43.7749 22.8023C44.1493 22.4275 44.1702 22.3071 44.1702 20.533V18.6593L46.7193 18.7108C49.2118 18.7611 49.2812 18.7721 49.8445 19.2031C50.1913 19.4683 50.52 19.9182 50.6699 20.3323C50.8584 20.8537 51.1231 24.5547 51.761 35.5888C52.4985 48.3432 52.5779 50.2799 52.3998 51.1444C51.8081 54.0145 49.5259 56.402 46.6591 57.1501C45.2348 57.5218 14.7676 57.5218 13.3433 57.1501C11.2111 56.5938 9.16606 54.9451 8.23896 53.0356C7.31604 51.1344 7.31589 51.5966 8.24138 35.5888C9.10697 20.6165 9.16284 20.0531 9.8407 19.4385C10.5685 18.7785 11.023 18.6835 13.4573 18.6825L15.8322 18.6816V20.5439Z" fill=""/></svg><span>Р’Р°С€Р° РєРѕСЂР·РёРЅР° РїСѓСЃС‚Р°</span></div>');
					}
					else {
						card.find('.price span').html(data.elem.price);
						if(data.show_notofication) {
							$('.notification_cart').removeClass('d-none');
							tg.MainButton.hide();
							
						} else {
							$('.notification_cart').addClass('d-none');
							if(data.time) {
								tg.MainButton.show();
							}
							
						}
					}
					console.log(data);
				},
				error: function(e) {
					console.log('error edit cart');
				}
			});
		}



		$('body').on('click', '.groupBtnBasket .listControl', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			let btn = $(this);
			let card = $(this).parents('.elemList');
			let id = card.attr('data-cart');
			let action = btn.attr('data-action');
			
			let id_cart = card.attr('data-cart');
			var value = btn.parents('.groupBtnBasket').find('input').val();
			
			if(action == 'plus') {
				value = Number(value) + 1;
			}
			else {
				value = Number(value) - 1;
				if(value == 0) {
					card.fadeOut(300);
					$('.supportElemList[data-cart="'+id+'"]').fadeOut(300);
				}
			}
			btn.parents('.groupBtnBasket').find('input').val(value);
			editCartICart(id_cart, value, card);
		});


	},


	getIOrder() {
		tg.BackButton.show();
		tg.MainButton.show(function() {});
		tg.MainButton.text = 'РџСЂРѕРґРѕР»Р¶РёС‚СЊ';
		let dataAjax = {
			'route': 'iCart',
		}

		app.attr({
			'class' : 'iOrder',
			'data-back': JSON.stringify(dataAjax),
		})


		let data = {
			guid: guid,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/order',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				methodPayments = data.methodPayments;
				$('#productPrice').html(data.productPrice);
				$('#totalPriceOrder span').html(data.productPrice);
				console.log(data);
				getPayments();
				setAttr();
			},
			error: function(e) {
				console.log('error add product');
			}
		});

		function setAttr() {
			let payment = $('#payment input[name="payment"]:checked').val();
			if(payment == 1) {
				newDataAjaxBtn = {
					'route': 'iPay',
				}
			}
			else {
				newDataAjaxBtn = {
					'route': 'iCreate',
				}
			}
			$('input').each(function() {
				$(this).removeClass('validateError');
			})
			app.attr('data-btn', JSON.stringify(newDataAjaxBtn));

		}

		function getPayments() {
			let shipping = $('#shipping input[name="shipping"]:checked').val();
			$('#payment').html('');
			$.each(methodPayments[shipping], function(i, elem) {
				var html = `<div class="form_radio_btn`;
						if(methodPayments[shipping].length == 1) {
							html = html+` form_radio_btn_one `;
						}
					html = html +`">
						<input id="`+elem.id+`" type="radio" name="payment"`; 
							if(i==0) {
								html = html+` checked `;
							}
						html = html + `value="`+elem.id+`">
						<label for="`+elem.id+`">`+elem.name+`</label>
					</div>`;
				$('#payment').append(html);
			});

			if(shipping == 'Shipping') {
				$('#addres').removeClass('d-none');
				$('#addresPrice').removeClass('d-none');
				$('#comment input').attr('placeholder', 'Р’Р°С€ РєРѕРјРјРµРЅС‚Р°СЂРёР№: РЅР°РїСЂРёРјРµСЂ, РїСЂРёР±РѕСЂС‹ РЅР° 3С… С‡РµР»РѕРІРµРє')
			}
			else if(shipping == 'Place') {
				if(!$('#addres').hasClass('d-none')) {
					$('#addres').addClass('d-none');
				}
				$('#comment input').attr('placeholder', 'РЈРєР°Р¶РёС‚Рµ РЅРѕРјРµСЂ СЃС‚РѕР»РёРєР°')
			}
			else {
				if(!$('#addres').hasClass('d-none')) {
					$('#addres').addClass('d-none');
				}
				if(!$('#addresPrice').hasClass('d-none')) {
					$('#addresPrice').addClass('d-none');
				}
				$('#comment input').attr('placeholder', 'Р’Р°С€ РєРѕРјРјРµРЅС‚Р°СЂРёР№: РЅР°РїСЂРёРјРµСЂ, РїСЂРёР±РѕСЂС‹ РЅР° 3С… С‡РµР»РѕРІРµРє')
				
			}
			setAttr();

		}

		function getAddres(addres) {
			let data = {
				guid: guid,
				addres: addres
			};
			$.ajax({
				url: '/webapp/ajax/get-addres',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					$('#addres input').val(data.addres);

					if(!data.shipping.result) {
						$('#addres .notificationInput').html('<span class="error">'+data.shipping.message+'</span>');
						tg.MainButton.hide(function() {});
						$('#addres').attr('data-coordinate', '');

						$('#addresPrice span').html('0 '+data.currency);
						$('#addresPrice').attr('data-price', 0);
						$('#priceShipping').html('-');

					}
					else {
						$('#addres .notificationInput').html('');
						tg.MainButton.show(function() {});
						$('#addres').attr('data-coordinate', data.coordinates);
						if(data.price != '0') {
							$('#addresPrice span').html(data.price+' '+data.currency);
							$('#addresPrice').attr('data-price',data.price);
							$('#priceShipping').html(data.price+' '+data.currency);
						}
						else {
							$('#addresPrice span').html('0 '+data.currency);
							$('#addresPrice').attr('data-price',0);
							$('#priceShipping').html('Р‘РµСЃРїР»Р°С‚РЅРѕ');
						}
						
					}


					calcTotalOrderPrice();

					console.log(data);
				},
				error: function(e) {
					console.log('error addres');
				}
			});
		}


		function calcTotalOrderPrice() {
			let discount_sum = 0;
			let order_sum = $('#productPrice').text();
			let delivery_sum = $('#addresPrice').attr('data-price');
			discount_sum = $('#bonusPrice').attr('data-price');
			order_sum = order_sum.split(' ');
			// console.log('====')
			console.log(order_sum)
			console.log(delivery_sum)
			console.log(discount_sum)
			let total = Number(order_sum[0]) + Number(delivery_sum) - Number(discount_sum);
			
			
			$('#totalPriceOrder span').html(total+order_sum[1]);
		}


		$('body').on('change', '#shipping input', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			getPayments();
			
			$('#addresPrice span').html('-');
			$('#addresPrice').attr('data-price',0);
			$('#addres input').val('');
			$('#addres').attr('data-coordinate', '');
			$('#priceShipping').html($('#priceShipping').attr('data-value'));
			tg.MainButton.show(function() {});
			
			calcTotalOrderPrice();

		});

		$('body').on('change', '#payment input', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			setAttr();
		});

		$('body').on('change', '#bonus input', function(e) {
			e.stopImmediatePropagation();
			tg.HapticFeedback.selectionChanged(function() {});
			setAttr();

			if($(this).is(':checked')) {
				var bonus = $(this).val();
				var currency = $(this).attr('data-currency');
				console.log(bonus);
				$('#bonusPrice span').html(bonus+' '+currency);
				$('#bonusPrice').attr('data-price', bonus);
			}
			else {
				$('#bonusPrice span').html('-');
				$('#bonusPrice').attr('data-price', 0);
			}

			calcTotalOrderPrice();

		});


		$('body').on('focus', 'input', function() {
			$(this).removeClass('validateError');
		})

		$('body').on('focus', '#addres input', function() {
			$('#addres .notificationInput').html('');
		});

		$('body').on('blur', '#addres input', function() {
			let addres = $(this).val();
			getAddres(addres);
			console.log(addres);
		});
		


		
	},


	


	getIPolicy() {
		tg.BackButton.show();
		tg.MainButton.hide(function() {});
		//tg.MainButton.text = 'РџСЂРѕРґРѕР»Р¶РёС‚СЊ';
		let dataAjax = {
			'route': 'iOrder',
		}

		app.attr({
			'class' : 'iPolicy',
			'data-back': JSON.stringify(dataAjax),
		})


		let data = {
			guid: guid,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/policy',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});
	},

	getIProfile() {
		//tg.BackButton.show();
		tg.MainButton.hide(function() {});
		//tg.MainButton.text = 'РџСЂРѕРґРѕР»Р¶РёС‚СЊ';
		let dataAjax = {
			'route': 'iCatalog',
		}

		app.attr({
			'class' : 'iProfile',
			'data-back': JSON.stringify(dataAjax),
		});

		let data = {
			guid: guid,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/profile',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});

	},


	getIContact() {

		let dataBtn = {
			'route': 'call',
		}

		tg.BackButton.hide();
		tg.MainButton.hide(function() {});
		//tg.MainButton.text = 'РџРѕР·РІРѕРЅРёС‚СЊ';
		let dataAjax = {
			'route': 'iCatalog',
		}

		app.attr({
			'class' : 'iContact',
			'data-back': JSON.stringify(dataAjax),
			'data-btn': JSON.stringify(dataBtn),
		});

		let data = {
			guid: guid,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/contact',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				//tg.MainButton.show();
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});

	},

	getIOrders() {
		//tg.BackButton.show();
		tg.MainButton.hide(function() {});
		//tg.MainButton.text = 'Р’С‹Р·РІР°С‚СЊ С‚Р°РєСЃРё';
		let dataAjax = {
			'route': 'iCatalog',
		}
		app.attr({
			'class' : 'iOrders',
			'data-back': JSON.stringify(dataAjax),
		});
		let data = {
			guid: guid,
			chat_id: chat_id,
		};
		$.ajax({
			url: '/webapp/ajax/orders',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});
	},

	getIBooking() {
		tg.BackButton.show();
		tg.MainButton.hide(function() {});
		//tg.MainButton.text = 'Р’С‹Р·РІР°С‚СЊ С‚Р°РєСЃРё';
		let dataAjax = {
			'route': 'iCatalog',
		}



		app.attr({
			'class' : 'iBooking',
			'data-back': JSON.stringify(dataAjax),
		});

		let data = {
			guid: guid,
			chat_id: chat_id,
		};

		$.ajax({
			url: '/webapp/ajax/booking',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
				getNavICatalog();
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});


		function getNavICatalog() {
			flkty = new Flickity( '.main-gallery', {
			   cellAlign: 'center',
			   contain: true,
			   prevNextButtons: false,
			   pageDots: false,
			   dragThreshold: 10,
			   accessibility: false,
			});

		}


		

	},

	getITable() {
		tg.BackButton.show();
		tg.MainButton.show(function() {});

		let dataAjax = {
			'route': 'iBooking',
		}

		app.attr({
			'class' : 'iTable',
			'data-back': JSON.stringify(dataAjax),
		});

		let data = {
			guid: guid,
			chat_id: chat_id,
		};


		$.ajax({
			url: '/webapp/ajax/table',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				app.html(data.html);
			},
			error: function(e) {
				console.log('error add product');
			}
		});



		tg.MainButton.text = 'Р—Р°Р±СЂРѕРЅРёСЂРѕРІР°С‚СЊ';




	},


	getIRating() {
		//tg.BackButton.show(); 
		tg.MainButton.show(function() {});
		tg.MainButton.text = 'Р—Р°РІРµСЂС€РёС‚СЊ';
		let dataAjax = {
			'route': 'iCatalog',
		}

		let dataBtn = {
			'route': 'iRatingSend',
		}

		app.attr({
			'class' : 'iRating',
			'data-back': JSON.stringify(dataAjax),
			'data-btn': JSON.stringify(dataBtn),
		});


		let data = {
			guid: guid,
			chat_id: chat_id,
			id: app.attr('data-id'),
		};

		$.ajax({
			url: '/webapp/ajax/rating',
			method: 'post',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				app.html('<div class="preloader"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M36 50A14 14 0 0 0 64 50A14 15.3 0 0 1 36 50" fill="#e15b64" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50.65;360 50 50.65"></animateTransform></path></svg></div>');
			},
			success: function(data){
				if(!data.result) {
					tg.MainButton.hide(function() {});
				}
				app.html(data.html);
				
			},
			error: function(e) {
				console.log('error add product');
			}
		});


		$('body').on('click', 'button', function() {
			tg.HapticFeedback.selectionChanged(function() {});

			$(this).parents('.groupBtnBasket').find('button').each(function() {
				$(this).removeClass('active');
			})
			$(this).addClass('active');
		})
	},

	getIRatingSend() {
		let array = [];
		$('.elemList').each(function(i, elem) {
			let rating = $(this).find('.active').attr('data-rating');
			if(rating) {
				array.push({
					'id': $(this).attr('data-id'),
					'value': rating,
				})
			}
			
		});
		console.log(array);
		let data = {
			rating: array,
			guid: guid,
			chat_id: chat_id,
			review: $('textarea').val(),

		};
		$.ajax({
			url: '/webapp/ajax/set-rating',
			method: 'post',
			dataType: 'json',
			data: data,
			success: function(data){
				tg.close();
			},
			error: function(e) {
				tg.showAlert('РћС€РёР±РєР°');
			}
		});

	},


	createOrder() {
		
		let data = {
			guid: guid,
			chat_id: chat_id,
			payment: $('#payment input[name="payment"]:checked').val(),
			shipping: $('#shipping input[name="shipping"]:checked').attr('data-value'),
			phone: $('#phone input').val(),
			addres: $('#addres input').val(),
			comment: $('#comment input').val(),
			coordinates: $('#addres').attr('data-coordinate'),
			discount: $('#bonus input:checked').val() ? $('#bonus input:checked').val() : 0,
			shippingPrice: $('#addresPrice').attr('data-price'),
		};
		if(Application.validate(data)) {
			$.ajax({
				url: '/webapp/ajax/create-order',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					if(data) {
						tg.close();
					}
					
				},
				error: function(e) {
					console.log(e);
				}
			});
		}
		else {
			tg.HapticFeedback.notificationOccurred('error');
		}	
	},


	createInvoice() {
		let data = {
			guid: guid,
			chat_id: chat_id,
			payment: $('#payment input[name="payment"]:checked').val(),
			shipping: $('#shipping input[name="shipping"]:checked').attr('data-value'),
			phone: $('#phone input').val(),
			addres: $('#addres input').val(),
			comment: $('#comment input').val(),
			coordinates: $('#addres').attr('data-coordinate'),
			discount: $('#bonus input:checked').val() ? $('#bonus input:checked').val() : 0,
			shippingPrice: $('#addresPrice').attr('data-price'),
		};
		if(Application.validate(data)) {
			$.ajax({
				url: '/webapp/ajax/create-invoice',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					if(data && data.ok) {
						console.log('РћС‚РІРµС‚ РѕРїР»Р°С‚С‹: '); 
						console.log(data);
						tg.openInvoice(data.result, function(e) {

							switch(e) {
								case 'paid':
									tg.close();
									break;

								case 'cancelled':
									removeOder();
									break;

								case 'failed':
									alert('РћС€РёР±РєР°!');
									removeOder();
									break;

								case 'pending':
									break;
							}
							console.log(e);
						})
					} else {
						console.log(data);
					}
				},
				error: function(e) {
					console.log('error invoice');
				}
			});
		}
		else {
			tg.HapticFeedback.notificationOccurred('error');
		}

		function removeOder() {
			$.ajax({
				url: '/webapp/ajax/remove-order',
				method: 'post',
				dataType: 'json',
				data: data,
				success: function(data){
					console.log(data);
				},
				error: function(e) {
					console.log('error invoice');
				}
			});
		}


	},

	validate(data) {
		let method = data.shipping == 1 ? 'shipping' : 'pickup';
		var validate = true;
		$.each(Application.rules(), function(i, elem) {
			if(elem.required[method]) {
				if(data[elem.name].length < 1) {
					validate = false;
					console.log(elem.name+' РЅРµ Р·Р°РїРѕР»РЅРµРЅРѕ!');

					$('#'+elem.name+' input').addClass('validateError');
				}
			}
		});

		return validate;
	},

	rules() {
		return rules = [
			{
				'name': 'phone',
				'required': {
					'shipping': true,
					'pickup': true,
				}
			},
			{
				'name': 'addres',
				'required': {
					'shipping': true,
					'pickup': false,
				}
			},
			{
				'name': 'comment',
				'required': {
					'shipping': false,
					'pickup': false,
				}
			}
		]
	},

	

	route(data) {
		tg.MainButton.enable();


		switch(data.route) {

			case 'iCatalog':
				app.html('');
				Application.getICatalog();
				break;

			case 'iStory':
				app.html('');
				Application.getIStory(data.id);
				break;
			
			case 'iProduct':
				app.html('');
				Application.getIProuct(data.id);
				break;

			case 'iCart':
				app.html('');
				console.log(data);
				try {
					if(data.action == 'repeat') {
						Application.repeatOrder(data.id);
					}
				} catch(e) {}
				
				Application.getICart();
				break;

			case 'iRepeat':
				app.html('');
				Application.getICart();
				break;

			case 'iOrder':
				app.html('');
				Application.getIOrder();
				break;

			case 'iPolicy':
				app.html('');
				Application.getIPolicy();
				break;

			case 'iCreate':
				Application.createOrder();
				break;

			case 'iPay':
				Application.createInvoice();
				break;

			case 'iProfile':
				app.html('');
				Application.getIProfile();
				break;

			case 'iContact':
				app.html('');
				Application.getIContact();
				break;

			case 'iRating':
				app.html('');
				Application.getIRating();
				break;

			case 'iRatingSend':
				Application.getIRatingSend();
				break;

			case 'iOrders':
				app.html('');
				Application.getIOrders();
				break;

			case 'iBooking':
				app.html('');
				Application.getIBooking();
				break;

			case 'iTable':
				app.html('');
				Application.getITable();
				break;
		}
	}

};

function init() {

	var route = app.attr('data-route');

	switch(route) {
		case 'iCatalog':
			app.html('');
			Application.getICatalog();
			break;
		case 'iProfile':
			app.html('');
			Application.getIProfile();
			break;
		case 'iContact':
			app.html('');
			Application.getIContact();
			break;
		case 'iOrders':
			app.html('');
			Application.getIOrders();
			break;
		case 'iBooking':
			app.html('');
			Application.getIBooking();
			break;
		case 'iRating':
			app.html('');
			Application.getIRating();
			break;
		default:
			app.html('');
			Application.getICatalog();
			break;
	}

	console.log(route);
	

	
}


$(window).on('load', function(){
	init();
});




$('body').on('click', '.ajaxLink', function() {
	let data = JSON.parse($(this).attr('data-ajax'));
	let parent = $(this).parents('.cardProduct');
	let _scroll = $(window).scrollTop();
	app.attr('data-scroll', _scroll);
	tg.HapticFeedback.impactOccurred('soft');
	console.log(data);
	Application.route(data);
});



tg.BackButton.onClick(function() {
	let data = JSON.parse(app.attr('data-back'));
	tg.HapticFeedback.impactOccurred('soft');
	Application.route(data);
});


tg.MainButton.onClick(function() {
	tg.MainButton.disable();
	

	//e.stopImmediatePropagation();
	let data = JSON.parse(app.attr('data-btn'));
	tg.HapticFeedback.impactOccurred('soft');

	if(data.route == 'call') {
		let number = $('#number').attr('data-number');
		window.open('tel:'+number, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes')
	}

	Application.route(data);
})