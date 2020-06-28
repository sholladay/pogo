import { React } from './dependencies.ts'

const Counter = (props) => {
    const { initialValue = 0 } = props
    const [count, setCount] = React.useState(initialValue);
    const increaseCount = () => {
        setCount(count + 1)
    }
    const decreaseCount = () => {
        setCount(count - 1)
    }
    return (
        <>
            <h1>Count: {count}</h1>
            <button onClick={increaseCount}>Increase count</button>
            <button onClick={decreaseCount}>DecreaseCount count</button>
        </>
    )
}

export default Counter