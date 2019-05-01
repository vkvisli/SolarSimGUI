/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import Button from "@material-ui/core/Button";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RepeatIcon from '@material-ui/icons/Repeat';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import WeatherIcon from "./WeatherIcon.js";
import CircularProgress from '@material-ui/core/CircularProgress';

class ScenarioSelecter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      maxCapacity: 10000,
      minTilt: 0,
      maxTilt: 90,
      minOrientation: -180,
      maxOrientation: 180,
      minUnixTimeStart: 0,
      maxUnixTimeStart: 10000000000,
      minLat: -90,
      maxLat: 90,
      minLong: -180,
      maxLong: 180,
      useCurrentTime: true,
      useCurrentLocation: true,
      tempPosString: "",
      tempDateString: "",
      defaultDatePickerString: "",
      useRepeatSimulation: false,
      scenarioParameterHelperOpen: false
    };

    this.handleUseCurrentTimeChange = this.handleUseCurrentTimeChange.bind(this);
    this.handleUseCurrentLocationChange = this.handleUseCurrentLocationChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.getCurrentPos = this.getCurrentPos.bind(this);
    this.updateTimeAndLocation = this.updateTimeAndLocation.bind(this);
    this.setTempPosString = this.setTempPosString.bind(this);
    this.setTempDateString = this.setTempDateString.bind(this);
    this.getDefaultDatePickerString = this.getDefaultDatePickerString.bind(this);
    this.handleRepeatSimulationChange = this.handleRepeatSimulationChange.bind(this);
    this.handleOpenParamHelper = this.handleOpenParamHelper.bind(this);
  }

  // This runs once component has mounted
  componentDidMount() {
    this.setTempPosString();
    this.setTempDateString();

    // Add a mouse click listener to close scenario parameter helper tooltip, if open
    document.addEventListener("mousedown", () => {
      if (this.state.scenarioParameterHelperOpen)
        this.setState({scenarioParameterHelperOpen: false});
    }, false);
  }

  // Opens the tooltip for scenario parameter helper text
  handleOpenParamHelper() {
    this.setState({scenarioParameterHelperOpen: true});
  }

  // Returns the date specified in props, with the required format for a datepicker
  getDefaultDatePickerString() {
    let date = new Date(this.props.scenario.unixTimeStart * 1000);
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();

    if (month.toString().length === 1)
      month = "0" + month;
    if (day.toString().length === 1)
      day = "0" + day;

    return year + "-" + month + "-" + day;
  }

  // Returns the position, an error, or nothing as parameter to the given callback function
  getCurrentPos(callback) {
    let success = function(loc) { callback(loc); };
    let error = function(error) { callback() };

    if ("geolocation" in navigator)
      navigator.geolocation.getCurrentPosition(success, error);
    else
      callback();
  }

  // Checks whether to use current date and sets "tempDateString"
  setTempDateString() {
    if (this.state.useCurrentTime) {
      let d = new Date();
      let dateString = "(" + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + ")";
      this.setState({tempDateString: dateString});
    } else {
      this.setState({tempDateString: ""});
    }
  }

  // Checks or unchecks 'useCurrentTime'
  async handleUseCurrentTimeChange() {
    await this.setState({useCurrentTime: !this.state.useCurrentTime});
    await this.setTempDateString();
    this.props.changeScenarioParam("unixTimeStart", new Date().setUTCHours(0,0,0,0) / 1000);
  }

  // Checks whether to use current location and sets "tempPosString"
  setTempPosString() {
    if (this.state.useCurrentLocation) {
      this.setState({tempPosString: <CircularProgress size={15}/>});
      this.getCurrentPos(pos => {
        if (pos) {
          this.setState({
            tempPosString: "(" + pos.coords.latitude.toFixed(1) +
              ", " + pos.coords.longitude.toFixed(1) + ")"
          });
        } else {
          this.setState({tempPosString: "N/A"});
        }
      });
    } else {
      this.setState({tempPosString: ""});
    }
  }

  // Checks or unchecks 'useCurrentLocation' and sets temp. position string
  async handleUseCurrentLocationChange() {
    await this.setState({useCurrentLocation: !this.state.useCurrentLocation});
    this.setTempPosString();

    if (!this.state.useCurrentLocation) {
      await this.props.changeScenarioParam("lat", 0);
      await this.props.changeScenarioParam("long", 0);
    }
  }

  // Updates time and location in upper state.
  // When done, callback is fired with true if successful
  async updateTimeAndLocation(callback) {

    // Update time
    if (this.state.useCurrentTime) {
      await this.props.changeScenarioParam("unixTimeStart", new Date().setUTCHours(0,0,0,0) / 1000);
    } else {
      if (isNaN(this.props.scenario.unixTimeStart)) {
        alert("The date you entered is not valid. \nPlease pick another one.");
        callback(false);
        return;
      }
    }

    // Update location and corresponding time zone offset
    if (this.state.useCurrentLocation) {

      // Local time zone offset in hours (from system settings)
      let timeZoneOffset = (new Date().getTimezoneOffset() / 60) * -1;
      await this.props.changeScenarioParam("timeZoneOffset", timeZoneOffset);

      let updateFunction = this.props.changeScenarioParam;
      this.getCurrentPos(async (pos) => {
        if (pos) {
          await updateFunction("lat", pos.coords.latitude);
          await updateFunction("long", pos.coords.longitude);
          callback(true);
        } else {
          alert("Sorry, your current position was not available");
          callback(false);
        }
      });
    } else {
      let validLat = (this.props.scenario.lat >= -90 && this.props.scenario.lat <= 90);
      let validLong = (this.props.scenario.long >= -180 && this.props.scenario.long <= 180);
      if (validLat && validLong) {
        // Time zone offset for the given longitude
        let timeZoneOffset = Math.round(this.props.scenario.long / 15);
        await this.props.changeScenarioParam("timeZoneOffset", timeZoneOffset);
        callback(true);
      } else {
        alert("The coordinates you entered are not valid.");
        callback(false);
      }
    }
  }

  // Updates time and location and starts simulation
  handleStart(repeat) {
    // Check if pv capacity is 0
    if (this.props.scenario.pvCapacity === 0) {
      alert("Please set a value for the PV's rated output");
      return;
    }

    this.updateTimeAndLocation(ready => {
      if (ready) {
        if (repeat)
          this.props.repeatedStart();
        else
          this.props.start();
      }
    });
  }

  handleRepeatSimulationChange() {
    this.setState({useRepeatSimulation: !this.state.useRepeatSimulation});
  }

  render() {

    // Tooltip text
    const parameterHelperText = (
      <div>
        <p className="tooltipFont">
          <b>Rated output at STC (kW)</b> <br/>
          The PV system's total rated output at Standard Test Conditions in kilowatt.
        </p>
        <p className="tooltipFont">
          <b>Vertical tilt</b> <br/>
          The tilt angle of the PV system in degrees. <br/>
          Horizontal: 0° <br/>
          Vertical: 90°
        </p>
        <p className="tooltipFont">
          <b>Horizontal orientation</b> <br/>
          The orientation angle (azimuth) of the PV system in degrees. <br/>
          South: 0° <br/>
          North: 180° / -180° <br/>
          East: -90° <br/>
          West: 90°
        </p>
      </div>
    );

    const datePicker = (
      <FormControl>
        <TextField
          variant="outlined"
          label="Start date"
          type="date"
          value={this.getDefaultDatePickerString()}
          onChange={(e) => {
            const time = new Date(e.target.value).getTime() / 1000;
            if (time >= this.state.minUnixTimeStart && time <= this.state.maxUnixTimeStart)
              this.props.changeScenarioParam("unixTimeStart", time);
          }}
        />
      </FormControl>
    );

    const latitudeInput = (
      <FormControl>
        <TextField
          variant="outlined"
          label="Latitude °"
          type="number"
          style={{width: 100, marginRight: 5, marginBottom: 10}}
          value={this.props.scenario.lat}
          onChange={(e) => {
            if (e.target.value >= this.state.minLat && e.target.value <= this.state.maxLat)
              this.props.changeScenarioParam("lat", Number(e.target.value));
          }}
        />
      </FormControl>
    );

    const longitudeInput = (
      <FormControl>
        <TextField
          variant="outlined"
          label="Longitude °"
          type="number"
          style={{width: 100, marginBottom: 10}}
          value={this.props.scenario.long}
          onChange={(e) => {
            if (e.target.value >= this.state.minLong && e.target.value <= this.state.maxLong)
              this.props.changeScenarioParam("long", Number(e.target.value));
          }}
        />
      </FormControl>
    );

    var startButton = (
      <Button
        variant="contained"
        color="primary"
        className="scenarioParamInput"
        disabled={this.props.simulation.loading}
        onClick={() => this.handleStart(false)}>
        Start Simulation
        {
          this.props.simulation.loading ?
            <CircularProgress size={20} color="secondary" style={{marginLeft: 10}}/> :
            <PlayArrowIcon style={{marginLeft: 10}}/>
        }
      </Button>
    );

    let startRepeatedButton = (
      <Button
        variant="contained"
        color="primary"
        className="scenarioParamInput"
        disabled={this.props.repeatedSimulation.loading}
        onClick={() => this.handleStart(true)}>
        Start Simulation
        {
          this.props.repeatedSimulation.loading ?
            <CircularProgress size={20} color="secondary" style={{marginLeft: 10}}/> :
            <RepeatIcon style={{marginLeft: 10}}/>
        }
      </Button>
    );

    let iterationInput = (
      <FormControl>
        <TextField
          type="number"
          style={{width: 45, marginRight: 10}}
          value={this.props.repeatedSimulation.iterations}
          onChange={(e) => this.props.updateRepeatIterations(Number(e.target.value))}
        />
      </FormControl>
    );

    return (
      <div className="scenarioSelecter">
        <form className="scenarioSelectionForm" noValidate>

          {/* Buttons to start simulation */}
          {this.state.useRepeatSimulation ? startRepeatedButton : startButton }

          {/* Checkbox for repeating simulation */}
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={this.props.simulation.loading || this.props.repeatedSimulation.loading}
                  checked={this.state.useRepeatSimulation}
                  onChange={this.handleRepeatSimulationChange}
                  color="primary" />
              }
              label="Repeat" />

            {this.state.useRepeatSimulation ? iterationInput : ""}
            {this.state.useRepeatSimulation ? "times" : ""}

          </div>

          <div className="scenarioParamCategoryHeader">PV System</div>

          {/* PV capacity (kWh) */}
          <FormControl className="scenarioParamInput">
            <TextField
              className="scenarioParamInput"
              value={this.props.scenario.pvCapacity}
              type="number"
              onChange={(e)=> {
                if (e.target.value >= 0 && e.target.value <= this.state.maxCapacity)
                  this.props.changeScenarioParam("pvCapacity", Number(e.target.value));
              }}
              label="Rated output at STC (kW)"/>
          </FormControl>

          {/* PV tilt angle */}
          <FormControl className="scenarioParamInput">
            <TextField
              className="scenarioParamInput"
              value={this.props.scenario.pvTilt}
              type="number"
              onChange={(e)=> {
                if (e.target.value >= this.state.minTilt && e.target.value <= this.state.maxTilt)
                  this.props.changeScenarioParam("pvTilt", Number(e.target.value));
              }}
              label="Vertical tilt"/>
          </FormControl>

          {/* PV orientation */}
          <FormControl className="scenarioParamInput">
            <TextField
              className="scenarioParamInput"
              value={this.props.scenario.pvOrientation}
              type="number"
              onChange={(e)=> {
                if (e.target.value >= this.state.minOrientation && e.target.value <= this.state.maxOrientation)
                  this.props.changeScenarioParam("pvOrientation", Number(e.target.value));
              }}
              label="Horizontal orientation"/>
          </FormControl>

          {/* Helper icon to display text explaining the various scenario parameters */}
          <Tooltip
            open={this.state.scenarioParameterHelperOpen}
            title={parameterHelperText}
            onClick={this.handleOpenParamHelper}
            style={{marginTop: 10, cursor: "pointer"}}>
            <HelpOutlineIcon
              color={this.state.scenarioParameterHelperOpen ? "primary" : "action"}
              fontSize="small"/>
          </Tooltip>

          <div className="scenarioParamCategoryHeader">Simulation environment</div>

          {/* Weather */}
          <FormControl className="scenarioParamInput">
            <InputLabel>Weather</InputLabel>
            <Select
              className="scenarioParamInput"
              value={this.props.scenario.weather}
              onChange={(e)=>this.props.changeScenarioParam("weather", e.target.value)}
              autoWidth={true}>
              <MenuItem value={"sunny"}>
                <WeatherIcon weather={"sunny"} size={45}/>
                <span style={{verticalAlign: 15}}>Sunny</span>
              </MenuItem>
              <MenuItem value={"partially cloudy"}>
                <WeatherIcon weather={"partially cloudy"} size={45} />
                <span style={{verticalAlign: 15}}>Partially cloudy</span>
              </MenuItem>
              <MenuItem value={"cloudy"}>
                <WeatherIcon weather={"cloudy"} size={45} />
                <span style={{verticalAlign: 15}}>Cloudy</span>
              </MenuItem>
              <MenuItem value={"rainy"}>
                <WeatherIcon weather={"rainy"} size={45} />
                <span style={{verticalAlign: 15}}>Rainy</span>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Checkbox for using current time */}
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.useCurrentTime}
                  onChange={this.handleUseCurrentTimeChange}
                  color="primary" />
              }
              label="Today" />
            <div className="datePosText"> {this.state.tempDateString} </div>
          </div>

          {/* Date picker */}
          {this.state.useCurrentTime ? null : datePicker}

          {/* Checkbox for using current location */}
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.useCurrentLocation}
                  onChange={this.handleUseCurrentLocationChange}
                  color="primary" />
              }
              label="My location" />
            <div className="datePosText"> {this.state.tempPosString} </div>
          </div>

          {/* Latitude and longitude inputs */}
          {this.state.useCurrentLocation ? null : latitudeInput}
          {this.state.useCurrentLocation ? null : longitudeInput}

        </form>
      </div>
    );
  }
}

export default ScenarioSelecter;
