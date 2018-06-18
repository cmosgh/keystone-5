import { Component } from 'react';

function getJSON(url) {
  return fetch(url, {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

function postJSON(url, data = {}) {
  return fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json());
}

class Session extends Component {
  state = {
    session: {},
    isLoading: true,
  };

  componentDidMount() {
    const { autoSignout, loadSession } = this.props;
    if (autoSignout) {
      this.signOut();
    } else {
      this.getSession();
    }
  }

  getSession = () => {
    const { sessionPath } = this.props;
    // Avoid an extra re-render
    if (!this.state.isLoading) {
      this.setState({ isLoading: true });
    }
    getJSON(sessionPath).then(data => {
      this.setState({ session: data, isLoading: false });
    });
  };

  signIn = ({ username, password }) => {
    const { signinPath } = this.props;
    postJSON(signinPath, { username, password })
      .then(() => this.getSession())
      .catch(error => console.error(error));
  };

  signOut = () => {
    const { signoutPath } = this.props;
    this.setState({ isLoading: true });
    postJSON(signoutPath)
      .then(() => this.getSession())
      .catch(error => console.error(error));
  };

  render() {
    const { signIn, signOut } = this;
    const { children } = this.props;
    const {
      session: { user, signedIn: isSignedIn },
      isLoading,
    } = this.state;

    return children({
      isLoading,
      isSignedIn,
      signIn,
      signOut,
      user,
    });
  }
}

export default Session;
