import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TweenMax } from 'gsap';

import * as actions from '../../../actions/index';
import CloseButtonPopup from '../../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../../Others/ConfirmButtonPopup';
import Input from '../../Others/Input';

import $ from 'jquery';
import Toast from '../../../globals/Toast/Toast';

const Tools = require('../../../utils/tools');

class SendConfirmation extends Component {
  constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.sendECC = this.sendECC.bind(this);
    this.getNameOrAddressHtml = this.getNameOrAddressHtml.bind(this);
    this.reset = this.reset.bind(this);
    this.animated = false;
  }

  showWrongPassword() {
    Toast({
      title: this.props.lang.error,
      message: this.props.lang.wrongPassword,
      color: 'red'
    });
  }

  componentWillUnmount() {
    this.props.setUsernameSend('');
  }

  sendECC() {
    const wasStaking = this.props.staking;
    this.props.setPopupLoading(true);
    this.unlockWallet(false, 5, () => {
      const batch = [];
      console.log(this.props.amount);
      const obj = {
        method: 'sendToAddress', parameters: [this.props.address, this.props.amount]
      };
      batch.push(obj);
      this.props.wallet.command(batch).then((data) => {
        if (data && data[0] && typeof data[0] === 'string') {
          if (wasStaking) {
            this.unlockWallet(true, 31556926, () => {
            });
          } else {
            this.props.setStaking(false);
          }
          this.reset();
          this.props.setTemporaryBalance(this.props.balance - this.props.amount);
          Toast({
            title: this.props.lang.success,
            message: this.props.lang.sentSuccessfully
          });
        } else {
          throw ('Failed to send');
        }
      }).catch((err) => {
        Toast({
          title: this.props.lang.error,
          message: this.props.lang.failedToSend,
          color: 'red'
        });
        this.reset();
      });
    });
  }

  reset() {
    this.props.setPopupLoading(false);
    this.props.setUsernameSend('');
    this.props.setAmountSend('');
    this.props.setAddressSend('');
  }

  unlockWallet(flag, time, callback) {
    const batch = [];
    const obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log('data: ', data);
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log('Daemon not running - Dev please look into this and what exactly triggered it');
      } else if (data === null) {
        callback();
        return;
      } else {
        console.log('error unlocking wallet: ', data);
      }
      this.props.setPopupLoading(false);
    }).catch((err) => {
      this.props.setPopupLoading(false);
      console.log('err unlocking wallet: ', err);
    });
  }

  handleConfirm() {
    if (this.props.passwordVal === '') {
      this.showWrongPassword();
      return;
    }
    this.sendECC();
  }

  handleCancel() {
    // this.props.setSendingECC(false);
  }

  handleClick(val) {
    this.props.setUsernameSend(val.Name, `#${val.Code}`);
    this.props.setAddressSend(val.Address);
    if (this.animated) return;
    this.animated = true;
    TweenMax.to('#unlockPanel', 0.3, { css: { top: '10%' } });
    TweenMax.to('#unlockPanel', 0.3, { css: { height: '520px' } });
    TweenMax.set('#labels', { css: { display: 'block', visibility: 'hidden' }, delay: 0.3 });
    TweenMax.set('#send_inputs', { css: { display: 'block', visibility: 'hidden' }, delay: 0.3 });
    TweenMax.fromTo('#labels', 0.3, { y: 30 }, { y: 0, autoAlpha: 1, delay: 0.3 });
    TweenMax.to('#send_inputs', 0.3, { autoAlpha: 1, delay: 0.5 });
  }

  getNameOrAddressHtml() {
    if (this.props.username && this.props.username !== '') {
      return (
        <div>
          <p className="labelAmountSend">{ this.props.lang.amount }: {Tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span> <span className="labelAddressSend"> ({`${Tools.formatNumber(Number(this.props.amount * this.props.selectedCurrencyValue))} ${this.props.selectedCurrency.toUpperCase()}`})</span></p>
          <p className="labelSend">{ this.props.lang.name }: {this.props.username}<span className="Receive__ans-code">{this.props.codeToSend}</span> </p>
          <p className="labelAddressSend">({this.props.address})</p>
        </div>
      );
    }
    return (
      <div>
        <p className="labelAmountSend">{ this.props.lang.amount }: {Tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span> <span className="labelAddressSend"> ({`${Tools.formatNumber(Number(this.props.amount * this.props.selectedCurrencyValue))} ${this.props.selectedCurrency.toUpperCase()}`})</span></p>
        <p className="labelSend">{ this.props.lang.address }: <span style={{ fontSize: '14px' }}>{this.props.address}</span> </p>
      </div>
    );
  }

  render() {
    return (
      <div ref="second" style={{ height: '342px', top: '22%' }}>
        <CloseButtonPopup handleClose={this.handleCancel} />
        <p className="popupTitle">{ this.props.lang.confirmTransaction }</p>
        {this.getNameOrAddressHtml()}
        <div id="send_inputs" style={{ display: 'block' }}>
          <Input
            placeholder={this.props.lang.password}
            inputId="sendPasswordId"
            placeholderId="password"
            value={this.props.passwordVal}
            handleChange={this.props.setPassword}
            style={{ marginTop: '40px', width: '70%' }}
            type="password"
            autoFocus
            onSubmit={this.handleConfirm}
          />
          <ConfirmButtonPopup
            inputId={'#sendPasswordId'}
            handleConfirm={this.handleConfirm}
            textLoading={this.props.lang.confirming}
            text={this.props.lang.confirm}
          />
        </div>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    passwordVal: state.application.password,
    amount: state.application.amountSend,
    address: state.application.addressSend,
    username: state.application.userNameToSend,
    staking: state.chains.isStaking,
    wallet: state.application.wallet,
    balance: state.chains.balance,
    codeToSend: state.application.codeToSend,
    selectedCurrency: state.application.selectedCurrency,
    selectedCurrencyValue: state.application.coinMarketCapStats.price
  };
};


export default connect(mapStateToProps, actions)(SendConfirmation);
