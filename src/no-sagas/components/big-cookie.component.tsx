import * as React from 'react';
import { Button, Image } from 'semantic-ui-react';
import * as cookie from 'assets/cookie.png';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { actionCreators } from 'src/redux/cookie';
import { actionCreators as appActionCreators } from 'src/redux/app';

interface BigCookieDispatchMappedProps {
  onClick: () => void;
}

interface BigCookieProps extends BigCookieDispatchMappedProps {}

class BigCookie extends React.Component<BigCookieProps> {
  public render(): React.ReactNode {
    return (
      <Image
        as={Button}
        basic={true}
        size={'medium'}
        src={cookie}
        onClick={this.props.onClick}
      />
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch): BigCookieDispatchMappedProps => {
  const boundActionCreators =  bindActionCreators({
    clickCookie: actionCreators.clickCookie,
    incrementCookieCount: appActionCreators.incrementCookieCount
  }, dispatch);

  return {
    onClick: () => {
      boundActionCreators.clickCookie();
      /**
       * #1 Notes:
       *
       * Without sagas, here are some options for implementing this functionality:
       *
       * 1. Call the incrementCookieCount action immediately after clickCookie
       *    - This increases the redux surface area of the component (it now depends on two separate ducks)
       *    - This logic has to replicated in ANY place where the clickCookie action may be dispatched from
       * 2. Have the app reducer process the clickCookie action
       *    - This will couple the app duck to the cookie duck, reducing modularity
       * 3. Write a middleware to listen for the clickCookie action, and then dispatch the incrementCookieCount
       *    - This is effectively a saga, but without the framework support of redux-saga
        */
      boundActionCreators.incrementCookieCount(1);
    }
  };
};

export default connect(
  null,
  mapDispatchToProps,
)(BigCookie);
