/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

// Represents an appliance run/load/cycle
class ApplianceRun {

  constructor(code, program, earliestStart, doneBy) {
    this.id = this.generateID();
    this.code = code.toLowerCase();
    this.program = program;
    this.earliestStart = earliestStart;
    this.doneBy = doneBy;

    // Set displayName according to code
    this.displayName = "";
    switch (code) {
      case "wm":
        this.displayName = "Washing machine"; break;
      case "dw":
        this.displayName = "Dishwasher"; break;
      default:
        this.displayName = "Unknown appliance";

    }
  }

  generateID() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var ID = "";
    for (let i=0; i<10; i++)
      ID += chars.charAt(Math.floor(Math.random() * chars.length));
    return ID;
  }

  // Returns an appliance with the same properties as this, but with a new unique ID
  copy = function() {
    return new ApplianceRun(this.code, this.program, this.earliestStart, this.doneBy);
  }

}

export default ApplianceRun;
