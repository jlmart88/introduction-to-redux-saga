import * as React from 'react';
import { Statistic } from 'semantic-ui-react';
import { RootState } from 'src/redux';
import { connect } from 'react-redux';

interface CookieCounterStateMappedProps {
  cookieCount: number;
}

interface CookieCounterProps extends CookieCounterStateMappedProps {}

class CookieCounter extends React.PureComponent<CookieCounterProps> {
  public render(): React.ReactNode {
    return (
      <Statistic>
        <Statistic.Value>
          {this.props.cookieCount.toLocaleString()}
        </Statistic.Value>
        <Statistic.Label>
          Cookie Count
        </Statistic.Label>
      </Statistic>
    )
  }
}

const mapStateToProps = (state: RootState): CookieCounterStateMappedProps => {
  return {
    cookieCount: state.app.cookieCount
  };
};

export default connect(
  mapStateToProps
)(CookieCounter);
