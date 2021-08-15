import React, { Component } from 'react';

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
        <div>
          <h1>Lottery Owner Visible Only</h1>
          <input
            type="text"
            name="seed"
            value={this.state.seed}
            onChange={this.handleInputChange}
          />
          <button type="button" onClick={this.pickWinner}>
            Pick Winner
          </button>
        </div>
      );
    } else {
      return '';
    }
  }
}

export default Raffle;
