/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

// This class represents the results of one simulation and contains
// information about the scenario, apartments, and simulation results
class SingleSimulationResult {

  constructor() {
    this.scenario = {};
    this.apartments = [];
    this.simulationResults = {};
    this.displayObject = {};
  }

  // Set scenario
  setScenario(scenario) {
    this.scenario = scenario;
  }

  // Set apartments
  setApartments(apartments) {
    this.apartments = apartments;
  }

  // Adds the result of the simulation, in the form of production and consumption objects
  addResult(production, consumption) {
    this.simulationResults = {
      production: production,
      consumption: consumption
    };
  }

  // Call this method after adding the result. It calculates various information
  // based on the given results, and adds it to a display object
  prepare() {
    const prod = this.simulationResults.production;
    const cons = this.simulationResults.consumption;

    this.displayObject = {
      totalProductionkWh: prod.cProductionProfile[prod.cProductionProfile.length-1],
      totalConsumptionkWh: cons.cConsumptionProfile[cons.cConsumptionProfile.length-1],
      productionMinuteInterval: prod.productionInterval,
      consumptionMinuteInterval: cons.consumptionInterval,
      productionProfile: prod.cProductionProfile,
      consumptionProfile: cons.cConsumptionProfile
    };
  }

  // Return a pretty string representation of this object
  toPrettyString() {
    let returnObject = {
      scenario: this.scenario,
      apartments: this.apartments,
      simulationResults: this.displayObject,
    };

    return JSON.stringify(returnObject, null, "\t");
  }

}

export default SingleSimulationResult;