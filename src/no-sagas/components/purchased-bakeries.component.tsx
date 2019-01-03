import * as React from 'react';
import { Button, Header, Item, Message } from 'semantic-ui-react';
import { actionCreators, Bakery as BakeryModel, BAKERY_REFUND_RATIO, PurchasedBakery } from 'src/redux/bakery';
import { Bakery } from 'src/components/bakery.component';
import { RootState } from 'src/redux';
import * as _ from 'lodash';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as appActionCreators } from 'src/redux/app';

interface PurchasedBakeriesStateMappedProps {
  bakeries: BakeryModel[];
  purchasedBakeries: PurchasedBakery[];
}

interface PurchasedBakeriesDispatchMappedProps {
  onSellBakery: (bakery: PurchasedBakery, refundPrice: number) => number;
  onUndoSellBakery: (bakery: PurchasedBakery) => void;
  incrementCookieCount: (amount: number) => void;
}

interface PurchasedBakeriesProps extends PurchasedBakeriesStateMappedProps, PurchasedBakeriesDispatchMappedProps {}

interface PurchasedBakeriesState {
  purchasedBakeryIntervals: { interval: number; purchasedBakeryId: number; }[];
}

const createPurchasedBakeryInterval = (
  cookiesPerSec: BakeryModel['cookiesPerSec'],
  incrementCookieCount: (amount: number) => void
): number => {
  let interval = 1000;
  let cookiesPerInterval = cookiesPerSec;
  let timesIncremented = 0;
  // only add an integer number of cookies
  while (Math.floor(cookiesPerInterval) < cookiesPerInterval && timesIncremented < 10) {
    interval *= 10;
    cookiesPerInterval *= 10;
    timesIncremented += 1;
  }
  if (timesIncremented >= 10) {
    throw Error(`cookiesPerSec ${cookiesPerSec} has too high of precision`);
  }
  return window.setInterval(() => {
    incrementCookieCount(cookiesPerInterval);
  }, interval);
};

class PurchasedBakeries extends React.Component<PurchasedBakeriesProps> {
  /**
   * #3 Notes:
   *
   * Without sagas, we need some React-independent way for maintaining the "threads" that will periodically increment
   * the cookieCount. This could be implemented as its own ES6 module, and tie in some API to keep it synchronized with
   * the Redux state, but that solution is too similar to a saga to be worth demonstrating. Therefore, we will implement
   * it inside of this component to demonstrate the overhead of maintaining "side effects" inside of a React component
   */
  public state: PurchasedBakeriesState = {
    purchasedBakeryIntervals: [],
  };

  /**
   * #5 Notes
   *
   * Without sagas, we are forced to maintain the state of all pending sales in the component, in order to allow them
   * to be cancelled by the user. This adds even more complexity on top of the maintaining the intervals for the
   * purchased bakeries.
   */
  private bakerySaleTimeouts: { purchasedBakery: PurchasedBakery; timeout: number }[] = [];

  /**
   * #3 Notes:
   *
   * This implementation of a "purchased factory thread pool" is functional, but has many downsides.
   *
   * - Because it is within the PurchasedBakeries component, it relies on having the incrementCookieCount action creator
   *    mapped into the props.
   * - It adds significant complexity to a formerly simple component by requiring state maintenance
   * - This implementation currently doesn't handle the "incrementCookieCount" prop updating, because the functions are
   *    bound at the time of the purchased factory being added (because getDerivedStateFromProps is a static function)
   */
  /**
   * #4 Notes:
   *
   * - When the purchasedBakeries are updated, we have no way of knowing whether a bakery was added or removed. So we
   *    have to iterate over the full set of purchased bakeries and intervals each time in order to synchronize them
   */
  public static getDerivedStateFromProps(nextProps: PurchasedBakeriesProps, prevState: PurchasedBakeriesState): PurchasedBakeriesState | null {
    let purchasedBakeryIntervals = [...prevState.purchasedBakeryIntervals];
    // add intervals for new purchased bakeries
    nextProps.purchasedBakeries.map((purchasedBakery) => {
      if (!_.find(purchasedBakeryIntervals, ['purchasedBakeryId', purchasedBakery.id])) {
        const bakery = _.find(nextProps.bakeries, ['id', purchasedBakery.bakeryId]);
        purchasedBakeryIntervals.push({
          purchasedBakeryId: purchasedBakery.id,
          interval: createPurchasedBakeryInterval(bakery.cookiesPerSec, nextProps.incrementCookieCount)
        });
      }
    });
    // remove intervals for purchased bakeries which were sold
    purchasedBakeryIntervals = purchasedBakeryIntervals.filter((purchasedBakeryInterval) => {
      if (!_.find(nextProps.purchasedBakeries, ['id', purchasedBakeryInterval.purchasedBakeryId])) {
        window.clearInterval(purchasedBakeryInterval.interval);
        return false;
      }
      return true;
    });

    return { purchasedBakeryIntervals };
  }

