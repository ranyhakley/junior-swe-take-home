/**
 * Borrowing Power Calculator Test Suite
 * Start the server first:  npm run api
 */

const assert = require('assert');
const { BorrowingCalculator } = require('./borrowingCalculator');

describe('Borrowing Power Calculator', () => {

  describe('getTax', () => {

    it('should return the tax payable for an income', async () => {
      const calculator = new BorrowingCalculator();

      assert.strictEqual(await calculator.getTax(50000), 4500);
    });

    it('should throw when the income is invalid', async () => {
      const calculator = new BorrowingCalculator();
      let message = null;

      try {
        await calculator.getTax(-1);
      } catch (error) {
        message = error.message;
      }

      assert.strictEqual(message, 'Tax API failed (400): Invalid income');
    });
  });

  describe('getHEM', () => {

    it('should return the HEM baseline for an income and dependents', async () => {
      const calculator = new BorrowingCalculator();

      assert.strictEqual(await calculator.getHEM(50000, 1), 2100);
    });

    it('should throw when the dependents count is invalid', async () => {
      const calculator = new BorrowingCalculator();
      let message = null;

      try {
        await calculator.getHEM(50000, -1);
      } catch (error) {
        message = error.message;
      }

      assert.strictEqual(message, 'HEM API failed (400): Invalid dependents');
    });
  });

  describe('calculate', () => {

    it('should calculate borrowing power for standard values', async () => {
      const calculator = new BorrowingCalculator(7.5);

      //test for when the server is inactive
      // calculator.getTax = async () => 24000;
      // calculator.getHEM = async () => 3100;

      const result = await calculator.calculate(120000, 2, 3000, 10000);

      assert.strictEqual(result.monthlyRepayment, 4600);
      assert.strictEqual(result.maxLoanAmount, 657881.09);
      // API tax 24000 -> net 8000/mo; HEM 3100 beats declared 3000; cards 300
    });

    it('should use declared expenses when they exceed the HEM baseline', async () => {
      const calculator = new BorrowingCalculator(7.5);

      const result = await calculator.calculate(120000, 2, 5000, 10000);

      assert.strictEqual(result.monthlyRepayment, 2700);
      // declared 5000 beats the 3100 baseline -> 8000 - 5000 - 300
    });

    it('should return zero when expenses leave nothing to repay a loan', async () => {
      const calculator = new BorrowingCalculator(7.5);

      //test for when the server is inactive
      // calculator.getTax = async () => 2000;
      // calculator.getHEM = async () => 1800;

      const result = await calculator.calculate(30000, 3, 4000, 5000);

      assert.strictEqual(result.maxLoanAmount, 0);
      assert.strictEqual(result.monthlyRepayment, 0);
      // net 2375/mo, expenses 4000, cards 150 -> nothing left to service a loan
    });

    it('should add the safety buffer to the interest rate by default', () => {
      const calculator = new BorrowingCalculator();

      assert.strictEqual(calculator.assessmentRate, 10);
    });
  });
});