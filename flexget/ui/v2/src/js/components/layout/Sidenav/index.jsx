import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import List, { ListItem } from 'material-ui/List';
import Icon from 'material-ui/Icon';
import Paper from 'material-ui/Paper';
import Version from 'containers/layout/Version';
import 'font-awesome/css/font-awesome.css';

const styleSheet = theme => ({
  listWrapper: {
    backgroundColor: theme.palette.accent[900],
    transition: theme.transitions.create(['width', 'visibility']),
    height: 'auto',
    width: '100vw',
    borderRadius: 0,
    display: 'flex',
    flex: {
      direction: 'column',
    },
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 50px)',
      width: 190,
      position: 'fixed',
    },
  },
  sideNavMini: {
    width: 0,
    visibility: 'hidden',
    [theme.breakpoints.up('sm')]: {
      visibility: 'visible',
      width: 50,
    },
  },
  label: {
    color: theme.palette.accent[200],
    flex: 1,
    textTransform: 'none',
    visibility: 'visible',
    opacity: 1,
    transition: theme.transitions.create(['visibility', 'opacity']),
  },
  labelMini: {
    opacity: 0,
    visibility: 'hidden',
    width: 0,
  },
  icon: {
    color: theme.palette.accent[200],
  },
  list: {
    flex: {
      grow: 1,
    },
  },
  listItem: {
    padding: 0,
    height: 48,
    borderLeftWidth: 3,
    borderLeft: 'solid transparent',
    '&:hover': {
      borderLeftWidth: 3,
      borderLeft: `solid ${theme.palette.primary[500]}`,
    },
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minWidth: 50,
    paddingTop: 0,
    paddingBottom: 0,
  },
  versionHide: {
    display: 'none',
  },
});

const sideNavItems = [
  {
    link: '/log',
    icon: 'file-text-o',
    label: 'Log',
  },
  {
    link: '/execute',
    icon: 'cog',
    label: 'Execute',
  },
  {
    link: '/config',
    icon: 'pencil',
    label: 'Config',
  },
  {
    link: '/history',
    icon: 'history',
    label: 'History',
  },
  {
    link: '/movies',
    icon: 'film',
    label: 'Movies',
  },
  {
    link: '/pending',
    icon: 'check',
    label: 'Pending',
  },
  {
    link: '/schedule',
    icon: 'calendar',
    label: 'Schedule',
  },
  {
    link: '/seen',
    icon: 'eye',
    label: 'Seen',
  },
  {
    link: '/series',
    icon: 'tv',
    label: 'Series',
  },
  {
    link: '/status',
    icon: 'heartbeat',
    label: 'Status',
  },
];

class SideNav extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    sideBarOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  };

  toggleOnMobile() {
    if (
      window.matchMedia &&
      window.matchMedia('(max-width: 600px)').matches
    ) {
      this.props.toggle();
    }
  }

  renderNavItems() {
    const { classes, sideBarOpen } = this.props;
    return sideNavItems.map(({ link, icon, label }) => (
      <Link to={link} key={link}>
        <ListItem className={classes.listItem} onClick={::this.toggleOnMobile}>
          <Button color="accent" className={classes.button}>
            <Icon className={classNames('fa', `fa-${icon}`, classes.icon)} />
            <p className={
              classNames(
                classes.label,
                { [classes.labelMini]: !sideBarOpen },
              )}
            >
              {label}
            </p>
          </Button>
        </ListItem>
      </Link>
    ));
  }

  render() {
    const { classes, sideBarOpen } = this.props;
    return (
      <Paper
        className={classNames(
          classes.listWrapper,
          { [classes.sideNavMini]: !sideBarOpen },
        )}
        elevation={16}
      >
        <List className={classes.list}>
          { ::this.renderNavItems() }
        </List>
        <div className={classNames({ [classes.versionHide]: !sideBarOpen })}>
          <Version />
        </div>
      </Paper>
    );
  }
}

export default withStyles(styleSheet)(SideNav);
