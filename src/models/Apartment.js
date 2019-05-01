/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import ApplianceRun from "./ApplianceRun.js";

// Represents an apartment
class Apartment {

  constructor(id, nPeople, m2) {
    this.id = id;
    this.nPeople = nPeople;
    this.m2 = m2;

    // Generate default appliance runs for this apartment
    this.applianceRuns = [
      new ApplianceRun("wm", "40°", "07:00", "21:00"),
      new ApplianceRun("dw", "normal", "07:00", "21:00")
    ];
  }

}

export default Apartment;
