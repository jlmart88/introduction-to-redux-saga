import * as React from 'react';
import { Button, Image } from 'semantic-ui-react';
import * as cookie from 'assets/cookie.png';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { actionCreators } from 'src/redux/cookie';

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
  }, dispatch);

  return {
    onClick: () => boundActionCreators.clickCookie()
  };
};

export default connect(
  null,
  mapDispatchToProps,
)(BigCookie);
