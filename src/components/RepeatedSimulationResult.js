/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import Collapse from '@material-ui/core/Collapse';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/SaveAlt';

// The simulation results for iterative simulations
class RepeatedSimulationResult extends Component {


  constructor(props) {
    super(props);
    this.downloadResultFile = this.downloadResultFile.bind(this);
    this.createDisplayContent = this.createDisplayContent.bind(this);
  }

  // Download a file to the client using an 'a' tag
  downloadResultFile(filename, content) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Return content to display the simulation results
  createDisplayContent(simulationResults) {
    let result = [];

    // Add download/save button
    result.push(
      <Button
        key="saveButton"
        color="primary"
        variant="outlined"
        onClick={() =>
          this.downloadResultFile("result.json", this.props.repeatedSimulation.result.toPrettyString())
        }>
        Save
        <SaveIcon style={{marginLeft: 10}} />
      </Button>
    );

    // Add a result row for each simulation
    for (let i = 0; i < simulationResults.length; i++) {
      let containerClassName = (i % 2) ? "RepeatedSimulationResultRowOdd" : "RepeatedSimulationResultRowEven";
      result.push(
        <div className={containerClassName} key={i}>
          <b>{i + 1}</b> <br/>
          Total PV production: {simulationResults[i].totalProductionkWh.toFixed(2)} kWh <br/>
          Total consumption: {simulationResults[i].totalConsumptionkWh.toFixed(2)} kWh <br/>
        </div>
      );
    }

    return result;
  }

  render() {

    let resultsToDisplay = this.props.repeatedSimulation.result.displayObjects;
    if (resultsToDisplay)
      var simulationResultsDisplay = this.createDisplayContent(resultsToDisplay);

    return (
      <div>

        <Collapse style={{textAlign: "center"}} in={this.props.repeatedSimulation.loading}>
          <LinearProgress
            variant="determinate"
            value={this.props.repeatedSimulation.progress}
            style={{margin: 50}}/>
          <p style={{fontSize: "0.8em"}}>
            Loading {this.props.repeatedSimulation.iterations} new simulations
            ({this.props.repeatedSimulation.progress.toFixed(0)} %)
          </p>
        </Collapse>

        {simulationResultsDisplay}

      </div>
    );
  }
}

export default RepeatedSimulationResult;
