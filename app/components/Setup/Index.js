import React, { Component } from 'react';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Redirect } from 'react-router-dom';
import * as actions from '../../actions';

class Index extends Component {
  redirectIfIncomplete () {
    switch (this.props.step) {
      default:
      case 'start':
        return (<Redirect to="/setup" />);
      case 'theme':
        return (<Redirect to="/setup/theme" />);
      case 'importwallet':
        return (<Redirect to="/setup/import" />);
      case 'importprivatekeys':
        return (<Redirect to="/setup/keys" />);
      case 'encrypt':
        return (<Redirect to="/setup/encrypt" />);
      case 'complete':
        return (<Redirect to="/setup/complete" />);
    }
  }

  render () {
    const logo = require('../../../resources/images/logo_setup.png');
    const { route } = this.props;

    return (
      <div id="page" className="justify-content-center">
        <div id="mainPanel">
          <div id="logo">
            <img src={logo} />
          </div>
          <div>
            {this.redirectIfIncomplete()}
            {renderRoutes(route.routes)}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    step: state.setup.step,
    totalSteps: state.startup.totalSteps,
    lang: state.startup.lang,
    importing: state.setup.importing,
    importedWalletVal: state.setup.imported,
    stepOverVal: state.setup.stepOver,
    encrypting: state.setup.encrypting,
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    unencryptedWallet: state.startup.unencryptedWallet,
    setupDoneInternal: state.startup.setupDoneInternal,
    importingPrivKey: state.application.checkingDaemonStatusPrivateKey,
    shouldImportWallet: state.startup.importWallet,
    importingWalletWithSetupDone: state.startup.importingWalletWithSetupDone
  };
};

export default connect(mapStateToProps, actions)(Index);
