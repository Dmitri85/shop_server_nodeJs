$(document).ready(function () {

    $('.productsArea').shopcart('.basket', {
        products_load_url: '/api/products',
        url_load_page_count: 4
    }
    );

});