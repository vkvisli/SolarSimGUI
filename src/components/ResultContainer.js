/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import RepeatedSimulationResult from "./RepeatedSimulationResult.js";
import SingleSimulationResult from "./SingleSimulationResult.js";

// Renders the outer simulation result component
class ResultContainer extends Component {

  render() {

    return (
      <div className="pvSystem">
        <div style={{marginBottom: 10, display: "inline-block"}}>
          <b> Simulation </b>
          ({this.props.scenario.pvCapacity} kW PV system)
        </div>

        <SingleSimulationResult
          simulation = {this.props.simulation}
          scenario = {this.props.scenario}
          markChartAsUpdated = {this.props.markChartAsUpdated} />

        <RepeatedSimulationResult
          repeatedSimulation = {this.props.repeatedSimulation}/>

      </div>
    );
  }
}

export default ResultContainer;
