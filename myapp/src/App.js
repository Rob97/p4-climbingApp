import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import { PieChart, Pie, Cell } from 'recharts';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { NavLink } from 'react-router-dom';


//Renders the website
class App extends Component {

  constructor() {
    super();
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUser = this.handleUser.bind(this);
    this.state = {
      user: ''
    };
  }

  //Handles Logout
  handleLogout() {
    this.setState({
      user: ''
    });
    firebase.auth().signOut()
      .catch((err) => {
        console.log(err)
      })
  }

  handleUser(data) {
    this.setState({
      user: data
    });
  }

  //Renders Header and Nav Links to other parts of the website
  render() {
    return (
      <div>
        <header>

          <Router>
            <div className="nav">
              <NavLink activeClassName="active" to="/"><h1>Find your Climb!</h1></NavLink>
              {this.state.user !== '' &&
                <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/profile">
                  <div className="pageslabel">Profile</div>
                </NavLink>
              }

              <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/routes">
                <div className="pageslabel">Routes</div>
              </NavLink>
              <NavLink activeClassName="active" activeStyle={{ color: 'grey', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/about">
                <div className="pageslabel">Types</div>
              </NavLink>
              {this.state.user === '' ?
                <NavLink activeClassName="active" activeStyle={{ color: 'black', borderBottom: '1px solid grey' }} style={{ color: 'white' }} to="/login">
                  <div className="pageslabel">Login</div>
                </NavLink>
                :
                <button className="btn" onClick={this.handleLogout}>Logout</button>
              }
              <Route exact path="/" component={WelcomePage} />
              {this.state.user === '' ?
                <Route path="/routes" render={(props) => (
                  <RoutesPage {...props} uid='' />
                )} />
                :
                <Route path="/routes" render={(props) => (
                  <RoutesPage {...props} uid={this.state.user.uid} />
                )} />
              }
              <Route path="/login" render={(props) => (
                <LoginPage {...props} handlerFromParent={this.handleUser} />
              )} />
              <Route path="/about" component={AboutPage} />
              <Route path="/profile" render={(props) => (
                <ProfilePage {...props} uid={this.state.user.uid} user={this.state.user} />
              )} />
            </div>
          </Router>
        </header>
      </div>
    );
  }
}

//Renders the homepage
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

//Renders the login page
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
        //    this.props.history.push("/routes");
        this.setState({
          user: firebaseUser,
          errorMessage: '',
          email: '',
          password: '',
          username: ''
        });
        this.props.handlerFromParent(this.state.user);
      }
      else {
        this.setState({ user: null }); //null out the saved state
      }
    })
  }
  componentWillUnmount() {
    this.stopWatchingAuth();
  }

  //Function that signs user up and stores their data in firebase
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
      .then(user => {
        this.setState({
          user: user
        })
      })
      .catch((err) => {
        console.log(err.message)
        this.setState({ errorMessage: err.message })
      });
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
          {/* <button className="btn btn-warning mr-2" onClick={() => this.handleSignOut()}>
            Sign Out
                </button> */}
        </div>
      </div>
    );
  }
}

//skykomish valley
//Default numbers for when website is first rendered
const DEFAULTS = {
  lat: '47.8207',
  lon: '-121.5551',
  numRoutes: 200,
  maxDist: 10
};

//Renders the page that shows routes
class RoutesPage extends Component {

  constructor(props) {
    super(props);
    this.loadData(DEFAULTS.lat, DEFAULTS.lon, DEFAULTS.numRoutes, DEFAULTS.maxDist)
  }

