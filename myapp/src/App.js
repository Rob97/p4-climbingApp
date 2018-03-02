import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import { PieChart, Pie } from 'recharts';

//skykomish valley
const DEFAULTS = {
  lat: '47.8207',
  lon: '-121.5551',
  numRoutes: 200,
  maxDist: 10
};

class App extends Component {

  constructor(props) {
    super(props);
    this.loadData(DEFAULTS.lat, DEFAULTS.lon, DEFAULTS.numRoutes, DEFAULTS.maxDist)
  }

  loadData(lat, lon, numRoutes, maxDist) {
    let url = "https://www.mountainproject.com/data/get-routes-for-lat-lon?key=200219054-5692fe76fab0e0f8dbdddb64cba1f33b&lat=" + lat + "&lon=" + lon + "&maxDistance=" + maxDist + "&maxResults=" + numRoutes;
    fetch(url)
      .then((responseText) => responseText.json())
      .then((response) => {
        this.setState({ routes: response.routes })
      })
  }

  handleSubmit(latLongParams) {
    const lat = latLongParams.latValue
    const lon = latLongParams.lonValue
    const maxDist = latLongParams.maxDist
    const numRoutes = latLongParams.numRoutes

    this.loadData(lat, lon, numRoutes, maxDist)
  }


  render() {
    return (
      < div >
        <header>
          <h1>Find your Climb!</h1>
        </header>
        <main className="container">
          <div className="row">
            <div className="param">
              <ClimbParam submitForm={(latLongParams) => this.handleSubmit(latLongParams)} />
            </div>
            <div className="list">
              <ClimbList routes={this.state && this.state.routes ? this.state.routes : []} />
            </div>
          </div>
        </main>
        <footer>
          <p>Data from https://www.mountainproject.com/data</p>
        </footer>
      </div >
    );
  }
}

class ClimbCard extends React.Component {
  constructor() {
    super()
    this.state = {
      isHidden: true
    }
  }
  toggleHidden() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }
  render() {
    let pitches = this.props.pitches;
    if (pitches === '') {
      pitches = "N/A";
    }
    return (
      <div className="card">
        {this.props.img !== '' &&
          <img className="card-img-top" src={this.props.img} alt={this.props.name} />
        }
        <h3 onClick={this.toggleHidden.bind(this)} className="card-title">{this.props.name}</h3>
        {!this.state.isHidden &&
          <div className="card-body">
            <p className="card-text">Type: {this.props.type}</p>
            <p className="card-text">Rating: {this.props.rating}</p>
            <p className="card-text">Stars: {this.props.stars}</p>
            <p className="card-text">Pitches: {pitches}</p>
            <p className="card-text">Location: {this.props.location}</p>
          </div>
        }
      </div>
    )
  }
}


class ClimbList extends React.Component {
  render() {

    let dict = _(this.props.routes)
      .countBy('type')
      .value()

    let arr = [];
    let combined = 0;
    Object.keys(dict).forEach((key) => {
      console.log(key, dict[key]);
      if (!key.includes(',')) {
        arr.push({ name: key, value: dict[key] })
      } else {
        combined += dict[key]
      }
    });
    combined > 0 && arr.push({ name: 'Mult.', value: combined })

    return (
      <div>
        <PieChart width={400} height={250}>
          <Pie startAngle={0} endAngle={-90} dataKey="value" nameKey="name" data={arr} cx={-5} cy={-5}
            outerRadius={200} innerRadius={180} fill="black" label={(something) => something.name} />
        </PieChart>
        <div className="head">
          <h2>Routes in the Area</h2>
          <p>Click on the titles for more info!</p>
        </div>
        <div className="card-deck">
          {
            this.props.routes.map((climb) =>
              <ClimbCard key={climb.id} img={climb.imgSmallMed} name={climb.name} type={climb.type}
                rating={climb.rating} stars={climb.stars} pitches={climb.pitches} location={climb.location[2]} />)
          }
        </div>
      </div>
    );
  }
}

class ClimbParam extends React.Component {
  constructor(props) {
    super(props);
    this.state = { latValue: DEFAULTS.lat, lonValue: DEFAULTS.lon, numRoutes: DEFAULTS.numRoutes, maxDist: DEFAULTS.maxDist };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    this.props.submitForm(this.state)
    event.preventDefault()
  }

  render() {
    return (
      <div>
        <form className="entry" onSubmit={this.handleSubmit}>
          <label>
            Latitude:
            <input type="number" step=".0001" name="latValue" value={this.state.latValue}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Longitude:
            <input type="number" step=".0001" name="lonValue" value={this.state.lonValue}
              onChange={this.handleChange}
            />
          </label>
          <label>
            # of Routes:
            <input type="number" name="numRoutes" value={this.state.numRoutes}
              onChange={this.handleChange} max="500" />
          </label>
          <label>
            Max Distance(miles):
            <input type="number" name="maxDist" value={this.state.maxDist}
              onChange={this.handleChange} />
          </label>
          <br />
          <input type="submit" value="Submit" />
        </form>
        <h4>Notable Locations:</h4>
        <div className="locations">
          <h5>Yosemite</h5>
          <p>Lat: 37.8651</p>
          <p>Lon: -119.5383</p>
        </div>
        <div className="locations">
          <h5>Joshua Tree</h5>
          <p>Lat: 33.8734</p>
          <p>Lon: -115.9010</p>
        </div>
        <div className="locations">
          <h5>Index</h5>
          <p>Lat: 47.8207</p>
          <p>Lon: -121.5551</p>
        </div>
        <div className="locations">
          <h5>Vantage</h5>
          <p>Lat: 46.9454</p>
          <p>Lon: -119.9873</p>
        </div>
      </div>
    );
  }
}

export default App;
