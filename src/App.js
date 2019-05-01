/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import './styles/App.css';
import AboutDialog from "./components/AboutDialog.js";
import Apartment from "./models/Apartment.js";
import HowItWorksDialog from "./components/HowItWorksDialog.js";
import ScenarioSelecter from "./components/ScenarioSelecter.js";
import ScenarioSelecterMobile from "./components/ScenarioSelecterMobile.js";
import MediaQuery from "react-responsive";
import Simulation from "./components/Simulation.js";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import RepeatedSimulationResult from "./models/RepeatedSimulationResult.js";
import SingleSimulationResult from "./models/SingleSimulationResult.js";
import sunnyImage from "./images/sunny_header.png";

const API_URL = "https://api-dot-solarsim.appspot.com";
//const API_URL = "http://localhost:8080"; // For local testing

class App extends Component {

  constructor() {
    super();

    this.state = {
      // Default scenario parameters
      scenario: {
        weather: "sunny",
        pvCapacity: 10,
        pvTilt: 40,
        pvOrientation: 0,
        unixTimeStart: new Date().setUTCHours(0,0,0,0) / 1000,
        lat: 0,
        long: 0,
        timeZoneOffset: 0
      },
      apartments: [],
      simulation: {
        loading: false,
        updateChart: false,
        result: ""
      },
      repeatedSimulation: {
        iterations: 3,
        iterationsComplete: 0,
        loading: false,
        progress: 0,
        result: ""
      },
      aboutDialogOpen: false,
      howItWorksDialogOpen: false
    };

    this.openHowItWorksDialog = this.openHowItWorksDialog.bind(this);
    this.openAboutDialog = this.openAboutDialog.bind(this);
    this.closeDialogs = this.closeDialogs.bind(this);
    this.changeScenarioParam = this.changeScenarioParam.bind(this);
    this.updateRepeatIterations = this.updateRepeatIterations.bind(this);
    this.markChartAsUpdated = this.markChartAsUpdated.bind(this);
    this.startSimulation = this.startSimulation.bind(this);
    this.repeatSimulation = this.repeatSimulation.bind(this);
    this.setRepeatedSimulationResult = this.setRepeatedSimulationResult.bind(this);
    this.addApartment = this.addApartment.bind(this);
    this.generateAptID = this.generateAptID.bind(this);
    this.removeApt = this.removeApt.bind(this);
    this.clearApts = this.clearApts.bind(this);
    this.updateApartment = this.updateApartment.bind(this);
  }

  // Add a few initial apartments when component has mounted
  componentDidMount() {
    for (var i=0; i<6; i++)
      this.addApartment();
  }

  // Closes dialog windows that are open
  closeDialogs() {
    this.setState({
      aboutDialogOpen: false,
      howItWorksDialogOpen: false
    });
  }

  // Opens the 'about' dialog window
  openAboutDialog() {
    this.setState({
      aboutDialogOpen: true
    });
  }

  // Opens the 'How it works' dialog window
  openHowItWorksDialog() {
    this.setState({
      howItWorksDialogOpen: true
    });
  }

  // Adds a default apartment to the list of apartments in the state
  addApartment() {
    const defaultAptPeople = 3;
    const defaultAptM2 = 50;
    this.setState(prevState => ({
      apartments: [...prevState.apartments,
        new Apartment(this.generateAptID(), defaultAptPeople, defaultAptM2)
      ]
    }));
  }

  // removes the apartment with the specified id
  removeApt(id) {
    this.setState({
      apartments: this.state.apartments.filter(apt => apt.id !== id)
    });
  }

  // Removes all apartments from the state
  clearApts() {
    this.setState({
      apartments: []
    })
  }

  // Generates a unique ID for a new apartment
  generateAptID() {
    var exists = true;
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var ID = "";

    while (exists) {

      // Generate ID
      ID = "";
      for (var i=0; i<10; i++)
        ID += chars.charAt(Math.floor(Math.random() * chars.length));

      // Check if ID already exist
      for (var j=0; j<this.state.apartments.length; j++)
        if (ID === this.state.apartments[j].id)
          exists = true;
      exists = false;
    }
    return ID;
  }

  // Handles the change of scenario parameters with specified name and value
  changeScenarioParam(name, value) {
    console.log("changed " + name + " to " + value);
    this.setState({
      scenario: {
        ...this.state.scenario, [name]: value
      }
    });
  }

