# Turkpin JavaScript API Kütüphanesi

Turkpin JavaScript API Kütüphanesi, Turkpin'in sunduğu çeşitli API servislerine kolayca erişim sağlamak için geliştirilmiş, modern ve kullanımı kolay bir Node.js kütüphanesidir. Bu kütüphane ile oyun listesi alma, bakiye sorgulama, oyun ürünleri listeleme ve sipariş işlemleri gibi temel fonksiyonları kolayca gerçekleştirebilirsiniz.

## Özellikler

- Oyun listesi alma
- Kullanıcı bakiyesini sorgulama
- Oyun ürünlerini listeleme
- Sipariş oluşturma ve durumunu sorgulama

## Kurulum

Turkpin API kütüphanesini npm üzerinden projenize eklemek için aşağıdaki komutu kullanabilirsiniz:

```bash
npm install turkpin --save
```

# Kullanım

Kütüphaneyi projenizde kullanmaya başlamak için öncelikle bir Turkpin nesnesi oluşturmanız ve API için kullanıcı adı ve şifre ile başlatmanız gerekir. Burada ki true değeri test modu aktif etmek içindir default false gelir:

```javascript
const Turkpin = require('turkpin');
const client = new Turkpin('KULLANICI_ADI', 'SIFRE', true);
```

### Bakiye Sorgulama

Hesabınızın bakiyesini sorgulamak için balance metodunu kullanabilirsiniz:

```javascript
client.gameList().then(response => {
  console.log('Oyun Listesi:', response);
}).catch(error => {
  console.error('Bir hata oluştu:', error);
});
```

### Oyun Listesi Alma

Tüm oyunların listesini almak için gameList metodunu kullanabilirsiniz:

```javascript
client.gameList().then(response => {
  console.log('Oyun Listesi:', response);
}).catch(error => {
  console.error('Bir hata oluştu:', error);
});
```

### Oyun Ürünleri Listeleme

Belirli bir oyun için ürün listesini almak için gameProducts metodunu kullanabilirsiniz. Bu metod için oyunun ID değerini parametre olarak geçirmeniz gerekmektedir:

```javascript
client.gameProducts('OYUN_ID').then(response => {
  console.log('Ürün Listesi:', response);
}).catch(error => {
  console.error('Bir hata oluştu:', error);
});
```

### Sipariş Oluşturma

Yeni bir sipariş oluşturmak için createOrder metodunu kullanabilirsiniz. Bu işlem için oyun ID'si, ürün ID'si ve sipariş miktarı gereklidir:

```javascript
client.createOrder('OYUN_ID', 'URUN_ID', MIKTAR).then(response => {
  console.log('Sipariş Bilgisi:', response);
}).catch(error => {
  console.error('Bir hata oluştu:', error);
});
```

## Katkıda Bulunma

Projeye katkıda bulunmak istiyorsanız, lütfen öncelikle değiştirmek istediğiniz konu hakkında bir issue açın.

### Lisans

Bu proje ISC lisansı altında lisanslanmıştır. Daha fazla bilgi için LICENSE dosyasına bakın.