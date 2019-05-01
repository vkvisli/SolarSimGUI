/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/


// This class represents the results of repeated simulations with the same configuration
// and contains information about the scenario, apartments, and simulation results
class RepeatedSimulationResult {

  constructor() {
    this.scenario = {};
    this.apartments = [];
    this.simulationResults = [];
    this.displayObjects = [];
  }

  // Set scenario
  setScenario(scenario) {
    this.scenario = scenario;
  }

  // Set apartments
  setApartments(apartments) {
    this.apartments = apartments;
  }

  // Adds the result of one simulation, in the form of production and consumption objects
  addResult(production, consumption) {
    this.simulationResults.push(
      {
        production: production,
        consumption: consumption
      }
    );
  }

  // Call this method when done adding results. It calculates various information
  // based on the given results, and adds it to display objects
  prepare() {
    for (let result of this.simulationResults) {
      this.displayObjects.push({
        totalProductionkWh: result.production.cProductionProfile[result.production.cProductionProfile.length-1],
        totalConsumptionkWh: result.consumption.cConsumptionProfile[result.consumption.cConsumptionProfile.length-1],
        productionMinuteInterval: result.production.productionInterval,
        consumptionMinuteInterval: result.consumption.consumptionInterval,
        productionProfile: result.production.cProductionProfile,
        consumptionProfile: result.consumption.cConsumptionProfile
      });
    }
  }

  // Return a pretty string representation of this object
  toPrettyString() {
    let returnObject = {
      scenario: this.scenario,
      apartments: this.apartments,
      simulationResults: this.displayObjects
    };

    return JSON.stringify(returnObject, null, "\t");
  }

}

export default RepeatedSimulationResult;