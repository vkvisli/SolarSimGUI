/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import Apartment from "./Apartment.js";
import ResultContainer from "./ResultContainer.js";
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import Button from "@material-ui/core/Button";

// Component that holds the simulation result container and apartments configuration
class Simulation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      apartmentsOpen: true,
      maxApts: 15
    };

    this.handleApartmentsOpenChange = this.handleApartmentsOpenChange.bind(this);
    this.addApt = this.addApt.bind(this);
  }

  // Adds a new default apartment if the number of apartments is below max
  addApt() {
    if (this.props.apartments.length < this.state.maxApts)
      this.props.addApt();
  }

  // Handles open and closing of the apartments collapse
  handleApartmentsOpenChange() {
    this.setState({apartmentsOpen: !this.state.apartmentsOpen});
  }

  render() {
    // Create an Apartment component for each apartment
    var apartments = [];
    for (var i=0; i<this.props.apartments.length; i++) {
      apartments.push(
        <Apartment
          scenario={this.props.scenario}
          apartment={this.props.apartments[i]}
          key={this.props.apartments[i].id}
          removeApt={this.props.removeApt}
          updateApartment = {this.props.updateApartment}
          displayNumber={i+1}
          mobileScreen = {this.props.mobileScreen}/>
      );
    }

    return (
      <div className="simulation">

        {/* Container to hold simulation results */}
        <ResultContainer
          scenario={this.props.scenario}
          simulation = {this.props.simulation}
          repeatedSimulation = {this.props.repeatedSimulation}
          markChartAsUpdated = {this.props.markChartAsUpdated} />

        {/* Container to hold apartment info */}
        <div className="apartmentContainer">

          {/* Add and clear apartments buttons */}
          <div className="apartmentButtonsContainer">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.addApt}>
              Add apartment
            </Button>
            <Button
              variant="outlined"
              onClick={this.props.clearApts}
              style={{marginLeft: 10}}>
              Clear
            </Button>
          </div>

          <div
            className="apartmentContainerHeader"
            onClick={this.handleApartmentsOpenChange}>
            <b> Apartments </b>
            ({this.props.apartments.length})
            {
              this.state.apartmentsOpen ?
                <KeyboardArrowUp style={{verticalAlign: "middle"}}/> :
                <KeyboardArrowDown style={{verticalAlign: "middle"}}/>
            }
          </div>

          <Collapse in={this.state.apartmentsOpen}>
            {apartments}
          </Collapse>
        </div>

      </div>
    );
  }
}

export default Simulation;