  // Updates the number of iterations for running repeated simulations (if within valid range)
  updateRepeatIterations(iterations) {
    this.setState({
      repeatedSimulation: {...this.state.repeatedSimulation,
        iterations: iterations
      }
    });
  }

  // Updates an apartment with the given ID, replacing its current appliance
  // runs, number of people, and size. If 'useOnAllApts' is true
  // then all apartments gets the new values.
  updateApartment(aptID, newRuns, people, m2, useOnAllApts) {
    let apts = [...this.state.apartments];
    if (!useOnAllApts) {
      // Save values for one apartment (with aptID)
      let index = apts.findIndex(apt => apt.id === aptID);
      apts[index] = {...apts[index],
        applianceRuns: newRuns,
        nPeople: people,
        m2: m2
      };
    } else {
      // Save values for all apartments
      for (let i=0; i<apts.length; i++) {

        // Make copies with new unique IDs for each appliance run
        let newRunsCopied = [];
        for (let applianceRun of newRuns)
          newRunsCopied.push(applianceRun.copy());

        apts[i] = {...apts[i],
          applianceRuns: newRunsCopied,
          nPeople: people,
          m2: m2
        };
      }

    }
    this.setState({ apartments: apts });
  }

  // Marks the result chart of single simulation as updated
  markChartAsUpdated() {
    this.setState({
      simulation: {...this.state.simulation, updateChart: false}
    })
  }

  // Starts one iteration of the simulation
  startSimulation() {
    console.log(this.state);

    // Mark simulation as "loading", and reset any previous results
    this.setState({
      simulation: {...this.state.simulation,
        loading: true,
        result: ""
      }
    });

    // Also reset previous result of repeated simulations
    this.setState({repeatedSimulation: {...this.state.repeatedSimulation, result: ""}});

    let app = this;
    let requestBody = {
      scenario: this.state.scenario,
      apartments: this.state.apartments,
    };

    // handle simulation results in a SingleSimulationResult object
    let singleSimulationResult = new SingleSimulationResult();
    singleSimulationResult.setScenario(this.state.scenario);
    singleSimulationResult.setApartments(this.state.apartments);

    // Start a simulation by sending a POST request to the SolarSim API
    fetch(API_URL + "/start", {
      method: "POST",
      body: JSON.stringify(requestBody)
    }).then(function(response) {
      response.json().then(function(data) {
        console.log('API response:', data);

        singleSimulationResult.addResult(data.production, data.consumption);
        singleSimulationResult.prepare();

        app.setState({
          simulation: {...app.state.simulation,
            loading: false,
            updateChart: true,
            result: singleSimulationResult
          }
        });
      }).catch(function(error) {
        // Errors caught due to invalid json in response
        app.setState({ simulation: {...app.state.simulation, loading: false} });
        alert("Sorry, an unexpected error occurred. \nPlease try again later.");
        console.error('An error occurred when starting the simulation:\n', error);
      })
    }).catch(function (error) {
      // Errors caught due to failed fetch
      app.setState({ simulation: {...app.state.simulation, loading: false} });
      alert("Sorry, the simulation is currently down. \nPlease try again later.");
      console.error('An error occurred when starting the simulation:\n', error);
    });
  }

  // Runs simulations a specified number of iterations and returns a result object
  repeatSimulation() {
    // Mark the repeated simulation as loading, and reset any previous results
    this.setState({
      repeatedSimulation: {...this.state.repeatedSimulation,
        loading: true,
        result: ""
      }
    });

    // Also reset previous result of single simulations
    this.setState({simulation: {...this.state.simulation, result: ""}});

    let app = this;
    let requestBody = {
      scenario: this.state.scenario,
      apartments: this.state.apartments,
    };

    // Controller for canceling requests
    let abortController = new AbortController();
    let abortSignal = abortController.signal;

    // handle simulation results in a repeatedSimulationResult object
    let repeatedSimulationResult = new RepeatedSimulationResult();
    repeatedSimulationResult.setScenario(this.state.scenario);
    repeatedSimulationResult.setApartments(this.state.apartments);

    // Repeat running simulations until specified number of iterations in state is reached
    for (let i=0; i<this.state.repeatedSimulation.iterations; i++) {

      // Start a simulation by sending a POST request to the SolarSim API
      fetch(API_URL + "/start", {
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: abortSignal
      }).then(function(response) {
        response.json().then(function(data) {
          console.log('API response:', data);

          repeatedSimulationResult.addResult(data.production, data.consumption);

          app.setState({
            repeatedSimulation: {...app.state.repeatedSimulation,
              iterationsComplete: app.state.repeatedSimulation.iterationsComplete += 1,
              progress: (100 / app.state.repeatedSimulation.iterations) *
                app.state.repeatedSimulation.iterationsComplete,
            }
          }, () => {
            if (app.state.repeatedSimulation.iterationsComplete === app.state.repeatedSimulation.iterations) {
              repeatedSimulationResult.prepare();
              app.setRepeatedSimulationResult(repeatedSimulationResult);
            }
          });

        // Catch errors due to invalid json in response
        }).catch(function(error) {
          abortController.abort();
          app.setRepeatedSimulationResult("");
          console.error('An error occurred when starting the simulation:\n', error);

          if (i === app.state.repeatedSimulation.iterations - 1)
            alert("Sorry, an unexpected error occurred. \nPlease try again later.");
        })

      // Catch errors due to failed fetch
      }).catch(function (error) {
        abortController.abort();
        app.setRepeatedSimulationResult("");
        console.error('An error occurred when starting the simulation:\n', error);

        if (i === app.state.repeatedSimulation.iterations - 1)
          alert("Sorry, an unexpected error occurred. \nPlease try again later.");
      });

    }

  }

