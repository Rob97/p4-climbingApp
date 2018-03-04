import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import { PieChart, Pie } from 'recharts';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';



//skykomish valley
const DEFAULTS = {
  lat: '47.8207',
  lon: '-121.5551',
  numRoutes: 200,
  maxDist: 10
};

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <div className="container">
            <Link to="/">Home</Link>
            {' '}
            <Link to="/login">Login</Link>
            <Route exact path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
          </div>
        </Router>
      </div>
    );
  }
}

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      username: ''
    };
  }
  componentDidMount() {
    this.stopWatchingAuth = firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.setState({
          user: firebaseUser,
          errorMessage: '',
          email: '',
          password: '',
          username: ''
        });
      }
      else {
        this.setState({ user: null }); //null out the saved state
      }
    })
  }
  handleSignUp() {

    /* Create a new user and save their information */
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(firebaseUser => {
        //include information (for app-level content)
        let profilePromise = firebaseUser.updateProfile({
          displayName: this.state.username,
        }); //return promise for chaining

        return profilePromise;
      })
      .then(firebaseUser => {
        this.setState({
          user: firebase.auth().currentUser
        })
      })
      .catch((err) => {
        console.log(err);
        this.setState({ errorMessage: err.message })
      })
  }
  handleSignIn() {
    //A callback function for logging in existing users


    /* Sign in the user */
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .catch((err) => {
        console.log(err)
        this.setState({ errorMessage: err.message })
      });

  }

  handleSignOut() {
    this.setState({ errorMessage: null }); //clear old error

    /* Sign out the user, and update the state */
    firebase.auth().signOut()
      .then(() => {
        this.setState({ user: null }); //null out the saved state
      })
      .catch((err) => {
        console.log(err)
        this.setState({ errorMessage: err.message })
      })
  }

  handleChange(event) {
    let field = event.target.name; //which input
    let value = event.target.value; //what value

    let changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }


  render() {
    return (
      <div className="container">
        {this.state.errorMessage &&
          <p className="alert alert-danger">{this.state.errorMessage}</p>
        }

        {this.state.user &&
          <div className="alert alert-success"><h1>Logged in as {this.state.user.displayName}</h1></div>
        }

        <div className="form-group">
          <label>Email:</label>
          <input className="form-control"
            name="email"
            value={this.state.email}
            onChange={(event) => { this.handleChange(event) }}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" className="form-control"
            name="password"
            value={this.state.password}
            onChange={(event) => { this.handleChange(event) }}
          />
        </div>

        <div className="form-group">
          <label>Username:</label>
          <input className="form-control"
            name="username"
            value={this.state.username}
            onChange={(event) => { this.handleChange(event) }}
          />
        </div>

        <div className="form-group">
          <button className="btn btn-primary mr-2" onClick={() => this.handleSignUp()}>
            Sign Up
                 </button>
          <button className="btn btn-success mr-2" onClick={() => this.handleSignIn()}>
            Sign In
                </button>
          <button className="btn btn-warning mr-2" onClick={() => this.handleSignOut()}>
            Sign Out
                </button>
        </div>
      </div>
    );
  }
}

class HomePage extends Component {

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
