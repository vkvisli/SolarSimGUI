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
import startButtonImage from "../images/howitworks_start_button.png";
import repeatImage from "../images/howitworks_repeat.png";
import scenarioPVImage from "../images/howitworks_scenario_PV.png";
import scenarioEnvImage from "../images/howitworks_scenario_env.png";
import apartmentImage from "../images/howitworks_apartment.png";
import resultImage from "../images/howitworks_result.png";

class HowItWorksDialog extends Component {

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description" >

        {/* Title */}
        <DialogTitle id="form-dialog-title">
          How it works
        </DialogTitle>

        {/* Content */}
        <DialogContent>
          <h4>1. Configure simulation scenario</h4>
          First, you need to configure the simulation scenario you want to use.
          This includes specifying the PV system's rated output, tilt, and orientation angles.
          You also need to select a weather type, a date and a location. Your current date
          and location is selected by default. <br/>
          <img src={scenarioPVImage} alt="PV scenario" width={200}/>
          <img src={scenarioEnvImage} alt="Environment scenario" width={200}/>
          <br/>

          <h4>2. Configure apartments and appliance runs</h4>
          Secondly, apartments and their appliance runs can be configured to represent
          the electricity consumers. Each apartment can be configured individually,
          and if you want the same configuration on all apartments,
          check the box 'use for all apartments' and save. <br/>
          <img src={apartmentImage} alt="apartment configuration" width={400}/> <br/>
          <br/>

          <h4>3. Start simulation</h4>
          When you are ready, hit the green start button to start the simulation. <br/>
          <img src={startButtonImage} alt="start" width={200}/> <br/>
          If you want to perform multiple simulations, check the box 'Repeat'
          and specify a number of iterations. <br/>
          <img src={repeatImage} alt="repeat" width={200}/>
          <br/>

          <h4>4. Inspect the results</h4>
          Once the simulation is finished, you can study the results in the provided
          chart. It shows the production, theoretically optimal production, consumption,
          and the sun's angle of incidence throughout the day. Check the box 'Cumulative'
          to see an accumulated version of the results. <br/> <br/>

          If multiple simulations was performed, a list of key result values
          are displayed instead. The results can be downloaded in a file by
          clicking the save button. <br/>
          <img src={resultImage} alt="simulation result" width={500}/> <br/>

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

export default HowItWorksDialog;
