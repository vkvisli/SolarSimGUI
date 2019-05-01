/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

class AboutDialog extends Component {

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description" >

        {/* Title */}
        <DialogTitle id="form-dialog-title">
          About
        </DialogTitle>

        {/* Content */}
        <DialogContent>
          SolarSim is an application developed as part of&nbsp;
          <a href="https://www.linkedin.com/in/vebj%C3%B8rn-kvisli-055081b3/">
            Vebjørn Kvisli
          </a>
          's master thesis at&nbsp;
          <a href="https://www.mn.uio.no/ifi/english/">
            University of Oslo, Department of Informatics
          </a>
          . <br/> <br/>

          SolarSim simulates the production and consumption of energy from shared PV system's
          in apartment buildings. It is a tool that can help to better understand how
          PV technology and smart control systems for demand-side management can improve the
          utilization of solar energy in urban environments. <br/> <br/>

          SolarSim performs automatic appliance load scheduling for washing machines
          and dishwashers based on the amount of PV production throughout a day,
          and tries to minimize the need to buy electricity from the public grid.
        </DialogContent>

        {/* OK button */}
        <DialogActions>
          <Button
            onClick={this.props.handleClose}
            color="primary"
            autoFocus>
            ok
          </Button>
        </DialogActions>

      </Dialog>
    );
  }
}

export default AboutDialog;
