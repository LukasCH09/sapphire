// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import {ipcRenderer} from 'electron';
import TopBar from './Layouts/partials/TopBar';
import routes from './router/routes';
import BlockIndexModal from './components/Settings/modals/BlockIndexModal';
import UpdateFailedModal from './components/Settings/modals/UpdateFailedModal';
import DownloadingUpdateModal from './components/Settings/modals/DownloadingUpdateModal';
import * as actions from './actions/index';
import DaemonConnector from './daemon/Connector';
import Tools from "./utils/tools";

const event = require('utils/eventhandler');
const settings = require('electron').remote.require('electron-settings');


class App extends Component {
  constructor(props) {
    super(props);
    this.startUp = this.startUp.bind(this);

  }

  componentDidMount() {
    // this.props.getSetup();
    this.startUp();

    ipcRenderer.on('closing_daemon', () => {
      if (this.props.loader) {
        TweenMax.to('#loading-wrapper', 0.3, { autoAlpha: 0.5 });
      }
      this.props.setClosingApplication();
    });
  }

  componentWillUnmount() {
    event.emit('stop');
  }

  /**
   * Load the app settings
   */
  startUp() {
    let tray = false;
    let startAtLogin = false;
    let minimizeToTray = false;
    let minimizeOnClose = false;
    let theme = 'theme-darkEcc';
    const ds = settings.get('settings.display');

    if (ds && ds.minimise_to_tray !== undefined && ds.minimise_to_tray) { minimizeToTray = true; }
    if (ds && ds.hide_tray_icon !== undefined && ds.hide_tray_icon) { tray = true; }
    if (ds && ds.minimise_on_close !== undefined && ds.minimise_on_close) { minimizeOnClose = true; }
    if (ds && ds.start_at_login !== undefined && ds.start_at_login) { startAtLogin = true; }
    if (ds && ds.theme !== undefined) { theme = ds.theme; }

    this.props.setMinimizeOnClose(minimizeOnClose);
    this.props.setMinimizeToTray(minimizeToTray);
    this.props.setStartAtLogin(startAtLogin);
    this.props.setTray(tray);
    this.props.setTheme(theme);

    let operativeSystemNotifications = true;
    let newsNotifications = true;
    let stakingNotifications = true;

    const ns = settings.get('settings.notifications');

    if (ns && ns.operative_system !== undefined && ns.operative_system) { operativeSystemNotifications = true; }
    // TODO : news notifications?
    if (ns && ns.news !== undefined && ns.news) { newsNotifications = true; }
    if (ns && ns.staking !== undefined && ns.staking) { stakingNotifications = true; }

    this.props.setOperativeSystemNotifications(operativeSystemNotifications);
    this.props.setNewsNotifications(newsNotifications);
    this.props.setStakingNotifications(stakingNotifications);

    this.createWallet()
  }

  /**
   * Create the wallet instance
   * @param credentials
   */
  async createWallet() {

    let daemonCredentials = await Tools.readRpcCredentials();

    if (!daemonCredentials || daemonCredentials.username === 'yourusername' || daemonCredentials.password === 'yourpassword') {
      daemonCredentials = {
        username: Tools.generateId(5),
        password: Tools.generateId(5)
      };
      await Tools.updateOrCreateConfig(daemonCredentials.username, daemonCredentials.password);
    }

    console.log(daemonCredentials);
    this.props.setWalletCredentials(daemonCredentials);
    event.emit('inital_setup');

    // alert('credentials');
    const key = 'settings.initialSetup';
    if (settings.has(key)) {
      const val = settings.get(key);
      this.props.setStepInitialSetup(val);
    } else {
      this.props.setStepInitialSetup('start');
    }
    event.emit('startConnectorChildren');
  }

  /*
    Append the selected theme class to the body
   */
  checkThemeClass() {
    const theme = this.props.theme;
    const availablethemes = ['theme-darkEcc', 'theme-defaultEcc', 'theme-lightEcc'];
    for (const ele in availablethemes) {
      if (document.body.classList.contains(availablethemes[ele])) {
        document.body.classList.remove(availablethemes[ele]);
      }
    }
    document.body.classList.add(theme);
  }

  render() {
    /* Add the theme class to body */
    this.checkThemeClass();

    return (
      <div>
        <DaemonConnector />
        {this.props.setupStep !== 'complete' && (<Redirect to="/setup" />)}
        <TopBar />
        <div>{renderRoutes(routes)}</div>

        { this.props.loading && <BlockIndexModal /> }
        { this.props.updateFailed && <UpdateFailedModal /> }
        { this.props.downloadMessage && <DownloadingUpdateModal /> }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    setupStep: state.setup.step,
    loader: state.startup.loader || (state.chains.loadingBlockIndexPayment),
    loading: state.startup.loading,
    minimizeOnClose: state.application.minimizeOnClose,
    closingApplication: state.application.closingApplication,
    theme: state.application.theme,
    updateFailed: state.application.updateFailed,
    downloadMessage: state.application.downloadMessage
  };
};

export default withRouter(connect(mapStateToProps, actions)(App));
