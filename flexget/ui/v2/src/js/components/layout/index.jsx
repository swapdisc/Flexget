import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Logo from 'components/layout/Logo';
import Navbar from 'containers/layout/Navbar';
import SideNav from 'components/layout/Sidenav';
import LoadingBar from 'containers/common/LoadingBar';
import ErrorStatus from 'containers/common/ErrorStatus';
import InfoStatus from 'containers/common/InfoStatus';

const HEADER_HEIGHT = 50;
const MOBILE_HEADER_HEIGHT = (HEADER_HEIGHT * 2) - 2;
const PADDING = 10;

const styleSheet = theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100vh',
  },
  main: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: MOBILE_HEADER_HEIGHT,
    flex: 1,
    [theme.breakpoints.up('sm')]: {
      marginTop: HEADER_HEIGHT,
    },
  },
  header: {
    display: 'flex',
    minHeight: HEADER_HEIGHT,
    flexDirection: 'column',
    zIndex: 2,
    position: 'fixed',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },
  logo: {
    height: HEADER_HEIGHT,
  },
  navbar: {
    height: HEADER_HEIGHT,
    flex: 1,
  },
  sidebar: {
    overflowY: 'auto',
  },
  content: {
    flex: 1,
    padding: PADDING,
    overflowY: 'auto',
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.up('sm')]: {
      marginLeft: 190,
    },
  },
  contentPadding: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      opacity: 0,
      display: 'none',
    },
  },
});

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    loggedIn: false,
  };

  state = {
    sideBarOpen: (window.matchMedia && !!window.matchMedia('(min-width: 600px)').matches) || false,
  };

  toggleSideBar = () => {
    this.setState({
      sideBarOpen: !this.state.sideBarOpen,
    });
  }

  render() {
    const { children, classes } = this.props;
    const { sideBarOpen } = this.state;

    return (
      <div className={classes.layout}>
        <header className={classes.header}>
          <div className={classes.logo}>
            <Logo sideBarOpen={sideBarOpen} />
          </div>
          <nav className={classes.navbar}>
            <Navbar toggle={this.toggleSideBar} />
            <LoadingBar />
          </nav>
        </header>
        <main className={classes.main}>
          <aside className={classes.sidebar}>
            <SideNav
              sideBarOpen={sideBarOpen}
              toggle={this.toggleSideBar}
            />
          </aside>
          <section
            className={classNames(classes.content, {
              [classes.contentPadding]: sideBarOpen,
            })}
          >
            { children }
          </section>
          <ErrorStatus />
          <InfoStatus />
        </main>
      </div>
    );
  }
}

export default withStyles(styleSheet)(Layout);
