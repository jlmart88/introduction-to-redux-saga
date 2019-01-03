import * as React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import BigCookie from 'src/no-sagas/components/big-cookie.component';
import CookieCounter from 'src/no-sagas/components/cookie-counter.component';
import BakeryStore from 'src/no-sagas/components/bakery-store.component';
import PurchasedBakeries from 'src/no-sagas/components/purchased-bakeries.component';

export class App extends React.Component {
  public render(): React.ReactNode {
    return (
      <Grid container>
        <Grid.Row>
          <Grid.Column width={16} textAlign={'center'}>
            <CookieCounter/>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}>
            <Segment>
              <BigCookie/>
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment>
              <PurchasedBakeries/>
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <BakeryStore/>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
