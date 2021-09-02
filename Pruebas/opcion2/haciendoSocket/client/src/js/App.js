import "../css/App.css";
import { Route } from "react-router-dom";
import Homepage from "./../components/Homepage";
import Lacman from "./../components/ComponentsGame/Game";

const App = () => {
  return (
    <div className="App">
      <Route path="/" exact component={Homepage} />
      <Route path="/game" exact component={Lacman} />
    </div>
  );
};

export default App;