  /**
   * #3 Notes:
   *
   * Because we are creating intervals in the component state, we need to clean these up when the component is unmounted
   * to prevent memory leaks
   */
  public componentWillUnmount(): void {
    this.state.purchasedBakeryIntervals.map(({ interval }) => {
      window.clearInterval(interval);
    })
  }

  public render(): React.ReactNode {
    const bakeryPairs = this.props.purchasedBakeries.map((purchasedBakery: PurchasedBakery) => (
      {
        bakery: _.find(this.props.bakeries, ['id', purchasedBakery.bakeryId]),
        purchasedBakery
      }
    ));
    return (
      <>
        <Header dividing={true} textAlign={'center'}>
          Purchased Bakeries
        </Header>
        <Item.Group divided={true}>
          {this.props.bakeries.length < 1 &&
            <Message size={'small'}>
              <Header textAlign={'center'} size={'small'}>
                No bakeries purchased
              </Header>
            </Message>
          }
          {bakeryPairs.map(({ bakery, purchasedBakery }) => {
            const refundPrice = Math.floor(bakery.cookieCost * BAKERY_REFUND_RATIO);
            if (purchasedBakery.isBeingSold) {
              return (
                <Item key={purchasedBakery.id}>
                  <Item.Content>
                    <Item.Description>
                      Sold {bakery.name} for {refundPrice.toLocaleString()} Cookies.
                    </Item.Description>
                    <Item.Extra>
                      <Button
                        floated={'left'}
                        color={'red'}
                        onClick={() => {
                          const saleTimeouts = _.remove(this.bakerySaleTimeouts, ['purchasedBakery.id', purchasedBakery.id]);
                          saleTimeouts.map((saleTimeout) => window.clearTimeout(saleTimeout.timeout));
                          this.props.onUndoSellBakery(purchasedBakery);
                        }}
                      >
                        Undo
                      </Button>
                    </Item.Extra>
                  </Item.Content>
                </Item>
              )
            }
            return (
              <Bakery key={purchasedBakery.id} bakery={bakery}>
                <Button floated={'left'} color={'red'} onClick={() => (
                  this.bakerySaleTimeouts.push({
                    purchasedBakery,
                    timeout: this.props.onSellBakery(purchasedBakery, refundPrice),
                  })
                )}>
                  Sell for {refundPrice.toLocaleString()} Cookies
                </Button>
              </Bakery>
            )
          })}
        </Item.Group>
      </>
    )
  }
}

const mapStateToProps = (state: RootState): PurchasedBakeriesStateMappedProps => {
  return {
    bakeries: state.bakery.bakeries,
    purchasedBakeries: state.bakery.purchasedBakeries,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): PurchasedBakeriesDispatchMappedProps => {
  const boundActionCreators = bindActionCreators({
    sellBakeryStarted: actionCreators.sellBakery.started,
    sellBakeryFailed: actionCreators.sellBakery.failed,
    sellBakeryDone: actionCreators.sellBakery.done,
    incrementCookieCount: appActionCreators.incrementCookieCount,
  }, dispatch);

  return {
    onSellBakery: (bakery: PurchasedBakery, refundPrice: number): number => {
      boundActionCreators.sellBakeryStarted(bakery);

      /**
       * #5 Notes
       *
       * Without sagas, we are forced to return a setTimeout so that this can be cancelled if the user clicks
       * the undo button. This requires adding additional complexity to this component's props.
       */
      return window.setTimeout(() => {
        boundActionCreators.sellBakeryDone({ params: bakery });

        /**
         * #4 Notes
         *
         * Without sagas, we run into a similar issue as Task #1, where some "action B" needs to be dispatched
         * as a result of "action A"
         */
        boundActionCreators.incrementCookieCount(refundPrice);
      }, 3000);
    },
    onUndoSellBakery: (bakery: PurchasedBakery) => (
      boundActionCreators.sellBakeryFailed({ params: bakery, error: 'User Cancelled' })
    ),
    incrementCookieCount: (amount: number) => boundActionCreators.incrementCookieCount(amount),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PurchasedBakeries);
