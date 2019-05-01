/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React, { Component } from 'react';
import '../styles/compStyles.css';
import sunnyImage from "../images/sunny.png";
import partiallyCloudyImage from "../images/partially_cloudy.png";
import cloudyImage from "../images/cloudy.png";
import rainyImage from "../images/rainy.png";

// Component for the weather icon
class WeatherIcon extends Component {

  render() {
    // Check which icon to display
    var iconToShow = "";
    var size = this.props.size;
    switch (this.props.weather) {
      case "sunny":
        iconToShow = (<img src={sunnyImage} alt="sun" width={size}/>);
        break;
      case "partially cloudy":
        iconToShow = (<img src={partiallyCloudyImage} alt="partially cloudy" width={size}/>);
        break;
      case "cloudy":
        iconToShow = (<img src={cloudyImage} alt="cloud" width={size}/>);
        break;
      case "rainy":
        iconToShow = (<img src={rainyImage} alt="rain" width={size}/>);
        break;
      default:
        console.log("Invalid weather parameter!");
    }
    return iconToShow;
  }
}

export default WeatherIcon;
