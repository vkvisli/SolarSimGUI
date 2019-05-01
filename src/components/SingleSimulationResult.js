/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';
import { AreaChart, Area, CartesianGrid, XAxis, ReferenceLine,
  YAxis, Tooltip, Label, Legend, ResponsiveContainer } from 'recharts';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/SaveAlt';

// The simulation results for one simulation
class SingleSimulationResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showCumulative: false,
      displayContent: null
    };

    this.createChart = this.createChart.bind(this);
    this.handleShowCumulativeChange = this.handleShowCumulativeChange.bind(this);
    this.unixToClockTime = this.unixToClockTime.bind(this);
  }

  // If the chart is pending an update, create a new chart and mark it as updated
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.simulation.updateChart) {
      this.setState({displayContent: this.createChart()});
      this.props.markChartAsUpdated();
    }
  }

  // Changes whether or not to show cumulative production profile, and updates chart
  async handleShowCumulativeChange() {
    await this.setState({showCumulative: !this.state.showCumulative});
    this.setState({displayContent: this.createChart()});
  }

  // Converts a UTC unix time stamp (seconds since Jan 1 1970)
  // into a clock time (e.g. "08:00")
  unixToClockTime(unixTimeStamp) {
    let date = new Date(unixTimeStamp * 1000);
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let hoursString = hours.toString().length === 1 ? "0" + hours : hours;
    let minutesString = minutes.toString().length === 1 ? "0" + minutes : minutes;
    return hoursString + ":" + minutesString;
  }

  // Prepare PV data and return the chart to display
  createChart() {

    // Simulation result info (from API response)
    let prod = this.props.simulation.result.simulationResults.production.productionProfile;
    let prodOpt = this.props.simulation.result.simulationResults.production.productionProfileOpt;
    let cProd = this.props.simulation.result.simulationResults.production.cProductionProfile;
    let cProdOpt = this.props.simulation.result.simulationResults.production.cProductionProfileOpt;
    let consumption = this.props.simulation.result.simulationResults.consumption.consumptionProfile;
    let cConsumption = this.props.simulation.result.simulationResults.consumption.cConsumptionProfile;
    let aoi = this.props.simulation.result.simulationResults.production.aoiProfile;
    let sunRise = this.props.simulation.result.simulationResults.production.sunRise;
    let sunSet = this.props.simulation.result.simulationResults.production.sunSet;

    // Generate data objects for cumulative profiles
    let dataObjects = [];
    const unixTimeStart = this.props.scenario.unixTimeStart;

    const prodInterval = this.props.simulation.result.simulationResults.production.productionInterval;
    const optInterval = this.props.simulation.result.simulationResults.production.productionIntervalOpt;
    const consInterval = this.props.simulation.result.simulationResults.consumption.consumptionInterval;
    const aoiInterval = this.props.simulation.result.simulationResults.production.aoiInterval;
    let prodIndex = 0;
    let optIndex = 0;
    let consIndex = 0;
    let aoiIndex = 0;
    let time = unixTimeStart;

    // Iterate every minute of a day and generate the values to plot in chart
    for (let i=0; i<1440; i++ ){

      let prodTimeString = this.unixToClockTime(unixTimeStart + (prodIndex * prodInterval * 60));
      let optTimeString = this.unixToClockTime(unixTimeStart + (optIndex * optInterval * 60));
      let aoiTimeString = this.unixToClockTime(unixTimeStart + (aoiIndex * aoiInterval * 60));
      let consTimeString = this.unixToClockTime(unixTimeStart + (consIndex * consInterval * 60));
      let timeString = this.unixToClockTime(time);

      let prodValue = null;
      let consValue = null;
      let optValue = null;

      // Get values from the cumulative profiles
      if (this.state.showCumulative) {

        if (prodTimeString === timeString && prodIndex < cProd.length-1) {
          prodValue = cProd[prodIndex].toFixed(5);
          prodIndex++;
        }
        if (optTimeString === timeString && optIndex < cProdOpt.length-1) {
          optValue = cProdOpt[optIndex].toFixed(5);
          optIndex++;
        }
        if (consTimeString === timeString && consIndex < cConsumption.length-1) {
          consValue = cConsumption[consIndex].toFixed(5);
          consIndex++;
        }

      } else {
        // Get values from the non-cumulative profiles
        if (prodTimeString === timeString && prodIndex < prod.length-1) {
          prodValue = prod[prodIndex].toFixed(5);
          prodIndex++;
        }
        if (optTimeString === timeString && optIndex < prodOpt.length-1) {
          optValue = prodOpt[optIndex].toFixed(5);
          optIndex++;
        }
        if (consTimeString === timeString && consIndex < consumption.length-1) {
          consValue = consumption[consIndex].toFixed(5);
          consIndex++;
        }
      }

      let aoiValue = aoi[aoiIndex].toFixed(5);
      if (aoiTimeString === timeString && aoiIndex < aoi.length-1)
        aoiIndex++;

      dataObjects.push({
        "Generation": prodValue,
        "Optimal generation": optValue,
        "Consumption": consValue,
        "Angle of incidence": aoiValue,
        "Time": timeString
      });

      time += 60;
    }

    // Create a reference line for the time of sunrise
    // (unix time is converted to corresponding index in the array of data objects)
    if (sunRise !== null) {
      var sunRiseLine = (
        <ReferenceLine
          x={this.unixToClockTime(sunRise)}
          stroke="green"
          label="Sunrise"
          strokeDasharray="3 3"/>
      );
    }

    // Create a reference line for the time of sunset
    // (unix time is converted to corresponding index in the array of data objects)
    if (sunSet !== null) {
      var sunSetLine = (
        <ReferenceLine
          x={this.unixToClockTime(sunSet)}
          stroke="Red"
          label="Sunset"
          strokeDasharray="3 3"/>
      );
    }

    // Return the area chart to display the PV data
    return (
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart data={dataObjects}>
          <CartesianGrid stroke="#eeeeee"/>
          <Legend verticalAlign="top" height={50}/>

          <Area
            animationDuration={250}
            animationEasing="linear"
            unit={this.state.showCumulative ? " kWh" : " kW"}
            dot={false}
            type="monotone"
            connectNulls
            dataKey="Optimal generation"
            stroke="#c1c1c1"
            fillOpacity={0}/>

          <Area
            animationDuration={250}
            animationEasing="linear"
            unit={this.state.showCumulative ? " kWh" : " kW" }
            dot={false}
            type="monotone"
            connectNulls
            dataKey="Generation"
            stroke="#039e00"
            fill="#afffb4"/>

          <Area
            animationDuration={250}
            animationEasing="linear"
            unit={this.state.showCumulative ? " kWh" : " kW"}
            dot={false}
            type="monotone"
            connectNulls
            dataKey="Consumption"
            stroke="#ff0000"
            fill="#ffdddd"/>

          <Area
            animationDuration={250}
            animationEasing="linear"
            unit="°"
            dot={false}
            type="monotone"
            connectNulls
            dataKey="Angle of incidence"
            yAxisId="aoiAxis"
            stroke="#0043ff"
            fillOpacity={0}/>

          {sunRiseLine}
          {sunSetLine}

          <XAxis
            dataKey="Time"
            ticks={["02:00", "04:00", "06:00", "08:00", "10:00",
              "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]}>
          </XAxis>

          <YAxis>
            <Label
              value={this.state.showCumulative ? "kWh" : "kW"}
              offset={15}
              angle={0}
              position="top"/>
          </YAxis>

          <YAxis
            yAxisId="aoiAxis"
            dataKey="Angle of incidence"
            orientation="right"
            ticks={[0, 45, 90, 135, 180]}>
            <Label value="degrees" offset={15} angle={0} position="top"/>
          </YAxis>

          <Tooltip
            contentStyle={{fontSize: "0.8em"}}
            offset={50}
            animationDuration={0}
            filterNull={false}/>

        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Download a JSON file to the client using an 'a' tag
  downloadResultFile(filename, content) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  render() {

    if (this.props.simulation.result === "") {
      return (
        <Collapse style={{textAlign: "center"}} in={this.props.simulation.loading}>
          <CircularProgress size={40}/>
          <p style={{fontSize: "0.8em"}}>Loading a new simulation</p>
        </Collapse>
      );
    } else {
      return (
        <div>

          {/* Loading animation for simulation */}
          <Collapse style={{textAlign: "center"}} in={this.props.simulation.loading}>
            <CircularProgress size={40}/>
            <p style={{fontSize: "0.8em"}}>Loading a new simulation</p>
          </Collapse>

          {/* display content (chart) */}
          <Collapse in={this.state.displayContent != null}>
            {this.state.displayContent}

            {/* Button for saving simulation results as a file */}
            <Button
              color="primary"
              variant="outlined"
              onClick={() =>
                this.downloadResultFile("result.json", this.props.simulation.result.toPrettyString())
              }>
              Save
              <SaveIcon style={{marginLeft: 10}} />
            </Button>

            {/* Checkbox for cumulative / normal profiles */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.showCumulative}
                  onChange={this.handleShowCumulativeChange}
                  color="primary"/>
              }
              label="Cumulative"
              style={{float: "right"}}/>

          </Collapse>

        </div>
      );
    }
  }
}

export default SingleSimulationResult;
