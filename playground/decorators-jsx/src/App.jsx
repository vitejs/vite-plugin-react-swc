import { Component } from "react";

function decorated(target) {
  const original = target.prototype.render;

  target.prototype.render = () => {
    return <div>Hello {original()}</div>;
  };
}

@decorated
class App extends Component {
  render() {
    return <span>World</span>;
  }
}

export default App;