  //Brings the data from the mountain project.com using an api call
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
              <ClimbList uid={this.props.uid} routes={this.state && this.state.routes ? this.state.routes : []} />
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

//The card that shows the data of the rock climbing areas
class ClimbCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isHidden: true,
      likes: ''
    }
  }
  toggleHidden() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }


  //Counts the number of likes per location and stores it on firebase
  countLikesToFireBase() {

    firebase.database().ref('Post/' + this.props.id + "/Likes").transaction(function (Likes) {
      console.log("likes", Likes);
      if (Likes) {

        Likes = Likes + 1;
      } else {
        Likes = 1;
      }
      return Likes;
    });

  }


  //Saves a location that the user chose on firebase so that it can be viewed on their profile later
  pushLikeToFireBase() {
    let UserRef = firebase.database().ref('Users');
    let dataName = this.props.name;
    let foundKey = false;
    Object.keys(UserRef).forEach((key) => {
      if (key === this.props.uid) {
        foundKey = true;
        UserRef.child(key).child('Climbs').push({
          Name: this.props.name,
          Type: this.props.type,
          Rating: this.props.rating,
          Stars: this.props.stars,
          Pitches: this.props.pitches,
          Location: this.props.location,
          Image: this.props.img,
          Id: this.props.id

        }).catch(err => console.log(err));
      }
    }
    )
    if (!foundKey) {
      firebase.database().ref('Users/' + this.props.uid + '/Climbs/' + this.props.id + "/").set(
        {
          Name: this.props.name,
          Type: this.props.type,
          Rating: this.props.rating,
          Stars: this.props.stars,
          Pitches: this.props.pitches,
          Location: this.props.location,
          Image: this.props.img,
          Id: this.props.id
        }
      ).catch(err => console.log(err));
    }

    foundKey = false;
  }


  componentDidMount() {
    firebase.database().ref('Post/' + this.props.id + "/Likes").on('value', (snapshot) => {
      this.setState({
        likes: snapshot.val()
      });
    })
  }

  render() {
    console.log(this.props.uid)
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
            <p className="card-text">Likes:  {this.state.likes === '' ? "0" : this.state.likes}</p>
            {this.props.uid === '' &&

              <NavLink activeClassName="active" to="/login"><button className="btn default-btn">Login to Add to your profile! </button> </NavLink>
            }
            {this.props.uid !== '' &&
              <button className="btn default-btn" onClick={(event) => { event.cancelBubble = true; this.pushLikeToFireBase() }}> Add To Profile</button>

            }
            {this.props.uid !== '' &&
              <button className="btn default-btn" onClick={(event) => { event.cancelBubble = true; this.countLikesToFireBase() }}> I LIKED THIS</button>

            }
          </div>

        }

      </div>
    )
  }
}


//Generates a list of card climbing routes and the pie chart
class ClimbList extends React.Component {
  render() {

    let dict = _(this.props.routes)
      .countBy('type')
      .value()
    let arr = [];
    let combined = 0;
    Object.keys(dict).forEach((key) => {
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
              <ClimbCard uid={this.props.uid} key={climb.id} id={climb.id} img={climb.imgSmallMed} name={climb.name} type={climb.type}
                rating={climb.rating} stars={climb.stars} pitches={climb.pitches} location={climb.location[2]} />)
          }
        </div>
      </div>
    );
  }
}


// Takes in the user entered parameters and renders the form to submit them in
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
          <input className="btn" type="submit" value="Submit" />
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
        <div className="locations">
          <h5>SmithRock</h5>
          <p>Lat: 44.3682</p>
          <p>Lon: -121.1406</p>
        </div>
      </div>
    );
  }
}


//Renders the about page containing information on types of bouldering
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

//Redners the profile page which holds the user's saved climbing routes
class ProfilePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      climbs: ''
    }
  }

  componentDidMount() {
    if (this.props.uid !== undefined) {
      let ref = firebase.database().ref('Users').child(this.props.uid).child('Climbs');
      ref.on('value', (snapshot) => {
        this.setState({
          climbs: snapshot.val()
        });
        console.log(this.state.climbs);

        console.log(snapshot.val())
      })

    }
  }

  render() {
    return (

      < div >
        <h1> Welcome to your Profile!</h1>
        <h2> Here are your saved climbs!</h2>
        <main className="container">
          <div className="row">

            {this.state.climbs !== null &&
              Object.keys(this.state.climbs).map((climb) =>
                // console.log(this.state.climbs[climb]))
                < ClimbCard uid={this.props.uid} key={this.state.climbs[climb].Id} id={this.state.climbs[climb].Id} img={this.state.climbs[climb].Image} name={this.state.climbs[climb].Name} type={this.state.climbs[climb].Type}
                  rating={this.state.climbs[climb].Rating} stars={this.state.climbs[climb].Stars} pitches={this.state.climbs[climb].Pitches} location={this.state.climbs[climb].Location} />)
            }

          </div>
        </main>
      </div >
    );
  }
}
export default App;
