import React, { Component } from 'react';
import LotteryContract from './contracts/Lottery.json';
import getWeb3 from './getWeb3';

import './App.css';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    isOwner: false,
    seed: '',
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.deployedNetwork = LotteryContract.networks[this.networkId];
      this.lotteryContract = new this.web3.eth.Contract(
        LotteryContract.abi,
        this.deployedNetwork && this.deployedNetwork.address
      );

      let owner = await this.lotteryContract.methods.owner().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPickerWinner();
      this.setState({
        web3: this.web3,
        accounts: this.accounts,
        contract: this.lotteryContract,
        isOwner: this.accounts[0] === owner,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleBuy = async () => {
    await this.lotteryContract.methods.buyTickets().send({
      from: this.accounts[0],
      value: this.web3.utils.toWei('0.1', 'ether'),
    });
  };

  pickWinner = async () => {
    await this.lotteryContract.methods.raffle(this.accounts[0]).send({
      from: this.accounts[0],
    });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      seed: value,
    });
  };

  listenToPickerWinner = () => {
    this.lotteryContract.events.WinnerPicked().on('data', async function (evt) {
      alert(
        'The bigger Winner of the prize of ' +
          evt.returnValues._prize +
          ' is ' +
          evt.returnValues._winnerAddress +
          '! Congratulations!'
      );
      console.log(evt);
    });
  };

  renderRaffle() {
    if (this.state.isOwner) {
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
      return <div></div>;
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Ethereum Lottery Smart Contract</h1>
        <h2>Buy a ticket now and test your luck!</h2>
        <button type="button" onClick={this.handleBuy}>
          Buy ticket
        </button>
        <div>{this.renderRaffle()}</div>
      </div>
    );
  }
}

export default App;
