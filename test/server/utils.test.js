const {
  getPriceMessage,
  getAddedMessage,
  getRemovedMessage,
  sendNotification,
} = require('../../server/utils.js');

describe('Server Utils', () => {
  describe('getRemovedMessage', () => {
    it('should provide a singular message when handling one car', () => {
      const cars = [1];
      expect(getRemovedMessage(cars)).toBe(
        'A Model Y has been removed from inventory'
      );
    });

    it('should provide a plural message when handling multiple cars', () => {
      const cars = [1, 2, 3];
      expect(getRemovedMessage(cars)).toBe(
        '3 Model Ys have been removed from inventory'
      );
    });
  });

  describe('getAddedMessage', () => {
    it('should provide a singular message when handling one car', () => {
      const cars = [1];
      expect(getAddedMessage(cars)).toBe(
        'A Model Y has been added to the inventory'
      );
    });
    it('should provide a plural message when handling multiple cars', () => {
      const cars = [1, 2];
      expect(getAddedMessage(cars)).toBe(
        '2 Model Ys have been added to the inventory'
      );
    });
  });

  describe('getPriceMessage', () => {
    it('should provide a message showing the change from the old price to the new price', () => {
      let lastModelYPrice = 1500;
      let newModelYPrice = 3000;
      expect(getPriceMessage(lastModelYPrice, newModelYPrice)).toBe(
        'A Model Y changed price from $1500 to $3000'
      );
      lastModelYPrice = '1500';
      newModelYPrice = '3000';
      expect(getPriceMessage(lastModelYPrice, newModelYPrice)).toBe(
        'A Model Y changed price from $1500 to $3000'
      );
    });
  });
});
