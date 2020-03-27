var React = require('react'); /* importing react */

class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}
module.exports = Hello
