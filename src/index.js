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
                return {
                    error: true,
                    errorCode: result.APIResponse.params.HATA_NO,
                    errorMessage: result.APIResponse.params.HATA_ACIKLAMA
                };
            }
    
            const balanceInfo = {
                balance: result.APIResponse.params.balance,
                credit: result.APIResponse.params.credit,
                bonus: result.APIResponse.params.bonus,
                spending: result.APIResponse.params.spending
            };
    
            return {
                error: false,
                data: balanceInfo
            };
        } catch (error) {
            console.error(`Error fetching balance: ${error}`);
            return {
                error: true,
                errorCode: "NETWORK_ERROR",
                errorMessage: "Network error or API is not reachable"
            };
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
                return {
                    error: true,
                    errorCode: result.APIResponse.params.error,
                    errorMessage: result.APIResponse.params.error_desc
                };
            }
    
            const games = result.APIResponse.params.oyunListesi.oyun.map(game => ({
                id: game.id,
                name: game.name
            }));
    
            return {
                error: false,
                data: games
            };
        } catch (error) {
            console.error(`Error fetching game list: ${error}`);
            return {
                error: true,
                errorCode: "NETWORK_ERROR",
                errorMessage: "Network error or API is not reachable"
            };
        }
    }    

    async gameProducts(gameId) {
        if (!gameId) {
            return {
                error: true,
                errorCode: 'MISSING_PARAMETER',
                errorMessage: 'Game id is required'
            };
        }
    
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
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            const result = await this.xmlParser.parseStringPromise(response.data);
    
            if (result.APIResponse.params.error != '000') {
                return {
                    error: true,
                    errorCode: result.APIResponse.params.error,
                    errorMessage: result.APIResponse.params.error_desc
                };
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
    
            return {
                error: false,
                data: products
            };
        } catch (error) {
            console.error(`Error fetching game products: ${error}`);
            return {
                error: true,
                errorCode: "NETWORK_ERROR",
                errorMessage: "Network error or API is not reachable"
            };
        }
    }    

    async createOrder(gameID, productID, quantity, character = null) {
        if (!gameID) return { error: true, errorMessage: 'Game id is required' };
        if (!productID) return { error: true, errorMessage: 'Product id is required' };
        if (!quantity) return { error: true, errorMessage: 'Quantity is required' };
        if (quantity < 1) return { error: true, errorMessage: 'Quantity must be greater than 0' };
    
        let requestXML = this.xmlBuilder.buildObject({
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
                return { error: true, errorCode: result.APIResponse.params.HATA_NO, errorMessage: result.APIResponse.params.HATA_ACIKLAMA };
            }
    
            let orders = [];

            if (Array.isArray(result.APIResponse.params.epin_list.epin)) {
                orders = result.APIResponse.params.epin_list.epin.map(order => ({
                    code: order.code,
                    description: order.desc
                }));
            } else {
                orders = [{
                    code: result.APIResponse.params.epin_list.epin.code,
                    description: result.APIResponse.params.epin_list.epin.desc
                }];
            }
    
            return { error: false, data: orders };
        } catch (error) {
            console.error(`Error creating order: ${error}`);
            return { error: true, errorMessage: 'An error occurred while creating the order' };
        }
    }

    async orderStatus(orderID) {
        if (!orderID) {
            return { error: true, errorMessage: 'Order id is required' };
        }
    
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
                return { error: true, errorCode: result.APIResponse.params.DURUM_KODU, errorMessage: result.APIResponse.params.DURUM_ACIKLAMA };
            }
    
            const orderStatus = {
                status: result.APIResponse.params.SIPARIS_DURUMU,
                description: result.APIResponse.params.SIPARIS_DURUMU_ACIKLAMA,
                lastUpdate: result.APIResponse.params.KONTROL_TARIHI
            };
    
            return { error: false, data: orderStatus };
        } catch (error) {
            console.error(`Error fetching order status: ${error}`);
            return { error: true, errorMessage: 'An error occurred while fetching the order status' };
        }
    }

}

module.exports = Turkpin;