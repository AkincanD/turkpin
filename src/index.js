const axios = require('axios');
const xml2js = require('xml2js');

class Turkpin {
    constructor(username, password, testMode = false) {
        this.username = testMode ? 'api@turkpin.net' : username;
        this.password = testMode ? '@.nwjExrK4U5b_S@y' : password;
        this.testMode = testMode;
        this.baseUrl = testMode ? 'https://www.turkpin.net/api.php' : 'https://www.turkpin.com/api.php';

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        this.xmlBuilder = new xml2js.Builder({
            headless: true
        });
        this.xmlParser = new xml2js.Parser({ explicitArray: false });
    }

    async balance() {
        const requestXML = this.xmlBuilder.buildObject({
            APIRequest: {
                params: {
                    cmd: 'balance',
                    username: this.username,
                    password: this.password,
                }
            }
        });

        try {
            const formData = new FormData();
            formData.append('DATA', requestXML);

            const response = await axios.post(this.baseUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = await this.xmlParser.parseStringPromise(response.data);

            if (result.APIResponse.params.HATA_NO != '000') {
                throw new Error(result.APIResponse.params.HATA_ACIKLAMA);
            }

            const balanceInfo = {
                balance: result.APIResponse.params.balance,
                credit: result.APIResponse.params.credit,
                bonus: result.APIResponse.params.bonus,
                spending: result.APIResponse.params.spending
            };

            return balanceInfo;
        } catch (error) {
            console.error(`Error fetching balance: ${error}`);
            throw error;
        }
    }

    async gameList() {
        const requestXML = this.xmlBuilder.buildObject({
            APIRequest: {
                params: {
                    cmd: 'epinOyunListesi',
                    username: this.username,
                    password: this.password,
                }
            }
        });

        try {
            const formData = new FormData();
            formData.append('DATA', requestXML);

            const response = await axios.post(this.baseUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = await this.xmlParser.parseStringPromise(response.data);

            if (result.APIResponse.params.error != '000') {
                throw new Error(result.APIResponse.params.error_desc);
            }

            const games = result.APIResponse.params.oyunListesi.oyun.map(game => ({
                id: game.id,
                name: game.name
            }));

            return games;
        } catch (error) {
            console.error(`Error fetching game list: ${error}`);
            throw error;
        }
    }

    async gameProducts(gameId) {
        if (!gameId) throw new Error('Game id is required');

        const requestXML = this.xmlBuilder.buildObject({
            APIRequest: {
                params: {
                    cmd: 'epinUrunleri',
                    username: this.username,
                    password: this.password,
                    oyunKodu: gameId
                }
            }
        });

        try {
            const formData = new FormData();
            formData.append('DATA', requestXML);

            const response = await axios.post(this.baseUrl, formData, {
                headers: { 'Content-Type': 'text/xml' }
            });

            const result = await this.xmlParser.parseStringPromise(response.data);

            if (result.APIResponse.params.error != '000') {
                throw new Error(result.APIResponse.params.error_desc);
            }

            const products = result.APIResponse.params.epinUrunListesi.urun.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                taxType: product.tax_type,
                minOrder: product.min_order,
                maxOrder: product.max_order,
            }));

            return products;
        } catch (error) {
            console.error(`Error fetching game products: ${error}`);
            throw error;
        }
    }

    async createOrder(gameID, productID, quantity, character = null) {
        if (!gameID) throw new Error('Game id is required');
        if (!productID) throw new Error('Product id is required');
        if (!quantity) throw new Error('Quantity is required');
        if (quantity < 1) throw new Error('Quantity must be greater than 0');

        const requestXML = this.xmlBuilder.buildObject({
            APIRequest: {
                params: {
                    cmd: 'epinSiparisYarat',
                    username: this.username,
                    password: this.password,
                    oyunKodu: gameID,
                    urunKodu: productID,
                    adet: quantity,
                }
            }
        });

        if (character) {
            requestXML.APIRequest.params.character = character;
        }

        try {
            const formData = new FormData();
            formData.append('DATA', requestXML);

            const response = await axios.post(this.baseUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = await this.xmlParser.parseStringPromise(response.data);

            if (result.APIResponse.params.HATA_NO != '000') {
                throw new Error(result.APIResponse.params.HATA_ACIKLAMA);
            }

            const orders = result.APIResponse.params.epin_list.epin.map(order => ({
                code: order.code,
                description: order.desc
            }));

            return orders;
        } catch (error) {
            console.error(`Error creating order: ${error}`);
            throw error;
        }
    }

    async orderStatus(orderID) {
        if (!orderID) throw new Error('Order id is required');

        const requestXML = this.xmlBuilder.buildObject({
            APIRequest: {
                params: {
                    cmd: 'siparisDurumu',
                    username: this.username,
                    password: this.password,
                    siparisNo: orderID,
                }
            }
        });

        try {
            const formData = new FormData();
            formData.append('DATA', requestXML);

            const response = await axios.post(this.baseUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const result = await this.xmlParser.parseStringPromise(response.data);

            if (result.APIResponse.params.DURUM_KODU != '000') {
                throw new Error(result.APIResponse.params.DURUM_ACIKLAMA);
            }

            const order = new Map();
            order.status = result.APIResponse.params.SIPARIS_DURUMU;
            order.description = result.APIResponse.params.SIPARIS_DURUMU_ACIKLAMA;
            order.lastUpdate = result.APIResponse.params.KONTROL_TARIHI;

            return order;
        } catch (error) {
            console.error(`Error fetching order status: ${error}`);
            throw error;
        }
    }
}

module.exports = Turkpin;