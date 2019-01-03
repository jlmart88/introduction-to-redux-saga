import * as React from 'react';
import { Button, Dimmer, Header, Icon, Item, Label, Loader, Message, Segment } from 'semantic-ui-react';
import { actionCreators, Bakery as BakeryModel } from 'src/redux/bakery';
import { Bakery } from 'src/components/bakery.component';
import { RootState } from 'src/redux';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { fetchBakeries } from 'src/api';
import { canDecrementCookieCount } from 'src/redux/app';
import { actionCreators as appActionCreators } from 'src/redux/app';

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
  public componentDidMount(): void {
    this.props.onRefreshBakeries();
  }

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

    /**
     * #2 Notes:
     *
     * Without sagas, the bakery store component dispatch mapping now needs to bind all async lifecycle actions
     * for requesting the bakeries
     */
    requestBakeriesStarted: actionCreators.requestBakeries.started,
    requestBakeriesDone: actionCreators.requestBakeries.done,
    requestBakeriesFailed: actionCreators.requestBakeries.failed,

    decrementCookieCount: appActionCreators.decrementCookieCount,
  }, dispatch);

  return {
    onBuyBakery: (bakery: BakeryModel) => {
      /**
       * #3 Notes
       *
       * Without sagas, we run into a similar issue as Task #1, where some "action B" needs to be triggered immediately
       * after "action A"
       */
      boundActionCreators.buyBakery(bakery.id);
      boundActionCreators.decrementCookieCount(bakery.cookieCost);
    },
    onRefreshBakeries: () => {
      /**
       * #2 Notes:
       *
       * Without sagas, the bakery store component dispatch mapping is now responsible for implementing the full async
       * lifecycle of this action.
       *
       * If we chose to not use redux to store the bakeries, then we could potentially store the bakeries in the
       * component state.
       * However, this has other downsides; it increases the component complexity, and forces the developer to
       * ensure that the setState calls occurring in an async context are all properly maintained to avoid a memory
       * leak when the component unmounts (either by cancelling the async request, or only calling setState if the
       * component is still mounted)
       *
       * See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data for how this
       * would look
       */
      boundActionCreators.requestBakeriesStarted();
      fetchBakeries()
        .then((result) => (boundActionCreators.requestBakeriesDone({ result })))
        .catch((error) => boundActionCreators.requestBakeriesFailed({ error }))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BakeryStore);
