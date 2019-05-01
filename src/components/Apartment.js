/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import WMIcon from "../images/WM_icon_128.png";
import DWIcon from "../images/DW_icon_128.png";
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import ApplianceRun from "../models/ApplianceRun.js";
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InfoIcon from '@material-ui/icons/Info';

// The Apartment component renders a 'card' for the apartment, and displays
// info about its appliance runs. It also keeps track of restorable changes
// to the appliance runs in state using 'temporary' appliance runs.
class Apartment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      useOnAllAptsChecked: false,
      tempApplianceRuns: this.props.apartment.applianceRuns,
      tempPeople: this.props.apartment.nPeople,
      tempM2: this.props.apartment.m2,
      maxAptSizeM2: 1000,
      maxApplianceRuns: 4,
      showParamNotUsedWarning: false
    };

    this.handleOpenDialog = this.handleOpenDialog.bind(this);
    this.handleCancelDialog = this.handleCancelDialog.bind(this);
    this.handleSaveChanges = this.handleSaveChanges.bind(this);
    this.handleTempApplianceRunChange = this.handleTempApplianceRunChange.bind(this);
    this.handleTempPeopleChange = this.handleTempPeopleChange.bind(this);
    this.handleTempM2Change = this.handleTempM2Change.bind(this);
    this.handleDeleteApplianceRun = this.handleDeleteApplianceRun.bind(this);
    this.handleAddApplianceRun = this.handleAddApplianceRun.bind(this);
    this.handleClearApplianceRuns = this.handleClearApplianceRuns.bind(this);
    this.generateApplianceRunRows = this.generateApplianceRunRows.bind(this);
    this.handleUseOnAllAptsCheck = this.handleUseOnAllAptsCheck.bind(this);
    this.refreshTempApplianceRuns = this.refreshTempApplianceRuns.bind(this);
    this.handleOpenParamNotUsedWarning = this.handleOpenParamNotUsedWarning.bind(this);
  }

  // Shows a warning that says that number of people and m2 of an
  // apartment is not used
  handleOpenParamNotUsedWarning() {
    this.setState({showParamNotUsedWarning: !this.state.showParamNotUsedWarning});
  }

  // Sets dialog window to open
  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      tempApplianceRuns: this.props.apartment.applianceRuns
    });
  }

  // Sets dialog window to closed and resets the temporary programs in state
  handleCancelDialog() {
    this.setState({
      dialogOpen: false,
      tempApplianceRuns: this.props.apartment.applianceRuns,
      tempPeople: this.props.apartment.nPeople,
      tempM2: this.props.apartment.m2
    });
  }

  // Saves the appliance run changes made in the dialog window and closes it
  handleSaveChanges() {
    const id = this.props.apartment.id;
    const newApplianceRuns = this.state.tempApplianceRuns;
    const useOnAllApts = this.state.useOnAllAptsChecked;
    const nPeople = this.state.tempPeople;
    const m2 = this.state.tempM2;
    this.props.updateApartment(id, newApplianceRuns, nPeople, m2, useOnAllApts);
    // TODO: Should refresh temp values after a save on all apts
    //this.refreshTempApplianceRuns();
    this.setState({ dialogOpen: false });
  }

  // Updates temp. appliance runs for this apartment
  refreshTempApplianceRuns() {
    this.setState({ tempApplianceRuns: this.props.apartment.applianceRuns });
  }

  // Changes a specific temp. appliance run in the state
  handleTempApplianceRunChange(id, key, value) {
    let tempApplianceRuns = [...this.state.tempApplianceRuns];
    let index = tempApplianceRuns.findIndex(tempAR => tempAR.id === id);
    tempApplianceRuns[index] = {...tempApplianceRuns[index], [key]: value};
    this.setState({ tempApplianceRuns: tempApplianceRuns });
  }

  // Changes the temp. number of people for this apartment in state
  handleTempPeopleChange(value) {
    this.setState({tempPeople: value});
  }

  // Changes the temp. apartment size for this apartment in state
  handleTempM2Change(value) {
    this.setState({tempM2: value});
  }

  // Deletes the specified temp. appliance run from state
  handleDeleteApplianceRun(id) {
    this.setState({
      tempApplianceRuns: this.state.tempApplianceRuns.filter(tempAR => tempAR.id !== id)
    });
  }

  // Adds a default appliance run with the given appliance type (code)
  handleAddApplianceRun(code) {

    if (this.state.tempApplianceRuns.length >= this.state.maxApplianceRuns)
      return;

    let applianceRun;
    switch (code) {
      case "wm":
        applianceRun = new ApplianceRun("wm", "40°", "07:00", "21:00"); break;
      case "dw":
        applianceRun = new ApplianceRun("dw", "normal", "07:00", "21:00"); break;
      default: break;
    }

    this.setState(prevState => ({
      tempApplianceRuns: [...prevState.tempApplianceRuns, applianceRun]
    }));
  }

  // Removes all temporary appliance runs from state
  handleClearApplianceRuns() {
    this.setState({
      tempApplianceRuns: []
    });
  }

  // Changes the checked status of the 'use on all apartments' checkbox
  handleUseOnAllAptsCheck() {
    this.setState({ useOnAllAptsChecked: !this.state.useOnAllAptsChecked });
  }

  // Returns a list of html rows for each appliance run
  generateApplianceRunRows() {
    let runs = this.props.apartment.applianceRuns;
    let applianceRunRows = [];

    // Loop through appliance runs and generate one row for each
    for (let i=0; i<runs.length; i++) {
      let iconSource;
      switch (runs[i].code) {
        case "wm": iconSource = WMIcon; break;
        case "dw": iconSource = DWIcon; break;
        default: iconSource = "";
      }

      // Appliance icon
      let icon = (
        <Tooltip title={runs[i].displayName} enterDelay={500}>
          <img src={iconSource} alt={runs[i].displayName} width={30}/>
        </Tooltip>
      );

      // The program of the current appliance run
      let applianceRunProgram = (
        <div className="applianceRunProgram"> {runs[i].program} </div>
      );

      // The start-stop time period for the current appliance run
      let applianceRunTimePeriod = (
        <div className="applianceRunTimePeriod">
          {runs[i].earliestStart + " - " + runs[i].doneBy}
        </div>
      );

      // create the row that displays the appliance run
      let applianceRunRow = (
        <div className="applianceRow" key={runs[i].id}>
          {icon}
          {applianceRunProgram}
          {applianceRunTimePeriod}
        </div>
      );

      // Add the row to the list of rows
      applianceRunRows.push(applianceRunRow);
    }

    // Set a message to tell if there are no appliance runs
    if (applianceRunRows.length === 0) {
      applianceRunRows.push(
        <div className="noARmessage" key="0">No appliance runs</div>
      );
    }

    return applianceRunRows;
  }

  render() {

    // Create input fields for each appliance run to show in update dialog
    var tempApplianceRuns = this.state.tempApplianceRuns;
    var applianceRunUpdateRows = [];
    for (let i=0; i<tempApplianceRuns.length; i++) {

      // Icon for washing machine
      var wmIcon = (
        <img src={WMIcon} alt={tempApplianceRuns[i].displayName} width={30}/>
      );

      // Icon for dishwasher
      var dwIcon = (
        <img src={DWIcon} alt={tempApplianceRuns[i].displayName} width={30}/>
      );

      // Selection input for washing machine program
      var wmProgramInput = (
        <div className="aptDialogInput">
          <FormControl>
            <InputLabel>program</InputLabel>
            <Select
              variant = "filled"
              value = {tempApplianceRuns[i].program}
              onChange = {(e) => this.handleTempApplianceRunChange(tempApplianceRuns[i].id, "program", e.target.value)}
              autoWidth = {true}>
              <MenuItem value={"30°"}>30°</MenuItem>
              <MenuItem value={"40°"}>40°</MenuItem>
              <MenuItem value={"60°"}>60°</MenuItem>
              <MenuItem value={"90°"}>90°</MenuItem>
              <MenuItem value={"30° short"}>30° short</MenuItem>
              <MenuItem value={"40° short"}>40° short</MenuItem>
              <MenuItem value={"60° short"}>60° short</MenuItem>
              <MenuItem value={"90° short"}>90° short</MenuItem>
            </Select>
          </FormControl>
        </div>
      );

      // Selection input for dishwasher program
      var dwProgramInput = (
        <div className="aptDialogInput">
          <FormControl>
            <InputLabel>program</InputLabel>
            <Select
              value = {tempApplianceRuns[i].program}
              onChange = {(e) => this.handleTempApplianceRunChange(tempApplianceRuns[i].id, "program", e.target.value)}
              autoWidth = {true}>
              <MenuItem value={"economic"}>Economic</MenuItem>
              <MenuItem value={"fast"}>Fast</MenuItem>
              <MenuItem value={"delicate"}>Delicate</MenuItem>
              <MenuItem value={"normal"}>Normal</MenuItem>
              <MenuItem value={"intensive"}>Intensive</MenuItem>
            </Select>
          </FormControl>
        </div>
      );

      // Text field input for earliest start time
      var earlyStartInput = (
        <div className="aptDialogInput">
          <FormControl>
            <TextField
              variant="outlined"
              label="start after"
              type="time"
              defaultValue={tempApplianceRuns[i].earliestStart}
              inputProps={{step: 600}}
              onChange = {(e) => this.handleTempApplianceRunChange(tempApplianceRuns[i].id, "earliestStart", e.target.value)} />
          </FormControl>
        </div>
      );

      // Text field input for done by time
      var doneByInput = (
        <div className="aptDialogInput">
          <FormControl>
            <TextField
              variant="outlined"
              label="done by"
              type="time"
              defaultValue={tempApplianceRuns[i].doneBy}
              inputProps={{step: 600}}
              onChange = {(e) => this.handleTempApplianceRunChange(tempApplianceRuns[i].id, "doneBy", e.target.value)} />
          </FormControl>
        </div>
      );

      // Delete icon to remove an appliance run
      var deleteInput = (
        <ClearIcon
          color="action"
          className="removeApplianceRun"
          fontSize="small"
          onClick={(e) => this.handleDeleteApplianceRun(tempApplianceRuns[i].id)}/>
      );

      // add icons and input fields depending on appliance type
      switch (tempApplianceRuns[i].code) {
        case "wm":
          applianceRunUpdateRows.push(
            <div className="applianceDialogRow" key={tempApplianceRuns[i].id}>
              {wmIcon}
              {wmProgramInput}
              {earlyStartInput}
              {doneByInput}
              {deleteInput}
            </div>
          );
          break;
        case "dw":
          applianceRunUpdateRows.push(
            <div className="applianceDialogRow" key={tempApplianceRuns[i].id}>
              {dwIcon}
              {dwProgramInput}
              {earlyStartInput}
              {doneByInput}
              {deleteInput}
            </div>
          );
          break;
        default: break;
      }
    }

    let apartmentWidth = 250;
    if (this.props.mobileScreen)
      apartmentWidth = "90%";

    return (

      <div className="apartment" style={{width: apartmentWidth}}>

        <div

          onClick={this.handleOpenDialog}>
          <div className="aptHeader"> {this.props.displayNumber} </div>
          {this.generateApplianceRunRows()}

          <div className="aptBottomLeftInfo">
            <PersonOutlineIcon style={{verticalAlign: "bottom"}}/>
            {this.props.apartment.nPeople}
            &nbsp;
            <span style={{color: "darkgrey"}}>|</span>
            &nbsp;
            {this.props.apartment.m2} m<sup>2</sup>
          </div>

          <DeleteOutlineIcon
            color="action"
            onClick={() => this.props.removeApt(this.props.apartment.id)}
            className="aptRemoveIcon"/>
        </div>


        {/* Dialog window for making changes to an apartment */}
        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleCancelDialog}
          aria-labelledby="form-dialog-title"
          aria-describedby="form-dialog-description"
          fullWidth
          scroll="body">

          <DialogTitle id="form-dialog-title">
            {"Apartment " + this.props.displayNumber}
          </DialogTitle>

          <DialogContent>

            {/* Buttons to add more appliance runs */}
            <Tooltip title="Add a washing machine run" enterDelay={500}>
              <Button
                onClick={(e) => this.handleAddApplianceRun("wm")}
                color="primary"
                variant="outlined">
                + <img src={WMIcon} alt="Add washing machine" width={30}/>
              </Button>
            </Tooltip>

            <Tooltip title="Add a dishwasher run" enterDelay={500}>
              <Button
                onClick={(e) => this.handleAddApplianceRun("dw")}
                color="primary"
                variant="outlined"
                style={{marginLeft: 10}}>
                + <img src={DWIcon} alt="Add dishwasher" width={30}/>
              </Button>
            </Tooltip>

            {/* Button to clear all appliance runs */}
            <Button
              onClick={this.handleClearApplianceRuns}
              color="default"
              variant="outlined"
              style={{marginLeft: 10, float: "right"}}>
              Clear
            </Button>

            {applianceRunUpdateRows}

            {/* Number of people input */}
            <div className="applianceDialogRow">
              <FormControl style={{marginRight: 20}}>
                <InputLabel><PersonOutlineIcon/></InputLabel>
                <Select
                    value = {this.state.tempPeople}
                    onChange = {(e) => this.handleTempPeopleChange(e.target.value)}>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5+</MenuItem>
                </Select>
              </FormControl>

            {/* apartment size (m2) input */}
              <FormControl style={{width: 70}}>
                <TextField
                    value={this.state.tempM2}
                    type="number"
                    label={<div>m<sup>2</sup></div>}
                    onChange={(e)=> {
                      if (e.target.value >= 0 && e.target.value <= this.state.maxAptSizeM2)
                        this.handleTempM2Change(Number(e.target.value));
                    }}/>
              </FormControl>

              <InfoIcon
                style={{marginTop: 20, cursor: "pointer"}}
                onClick={this.handleOpenParamNotUsedWarning}
                color="action"
                fontSize="small"/>

              {this.state.showParamNotUsedWarning ?
                <p style={{fontSize: "0.7em"}}>
                  Apartment's number of people and size does not affect the simulation results.
                  They are only included to illustrate how users can provide this information,
                  which in the future can be used to estimate apartment's background consumption
                </p> :
                ""
              }

            </div>

            {/* Checkbox for using appliance runs on all apartments */}
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked = {this.state.useOnAllAptsChecked}
                    onChange = {this.handleUseOnAllAptsCheck}
                    color = "primary"/>
                }
                label="Use for all apartments"/>
            </FormGroup>

          </DialogContent>

          <DialogActions>

            {/* Cancel button */}
            <Button
              onClick={this.handleCancelDialog}
              color="default"
              variant="outlined">
              Cancel
            </Button>

            {/* Save button */}
            <Button
              onClick={this.handleSaveChanges}
              color="primary"
              variant="contained"
              autoFocus>
              Save
            </Button>

          </DialogActions>

        </Dialog>

      </div>
    );
  }
}

export default Apartment;
