import * as React from 'react';
import { Bakery as BakeryModel } from 'src/redux/bakery';
import { Item, Label } from 'semantic-ui-react';

interface BakeryProps {
  bakery: BakeryModel;
}

export class Bakery extends React.Component<BakeryProps> {
  public render(): React.ReactNode {
    return (
      <Item>
        <Item.Content>
          <Item.Header>
            {this.props.bakery.name}
          </Item.Header>
          <Item.Extra>
            <Label.Group>
              <Label size={'medium'}>
                Cookies/sec
                <Label.Detail>{this.props.bakery.cookiesPerSec}</Label.Detail>
              </Label>
              <Label size={'medium'} tag={true}>
                {this.props.bakery.cookieCost.toLocaleString()} Cookies
              </Label>
            </Label.Group>
            {this.props.children}
          </Item.Extra>
        </Item.Content>
      </Item>
    )
  }
}
