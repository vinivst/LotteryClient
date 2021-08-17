import React, { Component } from 'react';
import {
  Container,
  InputGroup,
  InputGroupAddon,
  Input,
  Row,
  Col,
  Button,
} from 'reactstrap';

class Raffle extends Component {
  state = {
    seed: '',
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      seed: value,
    });
  };

  pickWinner = () => {
    this.props.pickWinner(this.state.seed);
  };

  render() {
    if (this.props.isOwner) {
      return (
        <Container>
          <Row>
            <Col>
              <br />
              <h1>Lottery Owner Visible Only</h1>
              <br />
            </Col>
          </Row>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <InputGroup>
                <InputGroupAddon addonType="prepend" className="title">
                  Seed:
                </InputGroupAddon>
                <Input
                  type="text"
                  name="seed"
                  value={this.state.seed}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="append">
                  <Button onClick={this.pickWinner} color="primary">
                    Pick Winner
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      );
    } else {
      return '';
    }
  }
}

export default Raffle;
