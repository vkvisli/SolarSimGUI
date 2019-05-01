/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import ScenarioSelecter from "./ScenarioSelecter.js";
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";

// scenario selector for small displays
class ScenarioSelecterMobile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: true
    };
    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse() {
    this.setState({
      collapseOpen: !this.state.collapseOpen
    });
  }

  render() {
    const arrowUp = <KeyboardArrowUp style={{verticalAlign: "middle"}}/>;
    const arrowDown = <KeyboardArrowDown style={{verticalAlign: "middle"}}/>;

    return (
      <div className="scenarioSelecterMobile">
        <Collapse in={this.state.collapseOpen}>
          <ScenarioSelecter
            start = {this.props.start}
            repeatedStart = {this.props.repeatedStart}
            changeScenarioParam = {this.props.changeScenarioParam}
            updateRepeatIterations = {this.props.updateRepeatIterations}
            scenario = {this.props.scenario}
            apartments = {this.props.apartments}
            simulation = {this.props.simulation}
            repeatedSimulation = {this.props.repeatedSimulation}/>
        </Collapse>

        <div style={{float: "right", cursor: "pointer"}} onClick={this.handleCollapse}>
          Scenario parameters
          {this.state.collapseOpen ? arrowUp : arrowDown}
        </div>
      </div>
    );
  }
}

export default ScenarioSelecterMobile;
