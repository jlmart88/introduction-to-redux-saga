import * as React from 'react';
import { Button, Dimmer, Header, Icon, Item, Label, Loader, Message, Segment } from 'semantic-ui-react';
import { actionCreators, Bakery as BakeryModel } from 'src/redux/bakery';
import { Bakery } from 'src/components/bakery.component';
import { RootState } from 'src/redux';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { canDecrementCookieCount } from 'src/redux/app';

interface BakeryStoreStateMappedProps {
  cookieCount: number;
  bakeries: BakeryModel[];
  loading: boolean;
}

interface BakeryStoreDispatchMappedProps {
  onBuyBakery: (bakery: BakeryModel) => void;
  onRefreshBakeries: () => void;
}

interface BakeryStoreProps extends BakeryStoreStateMappedProps, BakeryStoreDispatchMappedProps {}

class BakeryStore extends React.Component<BakeryStoreProps> {
  public render(): React.ReactNode {
    return (
      <>
        <Label as={Button} attached={'top'} style={{cursor: 'pointer'}} onClick={this.props.onRefreshBakeries}>
          <Icon name={'refresh'}/> Refresh
        </Label>
        <Header textAlign={'center'} dividing>
          Bakery Store
        </Header>
        <Dimmer.Dimmable as={Segment} dimmed={this.props.loading}>
          <Dimmer active={this.props.loading} inverted={true}>
            <Loader/>
          </Dimmer>
          {this.props.bakeries.length < 1 &&
            <Message size={'small'}>
              <Header textAlign={'center'} size={'small'}>
                No bakeries available for purchase
              </Header>
            </Message>
          }
          <Item.Group divided={true}>
            {this.props.bakeries.map((bakery) => (
              <Bakery key={bakery.id} bakery={bakery}>
                <Button
                  floated={'left'}
                  primary={true}
                  onClick={() => this.props.onBuyBakery(bakery)}
                  disabled={!canDecrementCookieCount(this.props.cookieCount, bakery.cookieCost)}
                >
                  Buy for {bakery.cookieCost.toLocaleString()} Cookies
                </Button>
              </Bakery>
            ))}
          </Item.Group>
        </Dimmer.Dimmable>
      </>
    )
  }
}

const mapStateToProps = (state: RootState): BakeryStoreStateMappedProps => {
  return {
    cookieCount: state.app.cookieCount,
    bakeries: state.bakery.bakeries,
    loading: state.bakery.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): BakeryStoreDispatchMappedProps => {
  const boundActionCreators = bindActionCreators({
    buyBakery: actionCreators.buyBakery,
    requestBakeries: actionCreators.requestBakeries.started,
  }, dispatch);

  return {
    onBuyBakery: (bakery: BakeryModel) => boundActionCreators.buyBakery(bakery.id),
    onRefreshBakeries: () => boundActionCreators.requestBakeries()
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BakeryStore);
