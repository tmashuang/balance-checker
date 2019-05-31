import React, { Component } from 'react'
import Web3 from 'web3'
import EthJs from 'ethjs'
import EthQuery from 'eth-query'
import SINGLE_CALL_BALANCES_ABI from 'single-call-balance-checker-abi'
import pify from 'pify'

const ethUtil = require('ethereumjs-util')
const SINGLE_CALL_BALANCES_ADDRESS = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39'

class App extends Component {
  constructor() {
    super()
    this._provider = window.ethereum
    this.state = {
      account: '',
      ethQueryBalance: '',
      web3Balance: '',
      ethjsBalance: '',
      error: ''
    }

    this.loadEthQueryBalance = this.loadEthQueryBalance.bind(this)
    this.loadWeb3Balance = this.loadWeb3Balance.bind(this)
    this.loadEthJsBalance = this.loadEthJsBalance.bind(this)
  }

  componentDidMount() {
    this.loadWeb3()
    this.loadEthJs()
  }

  componentDidUpdate() {
    this.loadEthQueryBalance()
    this.loadWeb3Balance()
    this.loadEthJsBalance()
  }

  async loadWeb3() {
    this.web3 = new Web3(window.ethereum || "http://localhost:8545")
    const accounts = await window.ethereum.enable()
    this.setState({ account: accounts[0] })
  }

  loadEthJs() {
    this.ethjs = new EthJs(window.ethereum)
  }

  async loadEthQueryBalance() {
    const query = pify(new EthQuery(window.ethereum))
    const balance = await query.getBalance(this.state.account)
    this.setState({ ethQueryBalance: balance })
  }

  async loadWeb3Balance() {
    const addressArray = [this.state.account]
    const ethContract = this.web3.eth.contract(SINGLE_CALL_BALANCES_ABI).at(SINGLE_CALL_BALANCES_ADDRESS)
    const ethBalance = ['0x0']

    ethContract.balances(addressArray, ethBalance, (error, result) => {
      if (error) {
        console.log(new Error(error))
      }
      this.setState({ web3Balance: bnToHex(result) })
    })
  }

  async loadEthJsBalance() {
    const addressArray = [this.state.account]
    const ethContract = this.ethjs.contract(SINGLE_CALL_BALANCES_ABI).at(SINGLE_CALL_BALANCES_ADDRESS)
    const ethBalance = ['0x0']

    ethContract.balances(addressArray, ethBalance, (error, result) => {
      if (error) {
        console.log(error)
        this.setState({ error: error })
      } else {
        this.setState({ ethjsBalance: bnToHex(result) })
      }
    })
  }


  render() {
    return (
      <div className="container">
        <h1>Balance Checker</h1>
        <p>Your account: {this.state.account}</p>
        <p>Eth Query Balance: {this.state.ethQueryBalance}</p>
        <p>Web3 Contract Balance: {this.state.web3Balance}</p>
        <p>EthJs Contract Balance: {this.state.ethjsBalance}</p>
        <button onClick={this.loadEthQueryBalance}>
          EthQuery Balance
        </button>
        <button onClick={this.loadWeb3Balance}>
          Web3 Balance Contract
        </button>
        <button onClick={this.loadEthJsBalance}>
          EthJs Balance Contract
        </button>
        <p style={{color: 'red'}}>{this.state.error.message}</p>
      </div>
    );
  }
}

function bnToHex (inputBn) {
  return ethUtil.addHexPrefix(inputBn.toString(16))
}

export default App;