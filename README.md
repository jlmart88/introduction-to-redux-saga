# Managing Application Side-Effects: An Introduction to Redux-Saga

## Introduction

As an introduction to Redux-Saga, we will be implementing a simple Cookie Clicker application.
All of the component code, as well as the Redux actions/reducers, has already been implemented for you;
leaving only the business logic (which is where Redux-Saga will come in).

Additionally, this repo contains an implementation of all of the outlined tasks, without using sagas.
You can use these as a reference to compare against your implementation of these tasks using sagas,
which should help with describing the pros/cons of using a saga-based approach to handling application
side-effects.

## Prior Knowledge

This application expects that you have worked with [React](https://reactjs.org/) and [Redux](https://redux.js.org/) before, and are familiar with the [typescript-fsa](https://github.com/aikoven/typescript-fsa) library, which is used to construct action creators and async action creators.

## App Structure

The Cookie Clicker consists of 4 major components:

- **Cookie Counter** - displays the total count of cookies
- **Big Cookie** - a cookie which, when clicked, will add one cookie to the total count
- **Bakery Store** - a store containing bakeries, which can be purchased to auto-create cookies
- **Purchased Bakeries** - a list of the current purchased bakeries which are auto-creating cookies

### File structure
- `/api` - contains a mock API for requesting bakeries to populate the bakery store
- `/components` - contains the React components for this application. These are already properly connected to Redux.
- `/no-sagas` - a fork of the application, which implements all of the tasks inside of the React components, without using sagas.
- `/redux` - contains the Redux ducks for this application
- `/redux/sagas` - contains files with unimplemented sagas, which is where all of our task work will be taking place.

## Setup

1. `npm install`
2. `npm start` to run the webpack-dev-server and open the application
    - `npm run start:no-sagas` to run the "no sagas" implementation

## Tasks

Each of these tasks can be implemented by only using the files located in `/redux/sagas`.
There is a `TODO: #<task_number>` comment in each of those files where you should write your code.

### #1: Clicking the Big Cookie

Clicking on the big cookie should result in the `app.cookieCount` incrementing by 1.
Currently, clicking on the big cookie will emit the `cookie/CLICK_COOKIE` action.
We should "listen" for the `cookie/CLICK_COOKIE` action, and then fire off `app/INCREMENT_COOKIE_COUNT` action in response. Note that the action creator for `app/INCREMENT_COOKIE_COUNT` accepts a single argument: the amount to increment by. This will allow us to implement Task #3 easier).

**Useful Effects:**
- [take](https://redux-saga.js.org/docs/api/#takepattern)
- [put](https://redux-saga.js.org/docs/api/#putaction)

### #2: Loading the Bakery Store

The `BakeryStore` component is connected to the `bakery.bakeries` state to display the list of bakeries available to purchase.
These bakeries are provided via the api call to `/api/bakeries` (There is a helper function called `fetchBakeries` exported from `src/api` which has already be written, and you should use to simulate this API request). We should make this API call to retrieve the bakeries when the app
first loads, and store the bakeries in redux. This should also happen whenever the "Refresh" button is clicked (this will fire off the `bakery/REQUEST_BAKERY_STARTED` action).

**Useful Effects:**
- [call](https://redux-saga.js.org/docs/api/#callfn-args)

### #3: Buying a Bakery

The `BakeryStore` should allow for buying a bakery when the `app.cookieCount` is high enough. After a bakery is purchased, it will need to
increment the `app.cookieCount` (using the `app/INCREMENT_COOKIE_COUNT` action) by the given `cookiesPerSec` amount every second (bonus:
try to only increment the cookie count only by integer amounts). For the purposes of this exercise, you should **not** use `setInterval` or `setTimeout`; the functionality that these two functions offer is implementable using effects in your saga. 

When a bakery is purchased, the `purchasedBakeries` array will have the most recently purchased bakery appended to the end of it. Given a `bakery/BUY_BAKERY` action payload, you should be able to retrieve this purchased bakery from the store using `_.findLast(state.bakery.purchasedBakeries, ['bakeryId', buyAction.payload])`.

**Useful Effects:**
- [fork](https://redux-saga.js.org/docs/api/#forkfn-args)
- [select](https://redux-saga.js.org/docs/api/#selectselector-args)

**Useful Helpers & Utils**
- [takeEvery](https://redux-saga.js.org/docs/api/#takeeverypattern-saga-args)
- [delay](https://redux-saga.js.org/docs/api/#delayms-val)

### #4: Selling a Bakery

The `PurchasedBakeries` should allow for a bakery to be sold, and refund some amount of the purchasing price (`BAKERY_REFUND_RATIO`).
After a bakery is sold, it should no longer increment the `app.cookieCount`. `bakery/SELL_BAKERY` is an async action, 
to allow for Task #5 to be completed in a simple manner. For this task, you can simply dispatch the `bakery/SELL_BAKERY_REQUEST`
and `bakery/SELL_BAKERY_DONE` actions back to back.

**Useful Effects:**
- [cancel](https://redux-saga.js.org/docs/api/#canceltask)

**Useful Effect Combinators**
- [all](https://redux-saga.js.org/docs/api/#alleffects---parallel-effects)

### #5: Undo Selling

Because selling a bakery results in a loss of cookies, we should allow the user to undo this action for a short period of time.
After 3 seconds of not clicking "Undo" (which will trigger the `bakery/SELL_BAKERY_FAILED` action), the sale should automatically complete. The refund should not be added to the `app.cookieCount`
until after the sale has completed.

**Useful Effect Combinators:**
- [race](https://redux-saga.js.org/docs/api/#raceeffects)

## Resources

- [Redux-Saga docs](https://redux-saga.js.org/)
- [3 common approaches to side-effects in redux apps - Gosha Arinich](https://goshakkk.name/redux-side-effect-approaches/)
- [When should I use a saga? - Felix Clack](https://medium.com/netscape/when-should-i-use-a-saga-708cb3c75e9a)
