import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, ListGroup} from 'reactstrap';
import {CheckIcon} from 'mdi-react';
import {getAllMyAddresses} from '../../Managers/SQLManager';
import * as actions from '../../actions';
import NewRequestModal from './partials/NewRequestModal';
import ReceiveQRModal from './partials/ReceiveQRModal';

import Header from './../Others/Header';
import Body from './../Others/Body';
import UnlockModal from "../Others/UnlockModal";

const moment = require('moment');
const event = require('./../../utils/eventhandler');

moment.locale('en');

class Index extends Component {
  constructor(props) {
    super(props);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);
    this.selectAddressForReceive = this.selectAddressForReceive.bind(this);
    this.loadAddresses = this.loadAddresses.bind(this);
    this.reloadAddresses = this.reloadAddresses.bind(this);
    this.unlocktoggle = this.unlocktoggle.bind(this);

    this.state = {
      address: null,
      allAddresses: {}
    };
  }

  async componentDidMount() {
    await this.loadAddresses();
  }

  selectAddressForReceive (address) {
    console.log(address)
    this.setState({
      address: address
    });
    console.log(this.state)
    this.ReceiveQRModal.getWrappedInstance().toggle();
  }

  openNewAddressModal(){
    this.setState({
      address: null
    });
    this.confirmAddressModal.getWrappedInstance().toggle()
  }

  reloadAddresses(){
    event.emit('loadAddresses');
  }

  unlocktoggle(){
    this.unlockModal.getWrappedInstance().toggle();
  }

  async loadAddresses(){
    let data = await getAllMyAddresses();
    this.setState({
      allAddresses: data
    });
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.receiveCoins }
        </Header>
        <Body noPadding>
          <div className="row">
            <div className="col-xl-8">
              <h4 className="mb-3">Addresses available in this wallet
                <Button size="sm" outline color="warning" onClick={() => { this.unlocktoggle() }}>
                Reload
                </Button>
              </h4>

              <ListGroup style={{backgroundColor: null, maxHeight: '400px', overflowY:'scroll'}}>
                { this.state && this.state.allAddresses !== null && Object.entries(this.state.allAddresses).map((result) => {
                  let data = result[1];
                  let index = result[0];
                  return (
                    <div id="rows" key={index}>
                      <div className={"row normalWeight tableRowCustom tableRowCustomTransactions"} style={{backgroundColor: null}}  onClick={() => { this.selectAddressForReceive(data['address']) }}>
                        <p>{data['address']}</p>
                      </div>
                    </div>
                  );
                })}
              </ListGroup>
            </div>
            <div className="col-xl-4">
              <h4 className="mb-3">Generate new address</h4>
              <p>
                Generate new address to receive ECC
              </p>
              <div className="mt-4 d-flex justify-content-end">
                <Button color="success" onClick={this.openNewAddressModal}>
                  Generate Now
                  <CheckIcon className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Body>
        <UnlockModal ref={(e) => { this.unlockModal = e; }} onUnlock={this.reloadAddresses}>
          <p>{`${this.props.lang.unlockWalletExplanation1} ${this.props.lang.unlockWalletExplanation2}`} <span className="ecc">ECC</span>.</p>
        </UnlockModal>
        <NewRequestModal ref={(e) => { this.confirmAddressModal = e; }}/>
        <ReceiveQRModal ref={(e) => { this.ReceiveQRModal = e; }} address={this.state.address}/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    userAddresses: state.application.userAddresses,
    showZeroBalance: state.application.showZeroBalance
  };
};

export default connect(mapStateToProps, actions)(Index);
