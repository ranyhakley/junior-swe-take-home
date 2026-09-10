/**
 * Borrowing Power Calculator Test Suite
 */


const assert = require('assert');
const { BorrowingCalculator } = require('./borrowingCalculator');

describe('Borrowing Power Calculator', () => {

  it('should calculate borrowing power for standard values', async () => {
    const calculator = new BorrowingCalculator(7.5);
    calculator.getTax = async () => 24000;
    calculator.getHEM = async () => 3100;

    const result = await calculator.calculate(120000, 2, 3000, 10000);

    assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
    assert.strictEqual(result.monthlyRepayment, 4600);
    // net monthly income 8000, HEM floor 3100, credit cards 300 -> 8000 - 31000 - 300 = 4600
  });

  it('should return zero when expenses leave nothing to repay a loan', async () => {
    const calculator = new BorrowingCalculator(7.5);
    calculator.getTax = async () => 2000;
    calculator.getHEM = async () => 1800;

    const result = await calculator.calculate(30000, 3, 4000, 5000);

    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
});