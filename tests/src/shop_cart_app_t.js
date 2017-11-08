(function ($) {

    $.fn.shopcart = function (plugCart, options) {

        var settings = $.extend({
            products_load_url: '',
            products_load_json: 'json.js',
            url_load_page_count: 4,
            paypal: {
                currency_code: "ILS",
                lc: 'he_IL',
                business: "ronny@hoojima.com",
                image_url: 'http://www.experis-software.co.il/wp-content/uploads/2015/01/logo.jpg',
                cancel: 'http://www.experis-software.co.il/',
                cancel_return: 'http://www.experis-software.co.il/'
            }

        }, options);

        var loadingProcces = false;
        var InputArea = this;
        var plugCart = plugCart;
        var loadQtyFirst = 1;
        var loadQtyLast = settings.url_load_page_count;

        var shop = {
            init: function () {
                this.cartCreact();

                if (settings.products_load_url != '') {
                    this.firstload();
                    // this.callFromServer();
                    this.scrollLoad();
                } else {
                    shop.collectProducts(settings.products_load_json);
                }
                this.makeCartFix();
            },


            scrollLoad: function () {
                $(window).scroll(function () {
                    // console.log( 'scrollTop:' + $(window).scrollTop() + ' win.height:' + $(window).height() + ' document height:' + $(document).height())
                    if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                        shop.callFromServer();

                    }
                });

            },

            callFromServer: function () {
                if (loadingProcces == false) {
                    loadingProcces = true;
                    console.log(loadQtyFirst + ' ' + loadQtyLast)
                    $.post(settings.products_load_url + "/" + loadQtyFirst + '/' + loadQtyLast, { from: loadQtyFirst, to: loadQtyLast }, function (data) {
                        var products = data;
                        loadQtyFirst += settings.url_load_page_count;
                        loadQtyLast += settings.url_load_page_count;
                        shop.collectProducts(products);
                        loadingProcces = false;
                    });
                }
            },

            firstload: function () {
                if (loadQtyLast < 12) {
                    loadQtyLast = 12;
                    shop.callFromServer();
                    loadQtyFirst = 13 - settings.url_load_page_count;
                }
            },

            collectProducts: function (products) {
                for (var i = 0; i < products.length; i++) {
                    this.productsToBoard(products[i]);
                }
            },

            productsToBoard: function (product) {
                var newProduct = $('<div>', { class: 'singleProductSection' });
                newProduct.append(newProduct).append($('<img>', { src: product.image }));
                newProduct.append(newProduct).append($('<h4>').text(product.name));
                var buy_line = $('<div>', { class: 'buy_line' });
                newProduct.append(buy_line);
                buy_line.append($('<span>').text(product.price));
                buy_line.append($('<div>', { class: 'btn_add' })
                    .text('Add To Cart')
                    .data('details', product)
                    .click(shop.addToCart));
                InputArea.append(newProduct);
            },

            cartCreact: function () {
                $(plugCart).html('<h3>Cart</h3><table class="crt_all"><tr><th></th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr><tr class="final_line"><td></td><td>Total:</td><td class="all_qty">0</td><td></td><td class="all_total">0</td></tr><tr><td colspan="5"><img src="https://www.paypalobjects.com/webstatic/en_US/i/btn/png/gold-pill-paypalcheckout-34px.png" id="btn-paypal" alt="PayPal Checkout"></td></tr></table>');
                $('#btn-paypal').click(shop.sendPaymentRequest);
            },


            addToCart: function () {
                var btn = $(this);
                var productDetails = btn.data('details');
                var tr = shop.findProductInCart(productDetails.name);

                if (tr === null) {
                    shop.updateCart(productDetails);
                    shop.animationToNew(btn);
                } else {
                    shop.updateQty(tr);
                    shop.animationToexist(btn, tr);
                    // shop.cloneImage(btn,tr);
                }
            },

            findProductInCart: function (name) {

                var elementToReturn = null;

                $('.crt_all tr').each(function () {
                    var row = $(this).data('details');

                    if (row && row.name == name) {
                        elementToReturn = ($(this));
                        return false;
                    }
                });
                return elementToReturn;
            },

            updateCart: function (product) {
                var new_cart = $('<tr>', { class: 'card_product' }).data('details', product);;
                $('<td>', { class: 'delete' }).text('x').appendTo(new_cart).click(shop.deleteItem);
                $('<td>', { class: 'crt_name' }).text(product.name).appendTo(new_cart);
                var tdForInput = $('<td>', { class: 'crt_qty' }).appendTo(new_cart);
                $('<input>', { type: 'number', value: '1' }).appendTo(tdForInput);
                $('<td>', { class: 'crt_price' }).text(parseFloat(product.price)).appendTo(new_cart);
                var lineTotal = $('<td>', { class: 'line_toal' });
                lineTotal.appendTo(new_cart);
                lineTotal.text((parseFloat(lineTotal.prev().prev().children().val())) * (parseFloat(lineTotal.prev().text())));
                new_cart.hide().delay(2000).show(100);
                $('.final_line').before(new_cart);
                $('.crt_qty').children('input').change(shop.LineTotalCalc);
                $('.crt_qty').children('input').change(shop.sumQty);
                $('.crt_qty').children('input').change(shop.sumTotalPrice);
                shop.sumQty();
                shop.sumTotalPrice();
            },

            updateQty: function (trToUpdate) {
                var quantity = trToUpdate.find($('input'));
                var value = parseInt(quantity.val());
                value += 1;
                quantity.val(value);

                shop.LineTotalCalc_fromUpdate(quantity);
                shop.sumQty();
                shop.sumTotalPrice();

            },

            LineTotalCalc: function () {
                var self = $(this);
                var multVal = parseFloat($(this).val());
                self.parent().next().next().text(parseFloat(self.parent().next().text()) * multVal);
            },

            LineTotalCalc_fromUpdate: function (line) {
                var multVal = parseFloat(line.val());
                line.parent().next().next().text(parseFloat(line.parent().next().text()) * multVal);
            },

            sumQty: function () {
                var total_qty = 0;
                $('.crt_qty').children('input').each(function () {
                    total_qty += parseInt($(this).val());
                });

                $('.all_qty').text(total_qty);
            },

            sumTotalPrice: function () {
                var total_price = 0;
                $('.line_toal').each(function () {
                    total_price += parseFloat($(this).text());
                });

                var fixedTotal = total_price.toFixed(2)
                $('.all_total').text(fixedTotal);
            },

            deleteItem: function () {
                $(this).parent().hide('slow', function () {
                    $(this.remove());
                });
                shop.sumQty();
                shop.sumTotalPrice();
            },

            makeCartFix: function () {
                var cart = $(plugCart);
                var fromWindowOffset = cart.offset();
                $(window).resize(function(){
                    
                });
                $(window).scroll(function () {
                    if ($(window).scrollTop() >= 100 && $(window).width() > 500) {
                        cart.css({ position: 'fixed', top: 0, left: fromWindowOffset.left });
                    } else if ($(window).scrollTop() < 100) {
                        cart.css({ position: 'initial' });
                    }
                });
            },

            cloneImage: function (btn) {
                var productSection = btn.parent().parent();
                var image = btn.parent().parent().find('img').first();
                var imageOffset = shop.imageoffsetFind(image);
                var imageWidth = image.css('width');
                var clonedImage = image.clone();
                clonedImage.css({ position: 'absolute', width: imageWidth }).offset(imageOffset);
                clonedImage.appendTo(productSection);

                return clonedImage;
            },

            imageoffsetFind: function (image) {
                return image.offset();
            },

            cartoffsetFind: function (tr) {
                return tr.offset();
            },

            animationToexist: function (btn, tr) {
                var clonedImage = shop.cloneImage(btn);
                var trToAppendTo_offset = shop.cartoffsetFind(tr);
                var top = (trToAppendTo_offset.top + 7);
                var left = (trToAppendTo_offset.left + 35);

                clonedImage.animate(
                    { top: top, left: left, width: '10px', height: '10px', opacity: 0.2 }, 2000, function () {
                        $(this).hide();
                    }
                )

                setTimeout(function () {
                    btn.parent().parent().find('img').last().remove();
                }, 2500);

            },

            animationToNew: function (btn) {
                var clonedImage = shop.cloneImage(btn);
                var placeToAppendTo = $('.final_line');
                var placeToAppendTo_offset = placeToAppendTo.offset();
                var top = (placeToAppendTo_offset.top - 15);
                var left = (placeToAppendTo_offset.left + 35);

                clonedImage.animate(
                    { top: top, left: left, width: '35px', height: '35px' }, 2000, function () {
                        $(this).hide();
                    }
                )

                setTimeout(function () {
                    btn.parent().parent().find('img').last().remove();
                }, 2500);

            },

            sendPaymentRequest: function () {
                var paymentForm = $("<form>", { action: "https://www.paypal.com/cgi-bin/webscr", method: "post", target: "_blank" });

                paymentForm.append(shop.createHiddenInput("cmd", "_cart"));
                paymentForm.append(shop.createHiddenInput("upload", "1"));
                paymentForm.append(shop.createHiddenInput("business", settings.paypal.business));
                paymentForm.append(shop.createHiddenInput("currency_code", settings.paypal.currency_code));
                paymentForm.append(shop.createHiddenInput("lc", settings.paypal.lc));
                paymentForm.append(shop.createHiddenInput("no_note", "0"));
                paymentForm.append(shop.createHiddenInput("image_url", settings.paypal.image_url));
                paymentForm.append(shop.createHiddenInput("no_shipping", "0"));
                paymentForm.append(shop.createHiddenInput("return", settings.paypal.return));
                paymentForm.append(shop.createHiddenInput("cancel_return", settings.paypal.cancel_return));

                shop.addItems(paymentForm);

                paymentForm.appendTo($(plugCart));

                paymentForm.submit();

                paymentForm.remove();
            },

            createHiddenInput: function (name, value) {
                return $("<input>", { type: "hidden", name: name, value: value });
            },

            addItems: function (paymentForm) {
                var itemNumber = 1;
                var self = this;

                    $(plugCart).find(".card_product").each(function () {
                    self.addItemInputs(paymentForm, $(this), itemNumber);
                    itemNumber++;
                });
            },

            addItemInputs: function (paymentForm, htmlCartRowProduct, itemNumber) {
                var itemName = htmlCartRowProduct.find(".crt_name").text();
                paymentForm.append(shop.createHiddenInput("item_name_" + itemNumber, itemName));

                var itemQty = htmlCartRowProduct.find(".crt_qty:first-child").val();
                paymentForm.append(shop.createHiddenInput("quantity_" + itemNumber, itemQty));

                var itemPrice = htmlCartRowProduct.find(".crt_price").text();
                paymentForm.append(shop.createHiddenInput("amount_" + itemNumber, itemPrice));
            }


        }
        shop.init();
        return this;
    }

})(jQuery);