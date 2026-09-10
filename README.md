# Borrowing Power Calculator

Works out how much someone could borrow on a 30 year home loan, based on their
income, dependents, monthly expenses and credit card limits.

Tax and HEM (Household Expenditure Measure) figures come from a local API
instead of being worked out in the code.

## What you need

Node 18 or newer, because the code uses the built-in `fetch`. I used Node
20.17.0.

## Setup

```
npm install
```

## Running it

The calculator gets its tax and HEM numbers from the API, so the API needs to be
running first. In one terminal:

```
npm run api
```

Leave that running. In a second terminal:

```
npm start
```

It asks you four questions and then prints the result:

```
Mortgage Borrowing Power Calculator
===================================
Gross Annual Income: $50000
Number of Dependents: 1
Declared Monthly Expenses: $2000
Total Credit Card Limits: $6000

--- Calculation Summary ---
Maximum Borrowing Power at 7%: $172,255.66
Assumed Monthly Mortgage Repayment: $1,511.67 over 30 years
```

## Running the tests

The tests call the API, so **start the server first**:

```
npm run api
```

Then in another terminal:

```
npm test
```

All 8 tests should pass. If you get `fetch failed` it means the server isn't
running.

## Files

`borrowingCalculator.js` | The `BorrowingCalculator` class and the console prompts |
`test_calculator.js` | The tests |
`server.js` | The API that came with the exercise |
`server.md` | The API docs that came with the exercise |

## How it works

1. Get the tax for the income from the API, take it off the income, divide by 12
   to get net monthly income.
2. Get the HEM figure from the API. Living expenses are whichever is bigger, the
   declared expenses or HEM. HEM is a floor, not something you add on, so if
   someone says they spend less than the baseline the baseline is used instead.
3. Credit cards count as 3% of the total limit per month.
4. Take the expenses and credit cards off the net monthly income. That's what's
   left to pay a mortgage with. If it's zero or less, the answer is zero.
5. Turn that monthly amount into a loan size using the present value formula
   over 360 months:

   P = M * (1 - (1 + R)^-N) / R

## Decisions I made

I used a class. The brief said it was up to me. The three functions all work
on the same thing so grouping them made sense. I put the assessment rate in the
constructor so you can make a calculator at a different rate without changing
any of the methods:

```js
const standard = new BorrowingCalculator();      // 7% + 3% buffer = 10%
const stressed = new BorrowingCalculator(12.5);
```

The default rate is 10%, not 7%. Banks add a buffer when they check if you
can afford a loan, so 7% is the rate you'd actually get and 10% is what the
calculation uses. The console prints 7% because that's the rate the customer
cares about. It looks a bit odd until you know why, so I've written it down here.

The token is just a constant in the file. In a real app it would come from an 
environment variable and wouldn't be committed.

## How I tested it

The tests call the real API instead of faking it.

I tried it the other way first, replacing `getTax` and `getHEM` with fake
functions that returned fixed numbers. It worked, but the numbers I was checking
against were numbers I'd made up myself, so the test was really only checking my
own maths. Since the tax and HEM figures live on the server, I thought it made
more sense to check against what the server actually returns.

I tested the errors the same way. `getTax(-1)` sends a real invalid request and
the test checks the error message that comes back from the real 400 response.

What the 8 tests cover:

- `getTax` working, and `getTax` failing on a bad income
- `getHEM` working, and `getHEM` failing on a bad dependents number
- `calculate` for a normal case
- `calculate` when declared expenses are higher than HEM, and when HEM is higher
  (so both sides of that comparison get checked)
- `calculate` when there's nothing left over and it should return zero
- the constructor adding the 3% buffer by default

## Assumptions

- **The old test numbers were out of date.** The placeholder functions returned
  different figures to the API, so the expected values had to change. The
  standard case went from $4,200 a month to $4,600. The server is where the
  numbers come from now, so the tests follow it.
- **I left Gen's constants alone** — 360 months, 7% rate, 3% buffer, 3% of card
  limits. They looked intentional and changing them would have made it harder to
  compare with what I started with.
- **The API caps dependents at 3** (it says so in `server.md`), so I didn't do
  that check again in the calculator.
- **I assumed the inputs are sensible.** The console doesn't check what you type,
  so entering letters gives you `NaN`. Negative numbers get rejected by the API
  and that error shows up properly.

## Things I know could be better

- **The tax and HEM calls happen one after the other.** They don't depend on each
  other so they could both be sent at once and it'd be twice as fast. With two
  calls to a local server it doesn't really matter, but it would with more.
- **No input validation on the console prompts.** Didn't seem in scope, and it
  feels like something that belongs in a UI rather than in the calculator.
- **The console code is in the same file as the class.** I could move it to its
  own file so `borrowingCalculator.js` is just the calculator and nothing else.
  Worth doing if this got any bigger.