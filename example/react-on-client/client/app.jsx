import { React, ReactDOM } from './dependencies.ts';
import Counter from './counter.jsx';

const App = () => {
    return <Counter initialValue={10}/>;
};
ReactDOM.render( <App />, document.querySelector('#app'));
