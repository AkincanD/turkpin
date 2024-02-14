const Turkpin = require('./src/index');

jest.mock('axios');
const axios = require('axios');

describe('Turkpin', () => {
    describe('gameList', () => {
        it('should fetch game list successfully', async () => {
            const mockResponse = {
                data: '<?xml version="1.0" encoding="utf-8"?><APIResponse><params><error>000</error><error_desc>Islem Basarili</error_desc><oyunListesi><oyun><id>1</id><name>Test Oyun 01</name></oyun></oyunListesi></params></APIResponse>'
            };
            axios.post.mockResolvedValue(mockResponse);

            const client = new Turkpin('api@turkpin.net', '@.nwjExrK4U5b_S@y', true);
            const response = await client.gameList();

            expect(response.status).toBe(true);
            expect(response.data).toEqual([{ id: '1', name: 'Test Oyun 01' }]);
        });
    });

    describe('balance', () => {
        it('should fetch balance information successfully', async () => {
            const mockResponse = {
                data: '<?xml version="1.0" encoding="utf-8"?><APIResponse><params><HATA_NO>000</HATA_NO><HATA_ACIKLAMA>Islem Basarili</HATA_ACIKLAMA><balance>100</balance><credit>50</credit><bonus>10</bonus><spending>40</spending></params></APIResponse>'
            };
            axios.post.mockResolvedValue(mockResponse);

            const client = new Turkpin('api@turkpin.net', '@.nwjExrK4U5b_S@y', true);
            const response = await client.balance();

            expect(response.status).toBe(true);
            expect(response.data).toEqual({
                balance: '100',
                credit: '50',
                bonus: '10',
                spending: '40'
            });
        });
    });
});
