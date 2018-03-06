import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import { PieChart, Pie, Cell } from 'recharts';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

class App extends Component {

  constructor() {
    super();
    this.handleData = this.handleData.bind(this);
    this.state = {
      email: '',
    };
  }

  handleData(data) {
    this.setState({
      email: data
    });
  }

  render() {
    return (
      <div>
        <header>
          <Router>
            <div className="nav">
              <NavLink activeClassName="active" to="/"><h1>Find your Climb!</h1></NavLink>
              {/* {firebase.auth().fetchProvidersForEmail(this.state.email)
                .then(providers => {
                  if (providers.length === 0) {

                  } else {
                    <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/routes">
                      <div className="pageslabel">Profile</div>
                    </NavLink>
                  }
                })} */}
              <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/routes">
                <div className="pageslabel">Routes</div>
              </NavLink>
              <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/about">
                <div className="pageslabel">Types</div>
              </NavLink>
              <NavLink activeClassName="active" activeStyle={{ color: 'black', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/login">
                <div className="pageslabel">Login</div>
              </NavLink>
              <Route exact path="/" component={WelcomePage} />
              <Route path="/routes" component={RoutesPage} />

              <Route path="/login" render={(props) => (
                <LoginPage {...props} handlerFromParent={this.handleData} />
              )} />
              <Route path="/about" component={AboutPage} />
            </div>
          </Router>
        </header>
      </div>
    );
  }
}

class WelcomePage extends Component {
  render() {
    return (
      <div className="welcomecontent">
        <h1>
          Welcome!
        </h1>
        <img className="stickyimg" src={require('./img/homeimg.jpg')} alt="sunset climber"></img>
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
        this.props.handlerFromParent(this.state.email);
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
          <label>Email: </label>
          <input className="form-control"
            name="email"
            value={this.state.email}
            onChange={(event) => { this.handleChange(event) }}
          />
        </div>

        <div className="form-group">
          <label>Password: </label>
          <input type="password" className="form-control"
            name="password"
            value={this.state.password}
            onChange={(event) => { this.handleChange(event) }}
          />
        </div>

        <div className="form-group">
          <label>Username: </label>
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

//skykomish valley
const DEFAULTS = {
  lat: '47.8207',
  lon: '-121.5551',
  numRoutes: 200,
  maxDist: 10
};

class RoutesPage extends Component {

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
  constructor(props) {
    super(props)
    this.state = {
      isHidden: true,

    }
  }
  toggleHidden() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }
  // componentWillMount() {
  //   this.firebaseRef = new Firebase("https://ReactFireTodoApp.firebaseio.com/items/");
  //   this.firebaseRef.on("child_added", function (dataSnapshot) {
  //     this.items.push(dataSnapshot.val());
  //     this.setState({
  //       items: this.items
  //     });
  //   }.bind(this));
  // }

  pushLikeToFireBase() {
    console.log("IM PUSHING");
    let UserRef = firebase.database().ref('Users');
    let dataName = this.props.name;
    Object.keys(UserRef).forEach((key) => {

      if (key === this.state.email) {
        UserRef.child(key).child('Climbs').push({
          Name: this.props.name,
          Type: this.props.type,
          Rating: this.props.rating,
          Stars: this.props.stars,
          Pitches: this.props.pitches,
          Location: this.props.location

        }).catch(err => console.log(err));
      } else {
        firebase.database().ref('Users/' + key).set(

          {
            'Climbs':
              {
                dataName: {
                  Name: this.props.name,
                  Type: this.props.type,
                  Rating: this.props.rating,
                  Stars: this.props.stars,
                  Pitches: this.props.pitches,
                  Location: this.props.location
                }

              }
          }


        ).catch(err => console.log(err));
      }
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
        {<button onClick={(event) => { event.cancelBubble = true; this.pushLikeToFireBase() }}> I Like</button>}
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

    //Generates random colors (from stackOverflow)
    function getRandomColor() {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      return color;
    }

    let colorArray = [];
    for (let i = 0; i < 5; i++) {
      colorArray[i] = getRandomColor();
    }

    return (
      <div>
        <PieChart width={400} height={250}>
          <Pie startAngle={0} endAngle={-90} dataKey="value" nameKey="name" data={arr} cx={-5} cy={-5}
            outerRadius={200} innerRadius={180} label={(something) => something.name} >

            <Cell key={`cell-${0}`} fill={colorArray[0]} />



            <Cell key={`cell-${1}`} fill={colorArray[1]} />

            <Cell key={`cell-${2}`} fill={colorArray[2]} />


            <Cell key={`cell-${3}`} fill={colorArray[3]} />
            <Cell key={`cell-${4}`} fill={colorArray[4]} />



          </Pie>
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

class AboutPage extends Component {

  render() {
    return (
      <div className="about">
        <section>
          <h2>Bouldering</h2>
          <img className="stickyimg" src={require('./img/outdoorbouldering.jpg')} alt="outdoor bouldering climbers and a crash pad"></img>
          <p>Bouldering is one of the most popular styles of climbing as it requires the least amount of equipment - climbing shoes and chalk. Instead of using ropes for protection,
            bouldering relies on relatively shorter routes(no more than 20 feet tall) and padded mats, known as crash pads, to absorb falls from the ground. These pads are usually
            smaller than indoor crash pads and can be folded for ease of carry on approaches. Bouldering in North America is graded strictly on difficulty through the V-scale.
            The V-scale ranks from V0(easiest) to V16(hardest). Difficulty is highly variable depending on factors such as the spacing between holds and their physical attributes.</p>
        </section>
        <section>
          <h2>Top Roping</h2>
          <img className="stickyimg" src={require('./img/outdoortoprope.jpg')} alt="an outdoor top rope climber crack climbing"></img>
          <p>Top rope climbs utilize ropes anchored at the top of the route and belayed (reducing fall distance by placing tension on the rope) by a partner at the bottom.
            Due to the fall protection of the rope, top rope routes are generally much taller than bouldering routes. Top roping allows climbers to fall and continue, since
            the top rope allows the climber to hang at or close to the height of the fall. North American top rope routes are graded using the Yosemite Decimal System (YDS).
            YDS ranges from 5.0 to 5.15d, easiest to hardest respectively. Outdoor top rope climbing is generally employed when there are no bolts or rock quality is not adequate enough for
            lead climbing and can employ the use of tree anchors. It is also possible to hike to the top, set the rope, and then hike down for the climb.</p>
        </section>
        <section>
          <h2>Lead (Sport) Climbing</h2>
          <img className="stickyimg" src={require('./img/outdoorlead.jpg')} alt="an outdoor lead climber climbing"></img>
          <p>Most outdoor climbs are lead climbs, where the lead climber will clip into bolts and then create an anchor on the
              top while being belayed from the ground. Most outdoor lead climbs won't have quick-draws to clip into the bolts,
            so they must be carried with the climber. The difficulty of a Lead climb is graded on the Yosemite Decimal System (5.0 to 5.15d).</p>
        </section>
        <section>
          <h2>Trad Climbing</h2>
          <img className="stickyimg" src={require('./img/cams.jpg')} alt="two people with trad climbing gear"></img>
          <p>Trad climbing, short for traditional, employs removable protection that will be placed by the first climber and removed
              by the final climber. These climbs use equipment such as nuts and cams (attached to the harness of the person
              on the right in the image above) that wedge into fissures to provide for anchors. Trad climbing emphasizes exploration,
            as it does not require a predefined route. However, trad climbing, for this reason, can be much more dangerous.
            The difficulty of a Lead climb is graded on the Yosemite Decimal System (5.0 to 5.15d).</p>
        </section>
        <section>
          <h2>Aid Climbing</h2>
          <img className="stickyimg" src={require('./img/aid.jpg')} alt="an outdoor aid climber using a ladder"></img>
          <p>Aid climbing is performed by attaching devices to routes in order to stand on or aid towards upward climbing. This
              most commonly done on climbs that are to difficult for free climbing. This type of climbing is popular when ascending
            large walls such as those in Yosemite.</p>
        </section>
        <footer>
          <p>More basic information about the different climbing styles and skills can be found in this
            <a href="https://www.outsideonline.com/2062326/beginners-guide-rock-climbing">website</a>.
        </p>
        </footer>
      </div>
    );
  }

}

export default App;