  // Set result of repeated simulation in state and reset progress information
  setRepeatedSimulationResult(result) {
    this.setState({
      repeatedSimulation: {...this.state.repeatedSimulation,
        result: result,
        iterationsComplete: 0,
        progress: 0,
        loading: false
      }
    });
  }

  render() {
    return (
      <div className="App">

        {/* Top navigation and info bar */}
        <AppBar position="static">
          <Toolbar>
            <div style={{fontSize:32, flexGrow:1}}>
              S
              <img src={sunnyImage} alt="sun" width={30} style={{verticalAlign: -5}}/>
              larSim
            </div>
            <div className="appBarLink" onClick={this.openAboutDialog}>
              About
            </div>
            <div className="appBarLink" onClick={this.openHowItWorksDialog}>
              How it works
            </div>
          </Toolbar>
        </AppBar>

        {/* Information dialogs */}
        <AboutDialog
          open = {this.state.aboutDialogOpen}
          handleClose = {this.closeDialogs} />

        <HowItWorksDialog
          open = {this.state.howItWorksDialogOpen}
          handleClose = {this.closeDialogs} />

        {/* Large screens */}
        <MediaQuery minWidth={900}>
          <div className="paramColumn">
            <ScenarioSelecter
              start = {this.startSimulation}
              repeatedStart = {this.repeatSimulation}
              changeScenarioParam = {this.changeScenarioParam}
              updateRepeatIterations = {this.updateRepeatIterations}
              scenario = {this.state.scenario}
              apartments = {this.state.apartments}
              simulation = {this.state.simulation}
              repeatedSimulation = {this.state.repeatedSimulation}/>
          </div>
          <div className="contentColumn">
            <Simulation
              scenario = {this.state.scenario}
              apartments = {this.state.apartments}
              addApt = {this.addApartment}
              clearApts = {this.clearApts}
              simulation = {this.state.simulation}
              repeatedSimulation = {this.state.repeatedSimulation}
              removeApt = {this.removeApt}
              updateApartment = {this.updateApartment}
              mobileScreen = {false}
              markChartAsUpdated = {this.markChartAsUpdated} />
          </div>
        </MediaQuery>

        {/* Small screens */}
        <MediaQuery maxWidth={899}>
          <ScenarioSelecterMobile
            start = {this.startSimulation}
            repeatedStart = {this.repeatSimulation}
            changeScenarioParam = {this.changeScenarioParam}
            updateRepeatIterations = {this.updateRepeatIterations}
            scenario = {this.state.scenario}
            apartments = {this.state.apartments}
            simulation = {this.state.simulation}
            repeatedSimulation = {this.state.repeatedSimulation}/>
          <Simulation
            scenario = {this.state.scenario}
            apartments = {this.state.apartments}
            addApt = {this.addApartment}
            clearApts = {this.clearApts}
            simulation = {this.state.simulation}
            repeatedSimulation = {this.state.repeatedSimulation}
            removeApt = {this.removeApt}
            updateApartment = {this.updateApartment}
            mobileScreen = {true}
            markChartAsUpdated = {this.markChartAsUpdated} />
        </MediaQuery>

      </div>

    );

  }
}

export default App;
