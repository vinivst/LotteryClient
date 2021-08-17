import React, { Component } from 'react';
import LotteryContract from './contracts/Lottery.json';
import getWeb3 from './getWeb3';
import Raffle from './components/Raffle';
import { Spinner, Container, Row, Col, Button } from 'reactstrap';

import './App.css';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    owner: null,
    players: [],
    rewardPool: 0,
    playerTickets: 0,
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

      this.owner = await this.lotteryContract.methods.owner().call();

      this.players = await this.lotteryContract.methods.getPlayers().call();

      this.playerTickets = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i] === this.accounts[0]) {
          this.playerTickets++;
        }
      }

      this.rewards = await this.lotteryContract.methods
        .getContractBalance()
        .call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToAcountChange();
      this.listenToPickerWinner();
      this.listenToNewPlayer();
      this.setState({
        web3: this.web3,
        accounts: this.accounts,
        contract: this.lotteryContract,
        owner: this.owner,
        players: this.players,
        rewardPool: this.rewards,
        playerTickets: this.playerTickets,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  listenToAcountChange = async () => {
    window.ethereum.on('accountsChanged', async () => {
      // Time to reload your interface with accounts[0]!
      //alert('Account changed!');

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      this.setState({
        accounts: this.accounts,
      });

      this.calculatePlayerTickets();
      // accounts = await web3.eth.getAccounts();
    });
  };

  fetchPlayers = async () => {
    this.players = await this.lotteryContract.methods.getPlayers().call();
    this.setState({
      players: this.players,
    });
  };

  fetchRewardPool = async () => {
    this.rewards = await this.lotteryContract.methods
      .getContractBalance()
      .call();

    this.setState({
      rewardPool: this.rewards,
    });
  };

  calculatePlayerTickets = async () => {
    this.accounts = await this.web3.eth.getAccounts();
    this.players = this.state.players;
    this.playerTickets = this.state.playerTickets;
    this.count = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] === this.accounts[0]) {
        this.count++;
      }
    }
    if (this.playerTickets !== this.count) {
      this.setState({
        playerTickets: this.count,
      });
    }
  };

  handleBuy = async () => {
    await this.lotteryContract.methods.buyTickets().send({
      from: this.accounts[0],
      value: this.web3.utils.toWei('0.1', 'ether'),
    });
  };

  pickWinner = async (seed) => {
    await this.lotteryContract.methods.raffle(seed).send({
      from: this.accounts[0],
    });
    //console.log(seed);
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

  listenToNewPlayer = () => {
    this.lotteryContract.events.NewPlayer().on('data', async (evt) => {
      //console.log(evt);
      this.address = evt.returnValues._address;
      this.fetchPlayers();
      this.fetchRewardPool();
      this.calculatePlayerTickets();
    });
  };

  render() {
    if (!this.state.web3) {
      return (
        <div>
          <Spinner color="primary" children="" />
          Loading Web3, accounts, and contract...You must have Metamask and
          switch to Rinkeby network .
        </div>
      );
    }
    return (
      <Container>
        <Row>
          <Col>
            <div className="App">
              <Row>
                <Col>
                  <h1>Ethereum Lottery Smart Contract</h1>
                </Col>
              </Row>
              <Row>
                <Col>
                  <br />
                  <h2>Buy a ticket now and test your luck! Only 0.1 ether!</h2>
                  <br />
                  <Button color="success" onClick={this.handleBuy}>
                    Buy ticket
                  </Button>
                  <br />
                </Col>
              </Row>
              <Row>
                <Col>
                  <br />
                  <h2>
                    Accumulated Prize:{' '}
                    {this.web3.utils.fromWei(this.state.rewardPool, 'ether')}{' '}
                    ether *
                  </h2>
                  <p>*10% administration fee</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p>You have: {this.state.playerTickets} tickets.</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <br />
                  <Raffle
                    isOwner={this.state.owner === this.accounts[0]}
                    pickWinner={this.pickWinner}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
