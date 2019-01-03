import * as React from 'react';
import { Button, Header, Item, Message } from 'semantic-ui-react';
import { actionCreators, Bakery as BakeryModel, PurchasedBakery } from 'src/redux/bakery';
import { Bakery } from 'src/components/bakery.component';
import { RootState } from 'src/redux';
import * as _ from 'lodash';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

const BAKERY_REFUND_RATIO = 0.8;

interface PurchasedBakeriesStateMappedProps {
  bakeries: BakeryModel[];
  purchasedBakeries: PurchasedBakery[];
}

interface PurchasedBakeriesDispatchMappedProps {
  onSellBakery: (bakery: PurchasedBakery) => void;
  onUndoSellBakery: (bakery: PurchasedBakery) => void;
}

interface PurchasedBakeriesProps extends PurchasedBakeriesStateMappedProps, PurchasedBakeriesDispatchMappedProps {}

class PurchasedBakeries extends React.Component<PurchasedBakeriesProps> {
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
                        onClick={() => this.props.onUndoSellBakery(purchasedBakery)}
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
                <Button floated={'left'} color={'red'} onClick={() => this.props.onSellBakery(purchasedBakery)}>
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
  }, dispatch);

  return {
    onSellBakery: (bakery: PurchasedBakery) => boundActionCreators.sellBakeryStarted(bakery),
    onUndoSellBakery: (bakery: PurchasedBakery) => (
      boundActionCreators.sellBakeryFailed({ params: bakery, error: 'User Cancelled' })
    ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PurchasedBakeries);
